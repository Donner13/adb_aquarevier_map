with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.findall(r'img\s*\{[^}]*\}', content)
print("Matching img rules:")
for m in matches:
    print(m)

# Let's also print any general img styles or leaflet marker styles
matches_wild = re.findall(r'[^{]*img[^{]*\{[^}]*\}', content)
print("Wild matching img rules:")
for m in matches_wild:
    print(m)
