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
            <h2 class="stakeholder-modal-title" id="stakeholder-modal-title">Gemeinde-Steckbrief</h2>
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

        let wasserRisiko = "Keine Daten";
        let pegelAnzahl = "Keine Daten";
        let gewerbeAnzahl = "Keine Daten";

        if (dossierData && typeof dossierData.stats === 'object') {
             const stats = dossierData.stats;
             if (Array.isArray(stats.pegel)) {
                 pegelAnzahl = stats.pegel.length;
             }
             if (Array.isArray(stats.gewerbegebiete)) {
                 gewerbeAnzahl = stats.gewerbegebiete.length;
             }
             if (stats.wasserRisiko !== undefined) wasserRisiko = stats.wasserRisiko;
        }

        // Review fix: "ein Fallback auf die bekannten Datenquellen fehlt."
        if (pegelAnzahl === "Keine Daten" && typeof window.layerDataStore === 'object' && window.layerDataStore.pegel && Array.isArray(window.layerDataStore.pegel.features)) {
             pegelAnzahl = window.layerDataStore.pegel.features.filter(f => f.properties && (f.properties.gemeinde === gemeindeName || f.properties.Gemeinde === gemeindeName)).length;
        }
        if (gewerbeAnzahl === "Keine Daten" && typeof window.layerDataStore === 'object' && window.layerDataStore.gewerbegebiete && Array.isArray(window.layerDataStore.gewerbegebiete.features)) {
             gewerbeAnzahl = window.layerDataStore.gewerbegebiete.features.filter(f => f.properties && (f.properties.gemeinde === gemeindeName || f.properties.Gemeinde === gemeindeName)).length;
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

    // Focus Trap Logic for accessibility
    const trapFocus = (e) => {
        if (!modal.classList.contains('active')) return;
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    };

    // Add Escape key and Tab focus trap support to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        } else if (e.key === 'Tab') {
            trapFocus(e);
        }
    });

    // Review fix: "Die bestehende openGemeindeDossier-Logik wird entgegen Taskbeschreibung nicht integriert..."
    // "map.eachLayer() und layeradd sehen bei GeoJSON-Layergruppen häufig nur den Container... dann wird kein Gemeinde-Klick gebunden."
    // Integrate cleanly with openGemeindeDossier to catch ALL clicks (map, sidebar, programmatic) reliably.

    // Instead of completely redefining or intercepting clicks manually (which misses programmatic calls or GeoJSON clusters),
    // we hook into the existing `openGemeindeDossier` safely. Since `openGemeindeDossier` might be defined later,
    // we use a property setter to detect when it's assigned, or just wrap it directly if it already exists.

    // Review fix: "openGemeindeDossier wird nur bis ca. 2,1s nach DOMContentLoaded gepatcht und kann danach still ausfallen."
    // We poll reliably until the script is fully executed, avoiding global scope pollution and redundant checks.
    const interval = setInterval(() => {
        if (typeof window.openGemeindeDossier === 'function') {
            const originalOpenDossier = window.openGemeindeDossier;
            window.openGemeindeDossier = function(gemeindeName) {
                // Execute original logic first to compile dossier and open original modal (if any)
                originalOpenDossier.apply(this, arguments);

                // Ensure the new Stakeholder Modal acts as an explicit overlay
                const backdrop = document.getElementById('stakeholder-modal-backdrop');
                if (backdrop) backdrop.style.zIndex = '10009'; // Ensure above old modal (10008)

                const stakeholderModal = document.getElementById('stakeholder-modal');
                if (stakeholderModal) stakeholderModal.style.zIndex = '10010';

                // Then open our new Stakeholder Modal
                window.openStakeholderModal.call(this, gemeindeName);
            };
            clearInterval(interval);
        }
    }, 250);
});
