import urllib.request
import os

logos = {
    "wver": "https://www.wver.de/wp-content/themes/wver/assets/images/logo.svg",
    "schoellershammer": "https://schoellershammer.de/wp-content/uploads/2021/04/Schoellershammer_Logo.svg",
    "rlv": "https://www.rlv.de/fileadmin/templates/images/logo.svg",
    "smurfit": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Smurfit_Westrock_%28logo%29.svg",
    "eschweiler": "https://www.eschweiler.de/layout/logo.svg",
    "tillmann": "https://www.papierfabrik-tillmann.de/wp-content/themes/tillmann/images/logo.png",
    "fiw": "https://fiw.rwth-aachen.de/images/logo.png",
    "isa": "https://www.isa.rwth-aachen.de/images/logo.png",
    "iww": "https://www.iww.rwth-aachen.de/images/logo.png"
}

os.makedirs("logos", exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

for name, url in logos.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        ext = url.split(".")[-1].split("?")[0]
        if len(ext) > 4:
            ext = "png"
        path = f"logos/{name}.{ext}"
        with urllib.request.urlopen(req, timeout=5) as response:
            with open(path, "wb") as f:
                f.write(response.read())
        print(f"Succeeded: {name} -> {path}")
    except Exception as e:
        print(f"Failed: {name} ({url}): {e}")
