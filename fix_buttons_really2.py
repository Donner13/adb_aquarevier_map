import re

with open('internal.html', 'r') as f:
    text = f.read()

# I see what I did. I need to be more precise with my replace.
old_section = '''                    <button id="share-view-btn" class="filter-btn" style="width: 100%; margin-bottom: 12px; font-size: 11px;" title="Kopiert einen Link, der die aktuelle Filter- und Kartenansicht wiederherstellt">🔗 Ansicht teilen</button>
                    <div class="contact-list" id="contact-list-container">
                        <!-- Filled by JS -->
                    </div>
                </div>
            </div>
            <div class="sidebar-footer">'''

new_section = '''                    <button id="share-view-btn" class="filter-btn" data-i18n-key="share_view" style="width: 100%; margin-bottom: 12px; font-size: 11px;" title="Kopiert einen Link, der die aktuelle Filter- und Kartenansicht wiederherstellt">🔗 Ansicht teilen</button>
                    <div class="contact-list" id="contact-list-container">
                        <!-- Filled by JS -->
                    </div>
                </div>

                <!-- Export Section -->
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="export-csv-btn" class="filter-btn" style="flex: 1; justify-content: center;">📄 CSV Export</button>
                        <button id="export-pdf-btn" class="filter-btn" style="flex: 1; justify-content: center;">📑 PDF Export</button>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="embed-open-btn" class="filter-btn" style="flex: 1; justify-content: center;">🔗 Karte einbetten</button>
                        <button id="open-data-export-btn" class="filter-btn" data-i18n-key="open_data_export" style="flex: 1; justify-content: center;" onclick="window.exportActiveLayersData('geojson')" title="Exportiert alle aktiven Karten-Layer als Open-Data GeoJSON">💾 Geodaten-Export</button>
                    </div>
                    <button id="generate-report-btn" class="filter-btn active" data-i18n-key="generate_report" style="justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 600; color: white;">📊 Bericht generieren (PDF)</button>
                    <button id="generate-sprechzettel-btn" class="filter-btn" style="justify-content: center;">🗣️ Sprechzettel generieren</button>
                    <button id="generate-beschlussvorlage-btn" class="filter-btn" style="justify-content: center;">📋 Beschlussvorlage generieren</button>
                </div>
            </div>
            <div class="sidebar-footer">'''

text = text.replace(old_section, new_section)

with open('internal.html', 'w') as f:
    f.write(text)
