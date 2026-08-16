import re

with open('internal.html', 'r') as f:
    text = f.read()

# Fix the open-data-export-btn missing check
old_btn = '<button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="window.exportActiveLayersData(\'geojson\')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>'
new_btn = '<button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData(\'geojson\')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>'

text = text.replace(old_btn, new_btn)

with open('internal.html', 'w') as f:
    f.write(text)
