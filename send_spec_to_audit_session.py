import json
import urllib.request
import urllib.error
from pathlib import Path

API_KEY_PATH = Path(r"C:\Users\user\.gemini\antigravity-ide\scratch\jules_api_key.txt")
JULES_API_BASE = "https://jules.googleapis.com/v1alpha"

def read_api_key() -> str:
    return API_KEY_PATH.read_text(encoding="utf-8").strip()

def send_message(session_id: str, prompt: str, api_key: str):
    url = f"{JULES_API_BASE}/sessions/{session_id}:sendMessage"
    payload = json.dumps({"prompt": prompt}).encode("utf-8")
    headers = {
        "X-Goog-Api-Key": api_key,
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            print(f"Message successfully sent to session {session_id}!")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"Error sending message to session {session_id} (HTTP {e.code}): {err_body}")
        return False

def main():
    api_key = read_api_key()
    session_id = "11641480847977696458"
    
    # Read specification lines from the backlog file
    backlog_path = Path("Aquarevier_Map_Backlog.md")
    lines = backlog_path.read_text(encoding="utf-8").splitlines()
    
    # Extract lines 2968 to 3200 (0-indexed: lines[2967:3200])
    spec_lines = lines[2967:3200]
    spec_text = "\n".join(spec_lines)
    
    prompt = (
        "Here are the detailed specification requirements for the task "
        "\"Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf\" "
        "and the \"KRITISCHE ARCHITEKTUR-VORGABE\" as requested:\n\n"
        f"{spec_text}\n\n"
        "Please pull the latest main branch or implement the changes based on these requirements."
    )
    
    send_message(session_id, prompt, api_key)

if __name__ == "__main__":
    main()
