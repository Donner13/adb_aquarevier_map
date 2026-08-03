import urllib.request

urls = [
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/logo.svg",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/logo.png",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/logo-fiw.svg",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/logo-fiw.png",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/FiW_Logo.svg",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/FiW_Logo.png",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/Logo.svg",
    "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/Logo.png"
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
