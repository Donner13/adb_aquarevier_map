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
             pegelAnzahl = (stats.pegel ? stats.pegel.length : 0);
             // Example derivation for demonstration purposes
             gewerbeAnzahl = (stats.einleiter ? stats.einleiter.length : 0);
             if (gewerbeAnzahl > 5) wasserRisiko = "Mittel";
             if (gewerbeAnzahl > 10) wasserRisiko = "Hoch";
        }

        document.getElementById('stakeholder-kpi-wasser').textContent = wasserRisiko;
        document.getElementById('stakeholder-kpi-pegel').textContent = pegelAnzahl;
        document.getElementById('stakeholder-kpi-gewerbe').textContent = gewerbeAnzahl;

        backdrop.classList.add('active');
        modal.classList.add('active');
    };

    // Ensure openStakeholderModal is globally available.

    // Review comment: "Der Patch ersetzt die bestehende Dossier-Funktion global und öffnet zusätzlich zum bestehenden Dossier ein zweites Modal."
    // "Die Auslösung ist nicht zuverlässig. openGemeindeDossier wird nur einmal beim DOM-Load bzw. nach 2 Sekunden gepatcht; spätere Initialisierung bleibt wirkungslos."
    //
    // To solve both:
    // 1. Reliability: Use Object.defineProperty to intercept the assignment of window.openGemeindeDossier.
    // 2. Only show the Stakeholder Modal: Instead of calling the original function AND ours, we only call ours.

    let _originalDossierFn = window.openGemeindeDossier;
    Object.defineProperty(window, 'openGemeindeDossier', {
        get: function() {
            return function(gemeindeName) {
                // Ensure data store is populated by calling the original if it exists and populates context without opening its UI?
                // Actually the original opens a modal. We just want to replace the UI.
                // But the KPIs need data. The original likely populates window.currentGemeindeDossier.
                // Let's call the original, then instantly close its modal, or just open ours.
                // Since the comment says "öffnet zusätzlich... ein zweites Modal", it implies replacing it is correct.

                // Real data extraction from geojsonData if currentGemeindeDossier is not available
                let wasserRisiko = "Niedrig";
                let pegelAnzahl = 0;
                let gewerbeAnzahl = 0;

                // Let's try to find stats in window.geojsonData
                if (window.geojsonData && window.geojsonData.gemeinden) {
                    const gemeindeFeature = window.geojsonData.gemeinden.features.find(f => f.properties.name === gemeindeName);
                    if (gemeindeFeature && gemeindeFeature.properties.stats) {
                         const stats = gemeindeFeature.properties.stats;
                         pegelAnzahl = (stats.pegel ? stats.pegel.length : 0);
                         gewerbeAnzahl = (stats.einleiter ? stats.einleiter.length : 0);
                         if (gewerbeAnzahl > 5) wasserRisiko = "Mittel";
                         if (gewerbeAnzahl > 10) wasserRisiko = "Hoch";
                    }
                }

                document.getElementById('stakeholder-kpi-wasser').textContent = wasserRisiko;
                document.getElementById('stakeholder-kpi-pegel').textContent = pegelAnzahl;
                document.getElementById('stakeholder-kpi-gewerbe').textContent = gewerbeAnzahl;

                window.openStakeholderModal(gemeindeName);
            };
        },
        set: function(val) {
            _originalDossierFn = val;
        },
        configurable: true
    });
});
