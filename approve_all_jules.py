import subprocess
import json
import urllib.request
import urllib.error
import re
from pathlib import Path

API_KEY_PATH = Path(r"C:\Users\user\.gemini\antigravity-ide\scratch\jules_api_key.txt")
JULES_API_BASE = "https://jules.googleapis.com/v1alpha"

def read_api_key() -> str:
    return API_KEY_PATH.read_text(encoding="utf-8").strip()

def approve_plan(session_id: str, api_key: str):
    url = f"{JULES_API_BASE}/sessions/{session_id}:sendMessage"
    payload = json.dumps(
        {"prompt": "Plan approved. Please proceed with the implementation."}
    ).encode("utf-8")
    headers = {
        "X-Goog-Api-Key": api_key,
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            print(f"Session {session_id} freigegeben!")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"Fehler bei Session {session_id} (HTTP {e.code}): {err_body}")
        return False

def main():
    api_key = read_api_key()
    
    # Holen der Sessionsliste
    cmd = [r"C:\Users\user\.gemini\antigravity-ide\scratch\ai_agent_repos\sonu-cli-advanced\jules.exe", "remote", "list", "--session"]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    
    lines = res.stdout.splitlines()
    for line in lines:
        if not line.strip():
            continue
        # Suchen nach einer 18-20 stelligen ID
        match = re.search(r"\b(\d{18,20})\b", line)
        if match:
            session_id = match.group(1)
            # Prüfen ob der Status auf Feedback/Approval wartet
            if any(term in line.lower() for term in ["awaiting", "plan approval", "user f"]):
                print(f"Freigabe erforderlich für Session {session_id} (Zeile: {line.strip()})")
                approve_plan(session_id, api_key)

if __name__ == "__main__":
    main()
