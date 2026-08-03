import re
with open('index.html', 'r') as f:
    content = f.read()

# Replace the URL with data URI
old_img = '<img src="https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/FiW_RGB_2022.svg" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="FiW">'

with open('fiw.svg', 'r') as f:
    svg_data = f.read().strip()

import urllib.parse
data_uri = "data:image/svg+xml;utf8," + urllib.parse.quote(svg_data)
new_img = f'<img src="{data_uri}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="FiW">'

content = content.replace(old_img, new_img)

with open('index.html', 'w') as f:
    f.write(content)
