import urllib.request
import os

os.makedirs("logos", exist_ok=True)
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

urls = {
    "schoellershammer": "https://upload.wikimedia.org/wikipedia/commons/1/18/Schoellershammer_logo.svg",
    "smurfit": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Smurfit_Westrock_%28logo%29.svg",
    "eschweiler_wappen": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Wappen_Eschweiler.svg"
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            ext = url.split(".")[-1]
            path = f"logos/{name}.{ext}"
            with open(path, "wb") as f:
                f.write(response.read())
        print(f"Succeeded: {name} -> {path}")
    except Exception as e:
        print(f"Failed: {name} -> {e}")
