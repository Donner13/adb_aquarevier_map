import shutil
import http.server
import socketserver
import json
import os
import re
import base64
import hmac
import subprocess
import urllib.parse
from urllib.request import urlopen

PORT = int(os.environ.get("PORT", 8000))
# the main directory where geojsons should be written (up one level from editor_backend)
DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENC_PASSWORD = os.environ.get("CONTACTS_ENCRYPTION_KEY") or os.environ.get("ENC_PASSWORD", "AquaRevier2026")

# HTTP Basic Auth for the whole editor (this server publicly exposes contacts.geojson,
# which contains names/emails/phone numbers - must never be reachable without login).
# Override via env vars when deploying (Render secret), local default kept for dev.
EDITOR_USER = os.environ.get("EDITOR_USER", "florian")
EDITOR_PASSWORD = os.environ.get("EDITOR_PASSWORD", "AquaRevier2026")

GROUP_COLORS = {
    'Behörde': '#f43f5e', 'Einzelakteure': '#00f5d4', 'Forschung': '#3b82f6',
    'Gebietskörperschaft': '#fbbf24', 'Gewerbe/ Industrie': '#d946ef',
    'Landwirtschaft': '#10b981', 'Netzwerk/ Multiplikator': '#ff007f',
    'Ver-/ Entsorger': '#ff7300', 'Sonstige': '#8b5cf6'
}

def _clean_branch(branche):
    if not branche:
        return "Unbekannt"
    b = str(branche).strip()
    if not b:
        return "Unbekannt"
    if "Papier" in b or "Pappe" in b or "Karton" in b:
        return "Papier"
    if "Chemie" in b or "Chemische" in b or "Pigmente" in b:
        return "Chemie"
    if "Nahrungsmittel" in b:
        return "Ernährung"
    if "Textil" in b:
        return "Textil"
    if "Wasserkraft" in b:
        return "Energie"
    if "Verband" in b or "Wirtschaft" in b:
        return "Wirtschaftsverband"
    return b

def _extract_institution(name):
    """'Vorname Nachname (Institution X)' -> 'Institution X'. No parens -> return as-is."""
    m = re.match(r'^.*?\((.+)\)\s*$', name)
    return m.group(1).strip() if m else name


def build_anonymized_geojson(data):
    """Transform a full contacts FeatureCollection into the public-safe anonymized layer.

    Personal names must never appear in the public output: Einzelakteure (bare person
    names, no institution) are dropped entirely, and every other group's combined
    "Person (Institution)" name is reduced to just the institution part.
    """
    features = data.get('features', []) if isinstance(data, dict) else []
    style_settings = data.get('styleSettings', {})
    custom_colors = style_settings.get('groupColors', {})
    custom_names = style_settings.get('groupNames', {})

    gewerbe_mapping = {}
    gewerbe_counter = 1
    out_features = []

    for feature in features:
        props = feature.get('properties', {}) or {}
        name = str(props.get('name', '')).strip()
        group = str(props.get('group', 'Sonstige')).strip()

        if group == 'Einzelakteure':
            continue

        if group == 'Gewerbe/ Industrie':
            is_partner = any(p in name.lower() for p in ["tillman", "smurfit", "schoellershammer"])
            if is_partner:
                display_name = name
            else:
                if name not in gewerbe_mapping:
                    branche = props.get('branche') or props.get('Branche')
                    clean_branch = _clean_branch(branche)
                    gewerbe_mapping[name] = f"Gewerbe-/ Industriebetrieb Nr. {gewerbe_counter} – Branche {clean_branch}"
                    gewerbe_counter += 1
                display_name = gewerbe_mapping[name]
        else:
            display_name = _extract_institution(name)

        color = custom_colors.get(group, GROUP_COLORS.get(group, '#8b5cf6'))
        display_group = custom_names.get(group, group)

        out_features.append({
            "type": "Feature",
            "id": feature.get('id'),
            "geometry": feature.get('geometry'),
            "properties": {
                "name": display_name,
                "group": display_group,
                "color": color
            }
        })

    return {
        "type": "FeatureCollection",
        "styleSettings": style_settings,
        "features": out_features
    }

def encrypt_geojson_file(src_path, dest_path):
    """Encrypt src_path (contacts.geojson) into dest_path (contacts.enc), matching
    encrypt_contacts.js byte layout: salt(16) + iv(12) + authTag(16) + ciphertext, base64."""
    with open(src_path, 'r', encoding='utf-8') as f:
        plaintext = f.read().encode('utf-8')

    try:
        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        import secrets

        salt = secrets.token_bytes(16)
        iv = secrets.token_bytes(12)

        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)
        key = kdf.derive(ENC_PASSWORD.encode('utf-8'))

        aesgcm = AESGCM(key)
        ct_and_tag = aesgcm.encrypt(iv, plaintext, None)  # ciphertext + 16-byte tag appended
        ciphertext = ct_and_tag[:-16]
        auth_tag = ct_and_tag[-16:]

        combined = salt + iv + auth_tag + ciphertext
        b64 = base64.b64encode(combined).decode('ascii')
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(b64)
        return True
    except ImportError:
        # Fallback: shell out to node encrypt_contacts.js
        result = subprocess.run(
            ['node', 'encrypt_contacts.js'],
            cwd=DIRECTORY, capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            raise RuntimeError(f"encrypt_contacts.js failed: {result.stderr}")
        return True

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # We serve from the parent directory so `index.html` etc. are found if accessed directly.
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        """Keep automated runs quiet unless access logging is explicitly requested."""
        if os.environ.get('SERVER_ACCESS_LOG') == '1':
            super().log_message(format, *args)

    def copyfile(self, source, outputfile):
        """Ignore normal disconnects when a browser cancels an in-flight request."""
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            pass

    def end_headers(self):
        # Enable CORS for convenience
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # No auth on preflight requests - browsers never send credentials with OPTIONS
        self.send_response(200, "OK")
        self.end_headers()

    def _check_auth(self):
        """HTTP Basic Auth gate. Returns True if authorized, else sends 401 and returns False."""
        expected = 'Basic ' + base64.b64encode(f'{EDITOR_USER}:{EDITOR_PASSWORD}'.encode('utf-8')).decode('ascii')
        provided = self.headers.get('Authorization', '')
        if hmac.compare_digest(provided, expected):
            return True
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="AquaRevier Editor"')
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.end_headers()
        self.wfile.write("401 - Zugriff nur mit Login.".encode('utf-8'))
        return False

    def do_GET(self):
        if not self._check_auth():
            return
        super().do_GET()

    def do_HEAD(self):
        if not self._check_auth():
            return
        super().do_HEAD()

    def do_POST(self):
        if not self._check_auth():
            return
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/contacts':
            try:
                cl_header = self.headers.get('Content-Length')
                if not cl_header:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": "Missing Content-Length header"}).encode('utf-8'))
                    return
                content_length = int(cl_header)
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                # Validation check for GeoJSON FeatureCollection
                if not isinstance(data, dict) or data.get('type') != 'FeatureCollection' or not isinstance(data.get('features'), list):
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": "Invalid GeoJSON FeatureCollection"}).encode('utf-8'))
                    return

                for feat in data.get('features', []):
                    if not isinstance(feat, dict) or feat.get('type') != 'Feature' or 'geometry' not in feat or 'properties' not in feat:
                        self.send_response(400)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "error", "message": "Invalid GeoJSON Feature"}).encode('utf-8'))
                        return

                # Validate feature geometry coordinates
                for feat in data.get('features', []):
                    geom = feat.get('geometry')
                    if geom:
                        coords = geom.get('coordinates')
                        if not coords or not isinstance(coords, list) or len(coords) < 2 or any(c is None or not isinstance(c, (int, float)) for c in coords[:2]):
                            self.send_response(400)
                            self.send_header('Content-Type', 'application/json')
                            self.end_headers()
                            self.wfile.write(json.dumps({"status": "error", "message": "Invalid geometry coordinates found in feature"}).encode('utf-8'))
                            return

                geojson_path = os.path.join(DIRECTORY, 'contacts.geojson')

                # Create backup before saving
                if os.path.exists(geojson_path):
                    backup_path = geojson_path + '.bak'
                    try:
                        shutil.copy2(geojson_path, backup_path)
                    except Exception:
                        pass

                # Atomic write to temporary file
                tmp_geojson = geojson_path + '.tmp'
                with open(tmp_geojson, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                os.replace(tmp_geojson, geojson_path)

                # Regenerate public-safe anonymized layer
                anon_path = os.path.join(DIRECTORY, 'contacts_anonymized.geojson')
                anonymized = build_anonymized_geojson(data)
                tmp_anon = anon_path + '.tmp'
                with open(tmp_anon, 'w', encoding='utf-8') as f:
                    json.dump(anonymized, f, indent=2, ensure_ascii=False)
                os.replace(tmp_anon, anon_path)

                # Regenerate encrypted archive
                enc_path = os.path.join(DIRECTORY, 'contacts.enc')
                encrypt_geojson_file(geojson_path, enc_path)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Contacts saved, anonymized layer and encrypted archive regenerated."}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        elif parsed_path.path == '/api/deploy':
            try:
                git_token = os.environ.get("GIT_PUSH_TOKEN") or os.environ.get("GITHUB_TOKEN", "")
                dry_run = os.environ.get("DRY_RUN", "").strip().lower() in {"1", "true", "yes"}
                if dry_run:
                    code = 0
                    output = "DRY RUN: validated deploy request; no commit or push performed."
                elif not git_token:
                    code = 0
                    output = "Local development mode: GIT_PUSH_TOKEN not set, skipped git push."
                else:
                    subprocess.run(["git", "config", "--local", "user.email", "bot@aquarevier.de"], cwd=DIRECTORY, check=False)
                    subprocess.run(["git", "config", "--local", "user.name", "Editor Bot"], cwd=DIRECTORY, check=False)
                    subprocess.run(["git", "add", "contacts.geojson", "contacts_anonymized.geojson", "contacts.enc"], cwd=DIRECTORY, check=True)

                    commit_res = subprocess.run(["git", "commit", "-m", "Editor Bot: update contacts and maps"], cwd=DIRECTORY, capture_output=True, text=True)
                    repo_url = f"https://x-access-token:{git_token}@github.com/Dtunder/adb_aquarevier_map.git"
                    push_res = subprocess.run(["git", "push", repo_url, "HEAD:main"], cwd=DIRECTORY, capture_output=True, text=True)

                    output = (commit_res.stdout or '') + (commit_res.stderr or '') + (push_res.stdout or '') + (push_res.stderr or '')
                    output = re.sub(r'https://[^@]+@', 'https://[REDACTED]@', output)
                    code = push_res.returncode

                if len(output) > 8000:
                    output = output[-8000:]

                self.send_response(200 if code == 0 else 500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if code == 0 else "error",
                    "output": output
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Allow port reuse to avoid 'Address already in use' errors
    socketserver.ThreadingTCPServer.allow_reuse_address = True

    with socketserver.ThreadingTCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        httpd.daemon_threads = True
        print(f"==================================================")
        print(f" Editor Backend Server Running!")
        print(f" URL: http://0.0.0.0:{PORT}")
        print(f" Serving directory: {DIRECTORY}")
        print(f" Press Ctrl+C to stop the server.")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
