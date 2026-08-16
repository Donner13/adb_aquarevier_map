import http.server
import socketserver
import json
import os
import re
import base64
import subprocess
import urllib.parse

import hmac

PORT = int(os.environ.get('PORT', 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

ENC_PASSWORD = os.environ.get('CONTACTS_ENCRYPTION_KEY') or os.environ.get('ENC_PASSWORD', 'AquaRevier2026')
EDITOR_USER = os.environ.get('EDITOR_USER', 'florian')
EDITOR_PASSWORD = os.environ.get('EDITOR_PASSWORD', 'AquaRevier2026')

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

    def check_auth(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return False
        try:
            cred = base64.b64decode(auth_header[6:].strip()).decode('utf-8')
            user, pwd = cred.split(':', 1)
            return hmac.compare_digest(user, EDITOR_USER) and hmac.compare_digest(pwd, EDITOR_PASSWORD)
        except Exception:
            return False

    def send_auth_challenge(self):
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="AquaRevier Editor"')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "error", "message": "Authentication required."}).encode('utf-8'))

    def end_headers(self):
        # Enable CORS for origin validation
        origin = self.headers.get('Origin')
        parsed_origin = urllib.parse.urlparse(origin) if origin else None

        self.send_header('Vary', 'Origin')

        if parsed_origin and parsed_origin.hostname in ('localhost', '127.0.0.1'):
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Access-Control-Allow-Credentials', 'true')

        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        # Protect raw PII contacts.geojson file from direct GET access without auth
        if parsed_path.path == '/contacts.geojson' or parsed_path.path.startswith('/api/'):
            if not self.check_auth():
                self.send_auth_challenge()
                return
        super().do_GET()

    def do_POST(self):
        if not self.check_auth():
            self.send_auth_challenge()
            return

        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/contacts':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 10 * 1024 * 1024:  # 10 MB limit
                self.send_response(413)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Payload too large (max 10MB)."}).encode('utf-8'))
                return

            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                if not isinstance(data, dict) or 'features' not in data or not isinstance(data['features'], list):
                    raise ValueError("Invalid GeoJSON format: must contain 'features' list.")

                # Write to contacts.geojson (full PII dataset, never deployed as plaintext)
                geojson_path = os.path.join(DIRECTORY, 'contacts.geojson')
                with open(geojson_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                # Regenerate public-safe anonymized layer used by index.html
                anon_path = os.path.join(DIRECTORY, 'contacts_anonymized.geojson')
                anonymized = build_anonymized_geojson(data)
                with open(anon_path, 'w', encoding='utf-8') as f:
                    json.dump(anonymized, f, indent=2, ensure_ascii=False)

                # Regenerate encrypted archive used by internal.html
                enc_path = os.path.join(DIRECTORY, 'contacts.enc')
                encrypt_geojson_file(geojson_path, enc_path)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "Contacts saved, anonymized layer and encrypted archive regenerated."}).encode('utf-8'))
            except Exception as e:
                self.send_response(400 if isinstance(e, ValueError) else 500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        elif parsed_path.path == '/api/deploy':
            try:
                result = subprocess.run(
                    ['python', 'deploy_surge.py'],
                    cwd=DIRECTORY, capture_output=True, text=True, timeout=120
                )
                output = (result.stdout or '') + (('\n' + result.stderr) if result.stderr else '')
                # Redact sensitive token in output
                output = re.sub(r'https://[^@]+@', 'https://[REDACTED]@', output)
                if len(output) > 8000:
                    output = output[-8000:]
                self.send_response(200 if result.returncode == 0 else 500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success" if result.returncode == 0 else "error",
                    "output": output
                }).encode('utf-8'))
            except subprocess.TimeoutExpired:
                self.send_response(504)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Deploy timed out after 120s."}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Change working directory to script location
    os.chdir(DIRECTORY)
    
    # Allow port reuse to avoid 'Address already in use' errors
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    
    with socketserver.ThreadingTCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        httpd.daemon_threads = True
        print(f"==================================================")
        print(f" Contact Map Visualizer Server Running!")
        print(f" URL: http://localhost:{PORT}")
        print(f" Serving directory: {DIRECTORY}")
        print(f" Press Ctrl+C to stop the server.")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
