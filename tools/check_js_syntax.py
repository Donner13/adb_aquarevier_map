import re
import subprocess

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Extract script blocks
scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)

if not scripts:
    print("No script blocks found!")
    exit(1)

# Write to temp file
with open("temp_script.js", "w", encoding="utf-8") as f:
    f.write(scripts[0])

# Run node with syntax check flag
res = subprocess.run(["node", "--check", "temp_script.js"], capture_output=True, text=True)

if res.returncode == 0:
    print("JavaScript syntax is completely valid!")
else:
    print("JavaScript syntax error:")
    print(res.stderr)
    exit(1)
