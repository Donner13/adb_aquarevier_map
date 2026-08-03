import re

with open('js/qr-sharing.js', 'r') as f:
    content = f.read()

# Replace the QR offline svg
old_svg = r"data:image/svg\+xml;utf8,<svg xmlns=\\'http://www\.w3\.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23f1f5f9\\'/><text x=\\'100\\' y=\\'105\\' font-size=\\'12\\' text-anchor=\\'middle\\' fill=\\'%2364748b\\'>QR-Code \(Offline\)</text></svg>"
new_svg = r"data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23f1f5f9\\'/><text x=\\'100\\' y=\\'105\\' fill=\\'%2364748b\\' font-size=\\'12\\' text-anchor=\\'middle\\'>QR-Code (Offline)</text></svg>"

import subprocess
import os

with open("temp.svg", "w") as f:
    f.write("""<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f1f5f9'/><text x='100' y='105' font-size='12' text-anchor='middle' fill='%2364748b'>QR-Code (Offline)</text></svg>""")

subprocess.run(["svgo", "temp.svg"])

with open("temp.svg", "r") as f:
    compressed_svg = f.read().strip()

print(compressed_svg)
