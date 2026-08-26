import subprocess
import time
import sys
import random
import string
from pathlib import Path

root = Path(__file__).resolve().parent
vendor_result = subprocess.run(
    ['node', 'tools/build_vendor_assets.js'],
    cwd=root,
    capture_output=True,
    text=True,
    timeout=60
)
if vendor_result.returncode != 0:
    print(vendor_result.stdout)
    print(vendor_result.stderr)
    print("Deployment stopped: vendor assets could not be prepared.")
    sys.exit(1)
print(vendor_result.stdout.strip())

def generate_random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

email = f"dtunder-{generate_random_string(5)}@surge.sh"
password = generate_random_string(12)
domain = "adb-aquarevier-secure.surge.sh"

print(f"Deploying to Surge...")
print(f"Temporary Account Email: {email}")
print(f"Subdomain: http://{domain}")

try:
    p = subprocess.Popen(
        ['npx', 'surge', '--project', '.', '--domain', domain],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='ignore',
        bufsize=0 # unbuffered
    )
except Exception as e:
    print(f"Error launching Surge CLI: {e}")
    sys.exit(1)

buffer = ""
start_time = time.time()
deployed = False
email_sent = False
password_sent = False

while time.time() - start_time < 180:
    # Read one character at a time to avoid blocking on newlines
    char = p.stdout.read(1)
    if not char:
        break
    try:
        sys.stdout.write(char)
        sys.stdout.flush()
    except UnicodeEncodeError:
        try:
            sys.stdout.write(char.encode('ascii', errors='replace').decode('ascii'))
            sys.stdout.flush()
        except Exception:
            pass
    buffer += char
    
    # Check for prompts in the accumulated buffer
    if "email:" in buffer.lower() and not email_sent:
        print("\n>> Sending email...")
        p.stdin.write(email + "\n")
        p.stdin.flush()
        email_sent = True
        buffer = "" # Clear buffer
        
    elif "password:" in buffer.lower() and not password_sent:
        print("\n>> Sending password...")
        p.stdin.write(password + "\n")
        p.stdin.flush()
        password_sent = True
        buffer = "" # Clear buffer
        
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
    print(f"Deine Webseite ist jetzt live unter:")
    print(f"-> http://{domain}")
    print("==============================================")
else:
    print("\nDeployment failed or timed out.")
