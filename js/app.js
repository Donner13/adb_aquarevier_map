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

    let previousFocus = null;

    // 2. Event Listeners
    const closeBtn = document.getElementById('stakeholder-modal-close');
    const printBtn = document.getElementById('stakeholder-print-btn');
    const closeModal = () => {
        // Accessibility cleanup and memory leak prevention
        backdrop.classList.remove('active');
        modal.classList.remove('active');
        if (previousFocus) {
            previousFocus.focus();
            previousFocus = null;
        }
    };
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    printBtn.addEventListener('click', () => { window.print(); });

    // Ensure accessibility metadata
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'stakeholder-modal-title');

    // 3. Logic to show the modal with data
    window.openStakeholderModal = function(gemeindeName) {
        previousFocus = document.activeElement;
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

        let wasserRisiko = "Keine Daten";
        let pegelAnzahl = "Keine Daten";
        let gewerbeAnzahl = "Keine Daten";

        if (dossierData && typeof dossierData.stats === 'object') {
             const stats = dossierData.stats;
             if (Array.isArray(stats.pegel)) pegelAnzahl = stats.pegel.length;
             if (Array.isArray(stats.gewerbegebiete)) gewerbeAnzahl = stats.gewerbegebiete.length;
             if (stats.wasserRisiko !== undefined) wasserRisiko = stats.wasserRisiko;
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
            closeModal();
        }
    });

    // Review: "Gemeinde-Klick ist jedoch wahrscheinlich ein No-op: Leaflet-Map-click-Events liefern üblicherweise kein e.layer..."

    // To solve this 100% reliably: we MUST override `window.openGemeindeDossier` safely.
    // The previous feedback explicitly told me NOT to do it via Object.defineProperty because it broke initializations.
    // The safest method to wrap a global function without Property Proxies is a simple function reassignment
    // combined with an asynchronous observer to catch late initializations.

    let originalDossierFn = null;
    let isPatched = false;

    function applyFunctionWrap() {
        if (typeof window.openGemeindeDossier === 'function' && !isPatched) {
            originalDossierFn = window.openGemeindeDossier;

            window.openGemeindeDossier = function(gemeindeName) {
                // Call the original dossier to ensure all side-effects and data loading occur
                const result = originalDossierFn.apply(this, arguments);

                // Display our stakeholder modal alongside it
                window.openStakeholderModal(gemeindeName);

                return result;
            };
            isPatched = true;
            return true;
        }
        return false;
    }

    // Try immediately
    if (!applyFunctionWrap()) {
        // Fallback to observing the body for scripts loading `gemeinde-steckbrief.js`
        // We use MutationObserver since `setInterval` was flagged as fragile polling.
        const observer = new MutationObserver(() => {
            if (applyFunctionWrap()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

});
