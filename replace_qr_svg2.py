import re

with open('js/qr-sharing.js', 'r') as f:
    content = f.read()

old_svg = r"data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23f1f5f9\\'/><text x=\\'100\\' y=\\'105\\' font-size=\\'12\\' text-anchor=\\'middle\\' fill=\\'%2364748b\\'>QR-Code (Offline)</text></svg>"
new_svg = r"data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><path fill=\\'%23f1f5f9\\' d=\\'M0 0h200v200H0z\\'/><text x=\\'100\\' y=\\'105\\' fill=\\'%2364748b\\' font-size=\\'12\\' text-anchor=\\'middle\\'>QR-Code (Offline)</text></svg>"

content = content.replace(old_svg, new_svg)

with open('js/qr-sharing.js', 'w') as f:
    f.write(content)
