import urllib.request
import re

url = "https://www.papierfabrik-tillmann.de/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=5) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    css_files = re.findall(r'href=["\']([^"\']+\.css)["\']', html)
    print("CSS files:")
    for css in css_files:
        print("-", css)
        
    for css in css_files:
        if not css.startswith('http'):
            css_url = url.rstrip('/') + '/' + css.lstrip('/')
        else:
            css_url = css
        try:
            req_css = urllib.request.Request(css_url, headers=headers)
            with urllib.request.urlopen(req_css, timeout=3) as res_css:
                css_content = res_css.read().decode('utf-8', errors='ignore')
                urls_in_css = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', css_content)
                logo_urls = [u for u in urls_in_css if 'logo' in u.lower() or 'brand' in u.lower()]
                print(f"Logo URLs in CSS ({css}):", logo_urls)
        except Exception as e:
            pass
except Exception as e:
    print("Error:", e)
