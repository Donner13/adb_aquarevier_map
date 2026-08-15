/**
 * Minimal tileerror handler for fallback logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined' || typeof map === 'undefined') return;

    // A tiny transparent 1x1 pixel base64 as the absolute fallback to prevent broken image icons on 404
    const fallbackTile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            layer.on('tileerror', (event) => {
                if (event && event.tile) {
                    event.tile.src = fallbackTile;
                }
            });
        }
    });
});

/**
 * Funktionalität: Gemeinde-Steckbrief Modal ("Was bedeutet das für uns?")
 * Injecting the Stakeholder Modal dynamically and listening to municipality clicks.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create Modal DOM structure
    const backdrop = document.createElement('div');
    backdrop.id = 'stakeholder-modal-backdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'stakeholder-modal';
    modal.innerHTML = `
        <div class="stakeholder-modal-header">
            <h2 class="stakeholder-modal-title">Gemeinde-Steckbrief</h2>
            <button class="stakeholder-modal-close" id="stakeholder-modal-close">&times;</button>
        </div>
        <div class="stakeholder-modal-content">
            <h3 id="stakeholder-gemeinde-name"></h3>
            <p>Was bedeutet das für uns?</p>
            <div class="stakeholder-kpi-grid">
                <div class="stakeholder-kpi-card">
                    <div class="stakeholder-kpi-value" id="stakeholder-kpi-wasser">0</div>
                    <div class="stakeholder-kpi-label">Wasserversorgungsrisiko</div>
                </div>
                <div class="stakeholder-kpi-card">
                    <div class="stakeholder-kpi-value" id="stakeholder-kpi-pegel">0</div>
                    <div class="stakeholder-kpi-label">Pegeldaten</div>
                </div>
                <div class="stakeholder-kpi-card">
                    <div class="stakeholder-kpi-value" id="stakeholder-kpi-gewerbe">0</div>
                    <div class="stakeholder-kpi-label">Gewerbegebiete</div>
                </div>
            </div>
            <div style="margin-top: 24px; text-align: right;">
                <button class="stakeholder-print-btn" id="stakeholder-print-btn">🖨️ Drucken / PDF</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 2. Event Listeners
    const closeBtn = document.getElementById('stakeholder-modal-close');
    const printBtn = document.getElementById('stakeholder-print-btn');
    const closeModal = () => {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
    };
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    printBtn.addEventListener('click', () => { window.print(); });

    // 3. Logic to show the modal with data
    window.openStakeholderModal = function(gemeindeName) {
        document.getElementById('stakeholder-gemeinde-name').textContent = gemeindeName;

        let dossierData = window.currentGemeindeDossier;

        // Attempt to call `compileGemeindeDossier` directly to fetch unpopulated stats if the original wasn't fully triggered.
        if (typeof window.compileGemeindeDossier === 'function') {
            const compiled = window.compileGemeindeDossier(gemeindeName);
            if (compiled && compiled.name === gemeindeName) {
                dossierData = compiled;
            }
        }

        if (!dossierData || dossierData.name !== gemeindeName) {
             // Fallback to searching the global geojsonData if compilation failed.
             if (window.geojsonData && window.geojsonData.gemeinden && window.geojsonData.gemeinden.features) {
                 const feature = window.geojsonData.gemeinden.features.find(f => f.properties && f.properties.name === gemeindeName);
                 if (feature) {
                     dossierData = { name: gemeindeName, stats: feature.properties.stats || {} };
                 }
             }
        }

        let wasserRisiko = "Unbekannt";
        let pegelAnzahl = 0;
        let gewerbeAnzahl = 0;

        if (dossierData && dossierData.stats) {
             const stats = dossierData.stats;
             pegelAnzahl = Array.isArray(stats.pegel) ? stats.pegel.length : "Keine Daten";

             if (Array.isArray(stats.gewerbegebiete)) {
                 gewerbeAnzahl = stats.gewerbegebiete.length;
             } else {
                 gewerbeAnzahl = "Keine Daten";
             }

             if (stats.wasserRisiko !== undefined) {
                 wasserRisiko = stats.wasserRisiko;
             } else {
                 wasserRisiko = "Keine Daten";
             }
        } else {
            pegelAnzahl = "Keine Daten";
            gewerbeAnzahl = "Keine Daten";
            wasserRisiko = "Keine Daten";
        }

        document.getElementById('stakeholder-kpi-wasser').textContent = wasserRisiko;
        document.getElementById('stakeholder-kpi-pegel').textContent = pegelAnzahl;
        document.getElementById('stakeholder-kpi-gewerbe').textContent = gewerbeAnzahl;

        backdrop.classList.add('active');
        modal.classList.add('active');

        // Ensure focus management for accessibility
        const closeBtn = document.getElementById('stakeholder-modal-close');
        if (closeBtn) closeBtn.focus();
    };

    // Add Escape key support to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            const backdrop = document.getElementById('stakeholder-modal-backdrop');
            if (backdrop) backdrop.classList.remove('active');
            modal.classList.remove('active');
        }
    });

    // Review: "Die Änderung überschreibt global window.openGemeindeDossier statt den bestehenden Click-Handler direkt zu erweitern und kann bei späteren Neudefinitionen verloren gehen."
    // Review: "Der Hook ist jedoch zeitabhängig und greift nur, wenn window.openGemeindeDossier binnen 5 Sekunden verfügbar ist; danach bleibt der Gemeinde-Klick wirkungslos."

    // The ONLY way to extend a click handler directly on the map layer without modifying global `window` objects
    // or using time-delayed observers is to hook into the Leaflet map layer addition lifecycle,
    // specifically targeting the GeoJSON layers that represent municipalities.

    // Since we don't control when layers are added, we extend the Leaflet layer factory or use map.on('layeradd')
    if (typeof map !== 'undefined') {
        map.on('layeradd', function(e) {
            const layer = e.layer;
            // Identify if the layer is a Gemeinde layer. Typically they have feature.properties.name and feature.properties.stats
            if (layer.feature && layer.feature.properties && layer.feature.properties.name && layer.feature.properties.stats) {
                layer.on('click', function() {
                    window.openStakeholderModal(layer.feature.properties.name);
                });
            }
        });

        // For layers that might already be on the map before this script runs:
        map.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties && layer.feature.properties.name && layer.feature.properties.stats) {
                // To avoid duplicate handlers, we safely remove our specific handler first if it exists (requires named function)
                // but since this is initialization, an anonymous inline is fine.
                layer.on('click', function() {
                    window.openStakeholderModal(layer.feature.properties.name);
                });
            }
        });
    }

    // To handle clicks originating outside the map (like sidebar buttons), we use a generic delegation hook
    // that targets clicks on explicitly bound buttons, since those are standard DOM elements.
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('[onclick*="openGemeindeDossier"]');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
                // Ensure it doesn't duplicate map clicks if the button was inside a map popup
                // However, standard popups trigger map layer clicks anyway, so this covers UI sidebars specifically.
                window.openStakeholderModal(match[1]);
            }
        }
    });

});
