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
                <button class="stakeholder-print-btn" onclick="window.print()">🖨️ Drucken / PDF</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 2. Close Event Listeners
    const closeBtn = document.getElementById('stakeholder-modal-close');
    const closeModal = () => {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
    };
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

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

    // 4. Global Intercept logic: Monkey patch or listen to Gemeinde clicks
    // In universal-search or gemeinde-steckbrief, openGemeindeDossier is usually called.
    // We override it to show this stakeholder modal as well.
    if (typeof window.openGemeindeDossier === 'function') {
        const originalOpenDossier = window.openGemeindeDossier;
        window.openGemeindeDossier = function(gemeindeName) {
            // First call the original behavior to compile the dossier (in background or visually)
            const result = originalOpenDossier(gemeindeName);
            // Then pop up our stakeholder modal
            window.openStakeholderModal(gemeindeName);
            return result;
        };
    } else {
        // Fallback if not initialized yet
        setTimeout(() => {
            if (typeof window.openGemeindeDossier === 'function') {
                const originalOpenDossier = window.openGemeindeDossier;
                window.openGemeindeDossier = function(gemeindeName) {
                    const result = originalOpenDossier(gemeindeName);
                    window.openStakeholderModal(gemeindeName);
                    return result;
                };
            }
        }, 2000);
    }
});
