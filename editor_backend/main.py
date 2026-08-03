import os
import re
import json
import base64
import secrets
import subprocess

from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.base import BaseHTTPMiddleware
import hmac

# Set paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DIRECTORY = os.path.dirname(BACKEND_DIR)  # Repository root

# Configuration
ENC_PASSWORD = os.environ.get('CONTACTS_ENCRYPTION_KEY') or os.environ.get('ENC_PASSWORD', 'AquaRevier2026')
EDITOR_USER = os.environ.get('EDITOR_USER', 'florian')
EDITOR_PASSWORD = os.environ.get('EDITOR_PASSWORD', 'AquaRevier2026')
GIT_PUSH_TOKEN = os.environ.get('GIT_PUSH_TOKEN')

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
    m = re.match(r'^.*?\((.+)\)\s*$', name)
    return m.group(1).strip() if m else name

def build_anonymized_geojson(data):
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
    with open(src_path, 'r', encoding='utf-8') as f:
        plaintext = f.read().encode('utf-8')

    try:
        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        salt = secrets.token_bytes(16)
        iv = secrets.token_bytes(12)

        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)
        key = kdf.derive(ENC_PASSWORD.encode('utf-8'))

        aesgcm = AESGCM(key)
        ct_and_tag = aesgcm.encrypt(iv, plaintext, None)
        ciphertext = ct_and_tag[:-16]
        auth_tag = ct_and_tag[-16:]

        combined = salt + iv + auth_tag + ciphertext
        b64 = base64.b64encode(combined).decode('ascii')
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(b64)
        return True
    except ImportError:
        result = subprocess.run(
            ['node', 'encrypt_contacts.js'],
            cwd=DIRECTORY, capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            raise RuntimeError(f"encrypt_contacts.js failed: {result.stderr}")
        return True


app = FastAPI()
security = HTTPBasic()

def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = hmac.compare_digest(credentials.username, EDITOR_USER)
    correct_password = hmac.compare_digest(credentials.password, EDITOR_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={"WWW-Authenticate": 'Basic realm="AquaRevier Editor"'},
        )
    return True


class BasicAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We need to protect internal.html and contacts.geojson (and any other files that might be sensitive).
        # We can protect the entire app except for the public index.html and public assets, or we can just protect everything.
        # But wait, index.html needs to be public. The original server.py had:
        # if parsed_path.path == '/contacts.geojson' or parsed_path.path.startswith('/api/'):
        #     if not self.check_auth(): ...
        # But internal.html should be protected? Wait, the task says:
        # "Das läuft nur lokal auf einem Entwickler-Rechner... Ziel: eine dauerhaft erreichbare, im Repo versionierte Editor-Instanz"
        # Since it is exposed publicly, it's safer to protect /internal.html as well! Let's protect internal.html and contacts.geojson.

        path = request.url.path
        if path == "/internal.html" or path == "/contacts.geojson" or path.startswith("/api/"):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Basic "):
                return Response(
                    content=json.dumps({"status": "error", "message": "Authentication required."}),
                    status_code=401,
                    headers={"WWW-Authenticate": 'Basic realm="AquaRevier Editor"', "Content-Type": "application/json"}
                )

            try:
                credentials = base64.b64decode(auth_header[6:].strip()).decode('utf-8')
                user, pwd = credentials.split(':', 1)
                if not (hmac.compare_digest(user, EDITOR_USER) and hmac.compare_digest(pwd, EDITOR_PASSWORD)):
                    raise Exception()
            except Exception:
                return Response(
                    content=json.dumps({"status": "error", "message": "Authentication required."}),
                    status_code=401,
                    headers={"WWW-Authenticate": 'Basic realm="AquaRevier Editor"', "Content-Type": "application/json"}
                )

        return await call_next(request)

app.add_middleware(BasicAuthMiddleware)

@app.post("/api/contacts")
async def api_contacts(request: Request):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format.")

    if not isinstance(data, dict) or 'features' not in data or not isinstance(data['features'], list):
        raise HTTPException(status_code=400, detail="Invalid GeoJSON format: must contain 'features' list.")

    geojson_path = os.path.join(DIRECTORY, 'contacts.geojson')
    with open(geojson_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    anon_path = os.path.join(DIRECTORY, 'contacts_anonymized.geojson')
    anonymized = build_anonymized_geojson(data)
    with open(anon_path, 'w', encoding='utf-8') as f:
        json.dump(anonymized, f, indent=2, ensure_ascii=False)

    enc_path = os.path.join(DIRECTORY, 'contacts.enc')
    encrypt_geojson_file(geojson_path, enc_path)

    return {"status": "success", "message": "Contacts saved, anonymized layer and encrypted archive regenerated."}

@app.post("/api/deploy")
async def api_deploy(request: Request):
    if not GIT_PUSH_TOKEN:
        # Mock/Dry-Run flag check for testing if no token is set
        body = await request.body()
        is_mock = False
        if body:
            try:
                js = json.loads(body)
                if js.get("dry_run"):
                    is_mock = True
            except:
                pass

        if is_mock:
            return {"status": "success", "output": "Dry run complete, skipped git push."}

        raise HTTPException(status_code=500, detail="GIT_PUSH_TOKEN not configured.")

    try:
        # Setup git config
        subprocess.run(["git", "config", "user.name", "AquaRevier Editor Backend"], cwd=DIRECTORY, check=True)
        subprocess.run(["git", "config", "user.email", "editor@aquarevier.local"], cwd=DIRECTORY, check=True)

        # Add updated files
        files_to_add = ["contacts.geojson", "contacts_anonymized.geojson", "contacts.enc"]
        subprocess.run(["git", "add"] + files_to_add, cwd=DIRECTORY, check=True)

        # Commit
        commit_res = subprocess.run(["git", "commit", "-m", "chore: update contacts via editor backend"], cwd=DIRECTORY, capture_output=True, text=True)

        output = commit_res.stdout + "\n" + commit_res.stderr

        # Push
        # Use token in remote URL
        remote_url = f"https://x-access-token:{GIT_PUSH_TOKEN}@github.com/Donner13/adb_aquarevier_map.git"
        push_res = subprocess.run(["git", "push", remote_url, "HEAD:main"], cwd=DIRECTORY, capture_output=True, text=True, timeout=120)

        output += "\n" + push_res.stdout + "\n" + push_res.stderr

        # Redact sensitive token in output
        output = re.sub(r'https://[^@]+@', 'https://[REDACTED]@', output)
        if len(output) > 8000:
            output = output[-8000:]

        if push_res.returncode == 0:
            return {"status": "success", "output": output}
        else:
            return JSONResponse(status_code=500, content={"status": "error", "output": output})

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Deploy timed out after 120s.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/", StaticFiles(directory=DIRECTORY, html=True), name="static")
