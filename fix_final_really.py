import re

with open('internal.html', 'r') as f:
    text = f.read()

# 1. Add embed CSS
if '.embed-mini-legend {' not in text:
    css_to_add = '''
        /* Embed Mode CSS */
        body.embed-mode #sidebar {
            display: none !important;
        }
        body.embed-mode .unified-search-container {
            display: none !important;
        }
        body.embed-mode #map {
            width: 100vw !important;
            flex: none !important;
        }
        .embed-mini-legend {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: var(--bg-surface);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            z-index: 1000;
            font-size: 11px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            gap: 4px;
        }
        body.embed-mode .embed-mini-legend {
            display: flex;
        }
        .embed-mini-legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .embed-mini-legend-color {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
        .embed-back-link {
            font-size: 11px;
            color: var(--accent-primary);
            text-decoration: none;
            margin-bottom: 6px;
            display: inline-block;
        }'''
    # insert before </style>
    text = text.replace('    </style>', css_to_add + '\n    </style>')

# 2. Add Embed JS logic
if 'miniLegendContainer.appendChild(item)' not in text:
    js_to_add = '''
            // Build Mini Legend
            const miniLegendContainer = document.getElementById('embed-mini-legend-items');
            for (const [group, color] of Object.entries(groupColors)) {
                if (group !== 'Konsortium') {
                    const item = document.createElement('div');
                    item.className = 'embed-mini-legend-item';
                    item.innerHTML = `<span class="embed-mini-legend-color" style="background-color: ${color}"></span><span>${group}</span>`;
                    miniLegendContainer.appendChild(item);
                }
            }

            // Set dynamic back link
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('embed');
            document.getElementById('embed-back-link').href = currentUrl.toString();'''

    text = text.replace("document.body.classList.add('embed-mode');", "document.body.classList.add('embed-mode');\n" + js_to_add)


# 3. Add Embed HTML right after #map
if '<div id="embed-mini-legend"' not in text:
    html_to_add = '''
        <div id="embed-mini-legend" class="embed-mini-legend">
            <a id="embed-back-link" class="embed-back-link" target="_blank" rel="noopener noreferrer">↗ Vollständige Karte ansehen</a>
            <div id="embed-mini-legend-items"></div>
        </div>'''
    text = text.replace('<div id="map"></div>', '<div id="map"></div>' + html_to_add)


# 4. Update Sidebar buttons (Share and Export)
old_export_section = '''<button id="share-view-btn" class="filter-btn" style="width: 100%; margin-bottom: 12px; font-size: 11px;" title="Kopiert einen Link, der die aktuelle Filter- und Kartenansicht wiederherstellt">🔗 Ansicht teilen</button>
                    <div class="contact-list" id="contact-list-container">
                        <!-- Filled by JS -->
                    </div>
                </div>
            </div>
            <div class="sidebar-footer">'''

new_export_section = '''<button id="share-view-btn" class="filter-btn" data-i18n-key="share_view" style="width: 100%; margin-bottom: 12px; font-size: 11px;" title="Kopiert einen Link, der die aktuelle Filter- und Kartenansicht wiederherstellt">🔗 Ansicht teilen</button>
                    <div class="contact-list" id="contact-list-container">
                        <!-- Filled by JS -->
                    </div>
                </div>

                <!-- Export Section -->
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('csv')">📄 CSV Export</button>
                        <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📑 PDF Export</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="embed-open-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(typeof openEmbedModal==='function') openEmbedModal()">🔗 Karte einbetten</button>
                        <button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('geojson')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>
                    </div>
                    <button id="generate-report-btn" class="filter-btn active" data-i18n-key="generate_report" style="justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 600; color: white;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📊 Bericht generieren (PDF)</button>
                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>
                </div>
            </div>
            <div class="sidebar-footer">'''

text = text.replace(old_export_section, new_export_section)


# 5. Clean up the duplicate buttons in the editor-panel that I copied earlier by mistake?
# No, let's just remove them!
text = re.sub(r'\s*<button class="filter-btn" id="export-csv-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="export-pdf-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="open-data-export-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="embed-open-btn".*?</button>', '', text)
text = re.sub(r'\s*<button class="filter-btn" id="generate-report-btn".*?</button>', '', text)

# Add them BACK correctly into the Export Section (because re.sub removes ALL occurrences!)
text = text.replace('''<!-- Export Section -->
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">


                    </div>
                    <div style="display: flex; gap: 8px;">


                    </div>

                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>
                </div>''', '''<!-- Export Section -->
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('csv')">📄 CSV Export</button>
                        <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📑 PDF Export</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="embed-open-btn" class="filter-btn" style="flex: 1; justify-content: center;" onclick="if(typeof openEmbedModal==='function') openEmbedModal()">🔗 Karte einbetten</button>
                        <button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="if(window.exportActiveLayersData) window.exportActiveLayersData('geojson')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>
                    </div>
                    <button id="generate-report-btn" class="filter-btn active" data-i18n-key="generate_report" style="justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 600; color: white;" onclick="if(document.getElementById('btn-generate-report')) document.getElementById('btn-generate-report').click()">📊 Bericht generieren (PDF)</button>
                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>
                </div>''')


# 6. Update embed modal close btn text
text = text.replace('<button class="embed-modal-close" id="embed-close-btn">&times;</button>', '<button class="embed-modal-close" id="embed-close-btn" aria-label="Schließen">&times;</button>')

# 7. Presentation bar HTML fix
presentation_old = '''        <div id="presentation-bar">
            <div class="title" id="presentation-title"></div>
            <div class="step-counter" id="presentation-step-counter"></div>
            <div class="caption" id="presentation-caption"></div>
            <div class="controls">
                <button id="prev-step-btn" class="control-btn">← Zurück</button>
                <button id="next-step-btn" class="control-btn">Weiter →</button>
                <button id="exit-presentation-btn" class="control-btn exit-btn">✕ Beenden</button>
            </div>
        </div>
    </div>'''

presentation_new = '''    </div>

    <div id="presentation-bar">
        <div class="title" id="presentation-title"></div>
        <div class="step-counter" id="presentation-step-counter"></div>
        <div class="caption" id="presentation-caption"></div>
        <div class="controls">
            <button id="prev-step-btn" class="control-btn">← Zurück</button>
            <button id="next-step-btn" class="control-btn">Weiter →</button>
            <button id="exit-presentation-btn" class="control-btn exit-btn">✕ Beenden</button>
        </div>
    </div>'''

text = text.replace(presentation_old, presentation_new)

with open('internal.html', 'w') as f:
    f.write(text)

print("Done")
