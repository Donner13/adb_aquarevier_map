import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

def print_all_images(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'src=["\']([^"\']+\.(?:png|svg|jpg|jpeg|gif))["\']', html)
        print(f"\nAll images from {url}:")
        for img in imgs:
            print("-", img)
    except Exception as e:
        print(f"Error fetching from {url}: {e}")

print_all_images("https://www.eschweiler.de/")
print_all_images("https://www.papierfabrik-tillmann.de/")
print_all_images("https://www.fiw.rwth-aachen.de/")
print_all_images("https://www.isa.rwth-aachen.de/")
print_all_images("https://www.iww.rwth-aachen.de/")
