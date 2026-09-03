/**
 * js/gemeinde-steckbrief.js
 * AquaRevier Municipal Dossier Tool ("Was bedeutet das für unsere Gemeinde?")
 * Dynamically aggregates water infrastructure, actors, monitoring stations, and protection zones per municipality.
 */

(function() {
    window.currentGemeindeDossier = null;

    // Standard municipalities of the Rheinisches Revier (7 Kreise)
    const REVIER_GEMEINDEN = [
        "Aachen", "Aldenhoven", "Alsdorf", "Baesweiler", "Bedburg", "Bergheim", 
        "Blankenheim", "Dahlem", "Düren", "Elsdorf", "Erftstadt", "Erkelenz", 
        "Eschweiler", "Euskirchen", "Frechen", "Gangelt", "Geilenkirchen", "Grevenbroich", 
        "Heimbach", "Heinsberg", "Herzogenrath", "Hürtgenwald", "Inden", "Jülich", 
        "Kall", "Kerpen", "Kreuzau", "Langerwehe", "Linnich", "Mechernich", "Merzenich", 
        "Mönchengladbach", "Nettersheim", "Nideggen", "Niederzier", "Nörvenich", 
        "Pulheim", "Roetgen", "Rommerskirchen", "Simmerath", "Stolberg", "Titz", 
        "Übach-Palenberg", "Vettweiß", "Waldfeucht", "Wassenberg", "Wegberg", 
        "Wesseling", "Würselen", "Zülpich"
    ];

    /**
     * Collects all unique municipality names across loaded GeoJSON datasets.
     */
    window.getAvailableGemeinden = function() {
        const gemeindenMap = {};

        // Seed with standard Revier municipalities
        REVIER_GEMEINDEN.forEach(gName => {
            gemeindenMap[gName] = { name: gName, kreis: 'Rheinisches Revier', latSum: 0, lngSum: 0, count: 0 };
        });

        function addFeature(f) {
            if (!f || !f.properties) return;
            const p = f.properties;
            const name = p.gemeinde || p.stadt || p.ort;
            const kreis = p.kreis || p.zustaendigkeit_behoerde || 'Rheinisches Revier';
            if (name && typeof name === 'string' && name.trim().length > 1) {
                const cleanName = name.trim();
                if (!gemeindenMap[cleanName]) {
                    gemeindenMap[cleanName] = { name: cleanName, kreis: kreis, latSum: 0, lngSum: 0, count: 0 };
                }
                if (f.geometry && f.geometry.type === 'Point') {
                    const coords = f.geometry.coordinates;
                    gemeindenMap[cleanName].latSum += coords[1];
                    gemeindenMap[cleanName].lngSum += coords[0];
                    gemeindenMap[cleanName].count++;
                }
            }
        }

        // 1. Akteure
        if (window.geojsonData && Array.isArray(window.geojsonData.features)) {
            window.geojsonData.features.forEach(addFeature);
        }

        // 2. Layer Data Store
        if (window.layerDataStore) {
            Object.values(window.layerDataStore).forEach(geojson => {
                if (geojson && Array.isArray(geojson.features)) {
                    geojson.features.forEach(addFeature);
                }
            });
        }

        const list = Object.values(gemeindenMap).map(g => ({
            name: g.name,
            kreis: g.kreis,
            centerLat: g.count > 0 ? g.latSum / g.count : null,
            centerLng: g.count > 0 ? g.lngSum / g.count : null,
            totalObjects: g.count
        }));

        list.sort((a, b) => a.name.localeCompare(b.name, 'de'));
        return list;
    };

    /**
     * Compiles dossier data for a selected municipality name.
     * [AQ-108] Now auto-loads datasets.
     */
    window.compileGemeindeDossier = async function(gemeindeName) {
        if (!gemeindeName) return null;
        const targetName = gemeindeName.toLowerCase().trim();

        const dossier = {
            name: gemeindeName,
            kreis: 'Rheinisches Revier',
            region: 'Rheinisches Revier', // [AQ-110]
            centerLat: null,
            centerLng: null,
            stats: {
                akteure: [],
                messstellen: [],
                pegel: [],
                klaeranlagen: [],
                einleiter: [],
                stauanlagen: [],
                regenbecken: [],
                querbauwerke: []
            }
        };

        // [AQ-108] Ensure data is loaded
        if (window.layerLoaders) {
            const promises = Object.values(window.layerLoaders).map(loader => loader());
            try {
                await Promise.all(promises);
            } catch (e) {
                console.warn("Some layers failed to load for dossier", e);
            }
        }

        let lats = [];
        let lngs = [];

        function checkItem(f, categoryKey, label) {
            if (!f || !f.properties) return;
            const p = f.properties;

            // [AQ-109] Stricter matching: only explicit municipality fields or geometry
            const gField = (p.gemeinde || p.stadt || p.ort || '').toLowerCase().trim();
            const kField = (p.kreis || p.landkreis || '').toLowerCase().trim();

            const isNameMatch = gField === targetName;

            if (isNameMatch) {
                if (p.kreis && dossier.kreis === 'Rheinisches Revier') {
                    dossier.kreis = p.kreis;
                }
                const name = p.name || p.bezeichnung || p.betreiber || p.anlagen_nr || label;
                let lat = null, lng = null;
                if (f.geometry && f.geometry.type === 'Point') {
                    lat = f.geometry.coordinates[1];
                    lng = f.geometry.coordinates[0];
                    if (Number.isFinite(lat) && Number.isFinite(lng)) { // [AQ-111]
                        lats.push(lat);
                        lngs.push(lng);
                    }
                }
                dossier.stats[categoryKey].push({
                    name: name,
                    sub: p.gewaesser || p.typ || p.einleitungsart || p.gruppe || '',
                    lat: lat,
                    lng: lng,
                    props: p
                });
            }
        }

        // 1. Akteure
        if (window.geojsonData && Array.isArray(window.geojsonData.features)) {
            window.geojsonData.features.forEach(f => checkItem(f, 'akteure', 'Akteur'));
        }

        // 2. Point Layer datasets
        const mapKeys = {
            'grundwassermessstellen': 'messstellen',
            'pegel': 'pegel',
            'klaeranlagen': 'klaeranlagen',
            'elwas_einleiter': 'einleiter',
            'stauanlagen': 'stauanlagen',
            'regenbecken': 'regenbecken',
            'querbauwerke': 'querbauwerke'
        };

        if (window.layerDataStore) {
            Object.keys(mapKeys).forEach(storeKey => {
                const categoryKey = mapKeys[storeKey];
                const geojson = window.layerDataStore[storeKey];
                if (geojson && Array.isArray(geojson.features)) {
                    geojson.features.forEach(f => checkItem(f, categoryKey, storeKey));
                }
            });
        }

        if (lats.length > 0) {
            dossier.centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
            dossier.centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        }

        window.currentGemeindeDossier = dossier;
        return dossier;
    };

    /**
     * Renders and opens the Gemeinde Dossier Modal with ARIA accessibility [AQ-124].
     */
    window.openGemeindeDossier = async function(gemeindeName) {
        let modal = document.getElementById('gemeinde-dossier-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'gemeinde-dossier-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'dossier-title');
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10008;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) window.closeGemeindeDossier();
            });
        }

        modal.innerHTML = `
            <div id="dossier-card" style="background: #ffffff; width: 100%; max-width: 620px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;">
                <div style="padding: 40px; text-align: center;">
                    <div class="spinner-border text-primary" role="status"></div>
                    <div style="margin-top: 10px;">Dossier wird geladen...</div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.style.opacity = '1');

        const dossier = await window.compileGemeindeDossier(gemeindeName);
        if (!dossier) {
            window.closeGemeindeDossier();
            return;
        }

        const totalObj = Object.values(dossier.stats).reduce((acc, arr) => acc + arr.length, 0);

        modal.innerHTML = `
            <div id="dossier-card" style="background: #ffffff; width: 100%; max-width: 620px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;">
                <div style="background: #1e293b; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div id="dossier-title" style="font-size: 1.0rem; font-weight: 700;">🏛️ Gemeinde-Steckbrief: ${escapeHtml(dossier.name)}</div>
                        <div style="font-size: 0.6875rem; color: #94a3b8;">${escapeHtml(dossier.kreis)} • ${totalObj} registrierte Infrastruktur-Objekte</div>
                    </div>
                    <button id="dossier-close-btn" type="button" onclick="closeGemeindeDossier()" aria-label="Schließen" title="Schließen" style="background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer;">✕</button>
                </div>
                
                <div style="padding: 16px; overflow-y: auto; flex: 1; font-size: 0.75rem;">
                    <!-- Key Figures Grid -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center;">
                            <div style="font-size: 1.125rem; font-weight: 700; color: #2563eb;">${dossier.stats.akteure.length}</div>
                            <div style="font-size: 0.625rem; color: #64748b;">🤝 Akteure</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center;">
                            <div style="font-size: 1.125rem; font-weight: 700; color: #0284c7;">${dossier.stats.messstellen.length}</div>
                            <div style="font-size: 0.625rem; color: #64748b;">💧 Messstellen</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center;">
                            <div style="font-size: 1.125rem; font-weight: 700; color: #7c3aed;">${dossier.stats.einleiter.length + dossier.stats.klaeranlagen.length}</div>
                            <div style="font-size: 0.625rem; color: #64748b;">🏭 Abwasser/Einleiter</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center;">
                            <div style="font-size: 1.125rem; font-weight: 700; color: #d97706;">${dossier.stats.pegel.length + dossier.stats.stauanlagen.length + dossier.stats.regenbecken.length + dossier.stats.querbauwerke.length}</div>
                            <div style="font-size: 0.625rem; color: #64748b;">🌊 Gewässerbauwerke</div>
                        </div>
                    </div>

                    <!-- Actions Bar -->
                    <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                        ${(Number.isFinite(dossier.centerLat) && Number.isFinite(dossier.centerLng)) ? `
                            <button type="button" class="btn btn-sm btn-primary" style="flex:1; font-size: 0.6875rem;" onclick="zoomToGemeindeCenter(${dossier.centerLat}, ${dossier.centerLng})">
                                📍 In Karte zentrieren
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-primary" style="flex:1; font-size: 0.6875rem;" onclick="triggerGemeindeRadiusAnalysis(${dossier.centerLat}, ${dossier.centerLng})">
                                🎯 5-km-Umkreis analysieren
                            </button>
                        ` : `
                            <div style="flex:1; background:#f1f5f9; color:#64748b; padding:6px; border-radius:4px; text-align:center; font-size: 0.625rem;">
                                ⚠️ Keine Koordinaten für Zentrierung verfügbar.
                            </div>
                        `}
                        <button type="button" class="btn btn-sm btn-outline-success" style="font-size: 0.6875rem;" onclick="exportGemeindeDossierCSV()">
                            📥 CSV Export
                        </button>
                    </div>

                    <!-- Category Lists -->
                    ${renderDossierCategorySection('🤝 Regionale Akteure & Partner', dossier.stats.akteure)}
                    ${renderDossierCategorySection('💧 Grundwassermessstellen', dossier.stats.messstellen)}
                    ${renderDossierCategorySection('📏 Flusspegel', dossier.stats.pegel)}
                    ${renderDossierCategorySection('🚰 Kläranlagen & Industrieeinleiter', [...dossier.stats.klaeranlagen, ...dossier.stats.einleiter])}
                    ${renderDossierCategorySection('⛰️ Stauanlagen, Regenbecken & Querbauwerke', [...dossier.stats.stauanlagen, ...dossier.stats.regenbecken, ...dossier.stats.querbauwerke])}
                </div>
            </div>
        `;

        // Focus management [AQ-124]
        window._lastFocusElement = document.activeElement;
        setTimeout(() => {
            const closeBtn = document.getElementById('dossier-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    };

    function renderDossierCategorySection(title, items) {
        if (!items || items.length === 0) return '';
        let html = `
            <div style="margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <div style="background: #f1f5f9; padding: 6px 10px; font-weight: 600; font-size: 0.6875rem; color: #334155; display: flex; justify-content: space-between;">
                    <span>${title}</span>
                    <span class="badge bg-secondary" style="font-size: 0.625rem;">${items.length}</span>
                </div>
                <div style="max-height: 100px; overflow-y: auto;">
        `;
        items.forEach(item => {
            html += `
                <div style="padding: 4px 10px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500; color: #0f172a;">${escapeHtml(item.name)}</span>
                    ${item.sub ? `<span style="font-size: 0.625rem; color: #64748b;">${escapeHtml(item.sub)}</span>` : ''}
                </div>
            `;
        });
        html += `</div></div>`;
        return html;
    }

    window.closeGemeindeDossier = function() {
        const modal = document.getElementById('gemeinde-dossier-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                if (window._lastFocusElement) window._lastFocusElement.focus();
            }, 300);
        }
    };

    window.zoomToGemeindeCenter = function(lat, lng) {
        if (typeof map !== 'undefined' && Number.isFinite(lat) && Number.isFinite(lng)) {
            map.setView([lat, lng], 13, { animate: true });
        }
        window.closeGemeindeDossier();
    };

    window.triggerGemeindeRadiusAnalysis = function(lat, lng) {
        window.closeGemeindeDossier();
        if (typeof window.runRadiusAnalysis === 'function') {
            window.runRadiusAnalysis(lat, lng, 5000);
        }
    };

    /**
     * Exports current dossier data as CSV with sanitization [AQ-106, AQ-107].
     */
    window.exportGemeindeDossierCSV = function() {
        if (!window.currentGemeindeDossier) return;
        const d = window.currentGemeindeDossier;

        const headers = ['Gemeinde', 'Kategorie', 'Name', 'Details', 'Breitengrad', 'Längengrad'];
        let csvRows = [headers.map(h => window.sanitizeCsvCell(h)).join(';')];

        Object.keys(d.stats).forEach(cat => {
            d.stats[cat].forEach(item => {
                const row = [
                    d.name,
                    cat,
                    item.name || '',
                    item.sub || '',
                    item.lat || '',
                    item.lng || ''
                ];
                csvRows.push(row.map(cell => window.sanitizeCsvCell(cell)).join(';'));
            });
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AquaRevier_Steckbrief_${d.name}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /**
     * Populates municipality dropdown selectors in the sidebar immediately.
     */
    window.populateGemeindeSelects = function() {
        const selects = document.querySelectorAll('.gemeinde-dossier-select');
        if (selects.length === 0) return;

        const list = window.getAvailableGemeinden();
        selects.forEach(select => {
            select.innerHTML = '<option value="">-- Gemeinde wählen --</option>' +
                list.map(g => `<option value="${escapeHtml(g.name)}">${escapeHtml(g.name)}${g.totalObjects > 0 ? ` (${g.totalObjects} Objekte)` : ''}</option>`).join('');
        });
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Populate immediately and re-populate after DOM load and dataset loads
    window.populateGemeindeSelects();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.populateGemeindeSelects();
            setTimeout(window.populateGemeindeSelects, 1500);
        });
    } else {
        setTimeout(window.populateGemeindeSelects, 1500);
    }
})();
