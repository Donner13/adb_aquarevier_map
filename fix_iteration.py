import re

with open('js/app-enhancements.js', 'r') as f:
    content = f.read()

# Replace the inner loop to match EXACTLY how original logic matched keys, or to fix the duplication
# The reviewer notes: "Auffällig: Der aktive-Overlay-Pfad ordnet Layer nicht wirklich zu, sondern fügt für jedes aktive Overlay sämtliche `layerDataStore`-Features hinzu; mehrere aktive Overlays erzeugen Duplikate."

# Original inner loop was probably matching `label` to `key` or something. Let's see how `index.html` stores `overlayMaps`.

import urllib.request
