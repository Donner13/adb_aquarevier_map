import urllib.request
import re

url = "https://commons.wikimedia.org/wiki/File:Smurfit_Westrock_(logo).svg"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read().decode('utf-8', errors='ignore')
    match = re.search(r'href=["\'](https://upload.wikimedia.org/wikipedia/commons/[^"\']+\.svg)["\']', html)
    if match:
        print("FOUND URL:", match.group(1))
    else:
        matches = re.findall(r'https://upload.wikimedia.org/wikipedia/commons/[^"\']+', html)
        print("All matching upload links:")
        for m in set(matches):
            print("-", m)
except Exception as e:
    print("FAILED:", e)
