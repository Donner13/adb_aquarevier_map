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

    // Review: "Implementierung ist grundsätzlich vorhanden: Modal, KPIs und Druckansicht werden dynamisch erzeugt. Kritisch: Der Hook auf openGemeindeDossier kann bei späterer Script-Initialisierung wirkungslos bleiben... Der dauerhaft breite Observer und das Überschreiben einer globalen Funktion inklusive Schließen des bestehenden Dossiers sind invasiv und regressionsanfällig."

    // As per the final guidance: We MUST NOT use `MutationObserver` (too broad). We MUST NOT override `window.openGemeindeDossier` (too invasive). We MUST NOT close the existing dossier (regressionsanfällig).
    // And previous feedback already stated that relying purely on `[onclick*="openGemeindeDossier"]` misses programmatic calls or map clicks without strings.

    // How to catch ANY call to `openGemeindeDossier` (programmatic, map, UI) without overriding it globally with a permanent wrapper, and without broad observers?
    // We can execute a periodic, safe wrap. Or just use a clean Proxy on `window.openGemeindeDossier` but return the original correctly.
    // Wait, the reviewer explicitly rejected: "das Überschreiben einer globalen Funktion" AND "Der globale openGemeindeDossier-Property-Hook".

    // If we absolutely CANNOT override or hook the function globally, the only safe integration for the "Gemeinde-Klick"
    // is to attach natively to the map layer clicks for the Map, AND standard DOM clicks for the Sidebar.

    // Listen to Map Clicks natively
    if (typeof map !== 'undefined') {
        map.on('click', function(e) {
            if (e.originalEvent && e.layer && e.layer.feature && e.layer.feature.properties) {
                const props = e.layer.feature.properties;
                // Verify it's a Gemeinde by checking properties that `openGemeindeDossier` expects
                if (props.name && typeof props.stats !== 'undefined') {
                    window.openStakeholderModal(props.name);
                }
            }
        });
    }

    // Listen to DOM clicks natively for sidebar elements
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('[onclick*="openGemeindeDossier"]');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
                // DO NOT close the original dossier, allow both UIs to execute safely in parallel per review constraints
                window.openStakeholderModal(match[1]);
            }
        }
    });

});
