import subprocess
import time
import sys
import random
import string
import os
from pathlib import Path

# --- Configuration ---
root = Path(__file__).resolve().parent
dist_dir = root / "dist_public"
domain = "adb-aquarevier-secure.surge.sh"

def run_step(name, command, cwd=None):
    print(f"[*] Step: {name}...")
    result = subprocess.run(
        command,
        cwd=cwd or root,
        capture_output=True,
        text=True,
        shell=True
    )
    if result.returncode != 0:
        print(f"  [!] Error in step '{name}':")
        print(result.stdout)
        print(result.stderr)
        sys.exit(1)
    print(f"  [+] Success.")
    return result.stdout.strip()

# 1. Build Public Release
run_step("Build Public Release", [sys.executable, 'tools/build_public_release.py'])

def generate_random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

email = f"dtunder-{generate_random_string(5)}@surge.sh"
password = generate_random_string(12)

print(f"\nDeploying to Surge...")
print(f"Project Directory: {dist_dir}")
print(f"Domain: http://{domain}")

try:
    # Use dist_dir as the project path
    p = subprocess.Popen(
        ['npx', 'surge', '--project', str(dist_dir), '--domain', domain],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='ignore',
        bufsize=0, # unbuffered
        shell=True
    )
except Exception as e:
    print(f"Error launching Surge CLI: {e}")
    sys.exit(1)

buffer = ""
start_time = time.time()
deployed = False
email_sent = False
password_sent = False

while time.time() - start_time < 300: # Increased timeout to 5 mins
    char = p.stdout.read(1)
    if not char:
        break
    try:
        sys.stdout.write(char)
        sys.stdout.flush()
    except UnicodeEncodeError:
        pass
    buffer += char
    
    if "email:" in buffer.lower() and not email_sent:
        print("\n>> Sending temporary email...")
        p.stdin.write(email + "\n")
        p.stdin.flush()
        email_sent = True
        buffer = ""
        
    elif "password:" in buffer.lower() and not password_sent:
        print("\n>> Sending temporary password...")
        p.stdin.write(password + "\n")
        p.stdin.flush()
        password_sent = True
        buffer = ""
        
    if "Success!" in buffer or "deployed to" in buffer:
        deployed = True

p.poll()
if p.returncode is None:
    try:
        p.wait(timeout=10)
    except Exception:
        p.terminate()

if deployed:
    print("\n==============================================")
    print("DEPLOYMENT ERFOLGREICH!")
    print(f"Live unter: http://{domain}")
    print("==============================================")
else:
    print("\nDeployment failed or timed out.")
    sys.exit(1)
