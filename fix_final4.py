import re

with open('internal.html', 'r') as f:
    text = f.read()

text = text.replace('''                    <div style="display: flex; gap: 8px;">
                        <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;">📄 CSV Export</button>
                        <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;">📑 PDF Export</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="embed-open-btn" class="filter-btn" style="flex: 1; justify-content: center;">🔗 Karte einbetten</button>
                        <button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('geojson')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>
                    </div>
                    <button id="generate-report-btn" class="filter-btn active" data-i18n-key="generate_report" style="justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 600; color: white;">📊 Bericht generieren (PDF)</button>
                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>''', '''                    <div style="display: flex; gap: 8px;">
                        <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('csv')">📄 CSV Export</button>
                        <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📑 PDF Export</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="embed-open-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(typeof openEmbedModal==='function') openEmbedModal()">🔗 Karte einbetten</button>
                        <button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('geojson')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>
                    </div>
                    <button id="generate-report-btn" class="filter-btn active" data-i18n-key="generate_report" style="justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 600; color: white;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📊 Bericht generieren (PDF)</button>
                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>''')

with open('internal.html', 'w') as f:
    f.write(text)
