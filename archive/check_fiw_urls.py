import urllib.request

urls = [
    "https://www.fiw.rwth-aachen.de/fileadmin/templates/images/logo.svg",
    "https://www.fiw.rwth-aachen.de/fileadmin/templates/images/logo.png",
    "https://www.fiw.rwth-aachen.de/fileadmin/templates/img/logo.svg",
    "https://www.fiw.rwth-aachen.de/fileadmin/templates/img/logo.png",
    "https://www.fiw.rwth-aachen.de/fileadmin/user_upload/Logo_FiW_300.png",
    "https://www.fiw.rwth-aachen.de/fileadmin/user_upload/Logo_FiW.svg",
    "https://www.fiw.rwth-aachen.de/fileadmin/user_upload/Logo_FiW.png",
    "https://www.fiw.rwth-aachen.de/fileadmin/user_upload/Bilder/Logo_FiW.png",
    "https://www.fiw.rwth-aachen.de/fileadmin/templates/img/logo-fiw.png"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=3) as res:
            if res.status == 200:
                print("SUCCESS:", url)
    except Exception as e:
        pass
