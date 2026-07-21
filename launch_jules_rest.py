import json
import urllib.request
import urllib.error
from pathlib import Path

API_KEY_PATH = Path(r"C:\Users\user\.gemini\antigravity-ide\scratch\jules_api_key.txt")
JULES_API_BASE = "https://jules.googleapis.com/v1alpha"
repo = "Dtunder/adb_aquarevier_map"

item = {"num": 15, "name": "Embed-Widget-Generator für Drittseiten (iframe/oEmbed)", "line": 4309}

prompt_template = """Task: {name}
Spezifikation: Aquarevier_Map_Backlog.md Zeile {line} (volle Spezifikation steht dort).

Muster & Projektregeln (Auszug aus Handoff-Abschnitt B):
1. "Keine Konsolenfehler" ist NICHT ausreichend. Echter Daten-Spotcheck (Werteverteilung/Counter über alle Features) und Klickpfad mit Playwright.
2. <style vs </style Tag-Count muss nach HTML-Änderung in index.html UND internal.html exakt gleich bleiben.
3. Ablauf: Build -> Test lokal -> Commit (aussagekräftige Message) -> Push -> Auto-Deploy -> Live-Verify.
4. Bei Push-Konflikt: 'git pull --rebase', niemals force-push.
5. Jedes neue ELWAS-Dataset: Koordinaten können unter "Lage" statt "Stammdaten" liegen, ggf. dekameter-maskiert (x10-Fehler-Falle beachten!).
"""

def read_api_key() -> str:
    return API_KEY_PATH.read_text(encoding="utf-8").strip()

def spawn_session(prompt: str, api_key: str):
    url = f"{JULES_API_BASE}/sessions"
    payload = json.dumps({
        "prompt": prompt,
        "sourceContext": {
            "source": f"sources/github/{repo}",
            "githubRepoContext": {
                "startingBranch": "main"
            }
        },
        "requirePlanApproval": False
    }).encode("utf-8")
    
    headers = {
        "X-Goog-Api-Key": api_key,
        "Content-Type": "application/json",
    }
    
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)
        session_name = data.get("name", "")
        session_id = session_name.split("/")[-1]
        return session_id

def main():
    api_key = read_api_key()
    prompt = prompt_template.format(name=item["name"], line=item["line"])
    try:
        session_id = spawn_session(prompt, api_key)
        print(f"SUCCESS: Item 15 Session ID = {session_id}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP Error bei Item 15: {e.code} - {err_body}")
    except Exception as e:
        print(f"Error bei Item 15: {e}")

if __name__ == "__main__":
    main()
