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

        // Mocking the KPI calculation as requested based on the available data context
        // Real logic could query window.layerDataStore or window.geojsonData
        let wasserRisiko = "Niedrig";
        let pegelAnzahl = 0;
        let gewerbeAnzahl = 0;

        if (window.currentGemeindeDossier && window.currentGemeindeDossier.name === gemeindeName) {
             const stats = window.currentGemeindeDossier.stats;
             if (stats) {
                 pegelAnzahl = (stats.pegel ? stats.pegel.length : 0);
                 gewerbeAnzahl = (stats.gewerbegebiete ? stats.gewerbegebiete.length : 0);
                 if (gewerbeAnzahl > 2) wasserRisiko = "Mittel";
                 if (gewerbeAnzahl > 5) wasserRisiko = "Hoch";
                 if (stats.wasserRisiko) {
                     wasserRisiko = stats.wasserRisiko;
                 }
             }
        } else if (window.geojsonData && window.geojsonData.gemeinden && window.geojsonData.gemeinden.features) {
             // Fallback to searching geojsonData if currentGemeindeDossier is missing or delayed
             const feature = window.geojsonData.gemeinden.features.find(f => f.properties && f.properties.name === gemeindeName);
             if (feature && feature.properties && feature.properties.stats) {
                 const stats = feature.properties.stats;
                 pegelAnzahl = (stats.pegel ? stats.pegel.length : 0);
                 gewerbeAnzahl = (stats.gewerbegebiete ? stats.gewerbegebiete.length : 0);
                 if (gewerbeAnzahl > 2) wasserRisiko = "Mittel";
                 if (gewerbeAnzahl > 5) wasserRisiko = "Hoch";
                 if (stats.wasserRisiko) {
                     wasserRisiko = stats.wasserRisiko;
                 }
             }
        }

        document.getElementById('stakeholder-kpi-wasser').textContent = wasserRisiko;
        document.getElementById('stakeholder-kpi-pegel').textContent = pegelAnzahl;
        document.getElementById('stakeholder-kpi-gewerbe').textContent = gewerbeAnzahl;

        backdrop.classList.add('active');
        modal.classList.add('active');
    };

    // Review comment: "...Die globale Property-Überschreibung ist eine invasive und fragilere Kopplung als ein gezielter Click-/Dossier-Hook."
    // We should use a targeted hook. Leaflet map popups are the likely source of clicks.
    // Also, we need to ensure data isn't 0 when `currentGemeindeDossier` is missing.
    // If currentGemeindeDossier is missing, we must parse `window.geojsonData` to find actual data instead of letting it stay 0.

    // A non-invasive click hook instead of a global property patch
    document.addEventListener('click', function(e) {
        // Intercept buttons or links that trigger openGemeindeDossier
        const btn = e.target.closest('[onclick*="openGemeindeDossier"]');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
                const gemeindeName = match[1];

                // If window.openGemeindeDossier exists, call it so it runs its logic (fetching data etc)
                if (typeof window.openGemeindeDossier === 'function') {
                    // Let the inline handler do its job naturally, or manually invoke if we preventDefault
                }

                // Since we want to replace the UI or show our modal reliably, we wait a tick
                // for the original dossier logic to populate window.currentGemeindeDossier if it does,
                // then show our stakeholder modal and hide the original one.
                setTimeout(() => {
                    window.openStakeholderModal(gemeindeName);
                    // Hide original dossier modal if it appeared
                    const dossierModal = document.getElementById('gemeinde-steckbrief-modal');
                    if (dossierModal && dossierModal.classList.contains('active')) {
                        dossierModal.classList.remove('active');
                        const dossierBackdrop = document.getElementById('gemeinde-steckbrief-backdrop');
                        if (dossierBackdrop) dossierBackdrop.classList.remove('active');
                    }
                }, 100);
            }
        }
    });

});
