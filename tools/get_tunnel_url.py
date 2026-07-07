import subprocess
import time
import sys

print("Starting SSH tunnel to localhost.run...")
try:
    p = subprocess.Popen(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:8000', 'nokey@localhost.run'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
except Exception as e:
    print(f"Error starting SSH: {e}")
    sys.exit(1)

# Read output line by line until we find the URL
start_time = time.time()
url_found = False

while time.time() - start_time < 15:
    line = p.stdout.readline()
    if not line:
        break
    print(f"SSH: {line.strip()}")
    if "localhost.run" in line or "lhr.life" in line or "lhr.rocks" in line:
        print("\n==============================================")
        print("🎉 Live-Tunnel erfolgreich gestartet!")
        print(f"Dein Link für jeden: {line.strip()}")
        print("==============================================")
        url_found = True
        break

if not url_found:
    print("Could not find tunnel URL in time. Output may be buffered or connection blocked.")

# Keep running to maintain the tunnel
try:
    while True:
        line = p.stdout.readline()
        if not line:
            break
        print(f"SSH: {line.strip()}")
except KeyboardInterrupt:
    print("Stopping tunnel...")
    p.terminate()
