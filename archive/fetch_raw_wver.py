import urllib.request
import re

url = "https://www.wver.de/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read().decode('utf-8')
    
    print("Fetched successfully. Length:", len(html))
    
    # Find all img tags
    imgs = re.findall(r'<img[^>]+>', html)
    print("\nFound Images:")
    for img in imgs[:15]:
        print("-", img)
        
    # Find all svg tags
    svgs = re.findall(r'<svg[^>]+>', html)
    print("\nFound SVGs:")
    for svg in svgs[:15]:
        print("-", svg)
        
except Exception as e:
    print("Error:", e)
