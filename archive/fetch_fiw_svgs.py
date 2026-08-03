import urllib.request
import re
import os

url = "https://www.fiw.rwth-aachen.de/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    # Let's find all inline SVGs or external SVGs
    svgs = re.findall(r'href=["\']([^"\']+\.svg[^"\']*)["\']', html)
    svgs += re.findall(r'src=["\']([^"\']+\.svg[^"\']*)["\']', html)
    
    print("Found SVGs:")
    for svg in set(svgs):
        print("-", svg)
except Exception as e:
    print("Error:", e)
