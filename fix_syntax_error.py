import os
import re

for f in ['index.html', 'internal.html']:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()

        content = content.replace("return makeMarkerAccessible(L.marker([lat, lng], { icon: icon }), `${name}, ${group}`);\n        }}", "return makeMarkerAccessible(L.marker([lat, lng], { icon: icon }), `${name}, ${group}`);\n        }")

        with open(f, 'w') as file:
            file.write(content)
