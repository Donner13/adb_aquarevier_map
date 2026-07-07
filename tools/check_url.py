import urllib.request

url = "https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/FiW_RGB_2022.svg"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=5) as res:
        print("FIW SUCCESS:", res.status)
except Exception as e:
    print("FIW FAILED:", e)
