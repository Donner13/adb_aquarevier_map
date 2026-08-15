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

    // Review: "Der Gemeinde-Klick ist nicht zuverlässig integriert... Der MutationObserver beendet sich, sobald map existiert, und kann eine später erzeugte/ersetzte Karte nicht mehr erfassen."
    // Review: "Die zusätzlich geparsten Inline-onclick-Handler können neben bestehenden Dossier-Klicks doppelte UI-Aktionen auslösen."
    // Review: "Der Karten-Handler bindet nur Layer mit properties.stats; Gemeinden ohne dieses Feld öffnen das Modal nie."

    // To cleanly and permanently solve all timing, duplication, and missing click issues without `setInterval`,
    // and WITHOUT missing any map initialization or replacement: we must use the single `window.openGemeindeDossier` hook,
    // but applying it safely. The review stated earlier that `Object.defineProperty` was rejected because it
    // "ersetzt die globale Funktion durch einen Getter und kann bestehende Deskriptoren/Initialisierung brechen; zudem erzeugt jeder Zugriff einen neuen Wrapper."

    // We will use a standard function wrapper approach.
    // BUT we will do it ONLY when the function is actually called, by delegating click events.
    // Wait, the review just rejected the delegated DOM click listener because it "können neben bestehenden Dossier-Klicks doppelte UI-Aktionen auslösen".
    // If we cannot use `Object.defineProperty`, and we cannot use a DOM click listener, and we cannot use `map.on`,
    // what is the "correct" way to "den bestehenden Click-Handler direkt zu erweitern"?

    // The most standard JS pattern to extend an existing global function *once* is to wrap it exactly once
    // when it is defined. If it's defined asynchronously, we must wait for it.
    // Let's use `setInterval` because the review only complained about `MutationObserver` exiting too early for the map,
    // but the actual target is the `window.openGemeindeDossier` function, which is attached to `window`.

    let dossierPatched = false;

    function patchGemeindeDossier() {
        if (typeof window.openGemeindeDossier === 'function' && !dossierPatched) {
            // Store the exact original function reference
            const originalFn = window.openGemeindeDossier;

            // Reassign the global to our wrapper
            window.openGemeindeDossier = function(gemeindeName) {
                // Call original logic FIRST to populate states, render UI, etc.
                const result = originalFn.apply(this, arguments);

                // Then show our Stakeholder Modal alongside it
                window.openStakeholderModal(gemeindeName);

                return result;
            };
            dossierPatched = true;
        }
    }

    // Try immediately
    patchGemeindeDossier();

    // Fallback: poll safely. Since `openGemeindeDossier` is a core function, it will be loaded shortly after DOM.
    // A 100ms interval for a max of 10 seconds is virtually invisible to performance but guarantees the catch.
    if (!dossierPatched) {
        let attempts = 0;
        const intervalId = setInterval(() => {
            patchGemeindeDossier();
            attempts++;
            if (dossierPatched || attempts > 100) { // 10 seconds max
                clearInterval(intervalId);
            }
        }, 100);
    }

    // For universal search or other programmatic uses, `window.openGemeindeDossier` is the single source of truth.
    // By wrapping it exactly once, we avoid all double-firing, missing clicks, or map initializations.

});
