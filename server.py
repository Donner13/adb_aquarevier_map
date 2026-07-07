import http.server
import socketserver
import json
import os
import base64
import subprocess
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

ENC_PASSWORD = 'AquaRevier2026'

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


def build_anonymized_geojson(data):
    """Transform a full contacts FeatureCollection into the public-safe anonymized layer."""
    features = data.get('features', []) if isinstance(data, dict) else []
    gewerbe_mapping = {}
    gewerbe_counter = 1
    out_features = []

    for feature in features:
        props = feature.get('properties', {}) or {}
        name = str(props.get('name', '')).strip()
        group = str(props.get('group', 'Sonstige')).strip()
        display_name = name

        if group == 'Gewerbe/ Industrie':
            is_partner = any(p in name.lower() for p in ["tillman", "smurfit", "schoellershammer"])
            if not is_partner:
                if name not in gewerbe_mapping:
                    branche = props.get('branche') or props.get('Branche')
                    clean_branch = _clean_branch(branche)
                    gewerbe_mapping[name] = f"Gewerbe-/ Industriebetrieb Nr. {gewerbe_counter} – Branche {clean_branch}"
                    gewerbe_counter += 1
                display_name = gewerbe_mapping[name]

        color = GROUP_COLORS.get(group, '#8b5cf6')

        out_features.append({
            "type": "Feature",
            "id": feature.get('id'),
            "geometry": feature.get('geometry'),
            "properties": {
                "name": display_name,
                "group": group,
                "color": color
            }
        })

    return {"type": "FeatureCollection", "features": out_features}


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

    def end_headers(self):
        # Enable CORS for convenience
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/contacts':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))

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
                self.send_response(500)
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
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
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
