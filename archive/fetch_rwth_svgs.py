import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

def find_images(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'src=["\']([^"\']+\.(?:png|jpg|jpeg|gif))["\']', html)
        print(f"\nImages from {url}:")
        for img in set(imgs):
            if 'logo' in img.lower() or 'brand' in img.lower() or 'header' in img.lower() or 'layout' in img.lower():
                print("-", img)
    except Exception as e:
        print(f"Error fetching {url}: {e}")

find_images("https://www.isa.rwth-aachen.de/")
find_images("https://www.iww.rwth-aachen.de/")
