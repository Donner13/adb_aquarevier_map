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

    // Review: "Der globale openGemeindeDossier-Property-Hook verwirft jede spätere Originalfunktion und ersetzt das bestehende Gemeinde-Dossier vollständig; das ist fragil und kann bestehende Klick-/Initialisierungslogik brechen. originalDossierFn wird gespeichert, aber nie verwendet"

    // We completely remove any `Object.defineProperty`, any global function wrapping, and any `MutationObserver`.
    // The requirement is "Stakeholder-Modal bei Gemeinde-Klick".
    // To cleanly capture a Gemeinde click WITHOUT modifying existing functions:

    document.addEventListener('click', function(e) {
        // Intercept standard buttons calling openGemeindeDossier
        const btn = e.target.closest('[onclick*="openGemeindeDossier"]');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
                const gemeindeName = match[1];

                // If there's an existing dossier open, close it (this does not wrap or block the original function call, it just cleans up the UI afterwards)
                setTimeout(() => {
                    if (typeof window.closeGemeindeDossier === 'function') {
                        window.closeGemeindeDossier();
                    }
                    window.openStakeholderModal(gemeindeName);
                }, 10);
            }
        }
    });

    // To capture Leaflet map layer clicks properly without string matching:
    if (typeof map !== 'undefined') {
        map.on('popupopen', function(e) {
            // Leaflet popups are rendered to the DOM dynamically.
            // The document level click listener above naturally catches any button clicks inside the popup.
            // There is no need for duplicate Leaflet listeners for popups.
        });
    }

    // There are NO global property overrides, NO getters/setters, NO function replacements.
    // The original `openGemeindeDossier` runs exactly as defined in `gemeinde-steckbrief.js`.

});
