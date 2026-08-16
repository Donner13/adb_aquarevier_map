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

        // Review fix: "Die Kennzahlen hängen an nicht nachgewiesenen globalen Datenstrukturen..."
        // Explicitly secure fallbacks by verifying property chains to avoid silent failures or misinterpretations.
        if (pegelAnzahl === "Keine Daten" && typeof window.layerDataStore === 'object' && window.layerDataStore !== null) {
             const pegelData = window.layerDataStore['pegel'];
             if (pegelData && typeof pegelData === 'object' && Array.isArray(pegelData.features)) {
                 pegelAnzahl = pegelData.features.filter(f => f && f.properties && (f.properties.gemeinde === gemeindeName || f.properties.Gemeinde === gemeindeName)).length;
             }
        }
        if (gewerbeAnzahl === "Keine Daten" && typeof window.layerDataStore === 'object' && window.layerDataStore !== null) {
             const gewerbeData = window.layerDataStore['gewerbegebiete'];
             if (gewerbeData && typeof gewerbeData === 'object' && Array.isArray(gewerbeData.features)) {
                 gewerbeAnzahl = gewerbeData.features.filter(f => f && f.properties && (f.properties.gemeinde === gemeindeName || f.properties.Gemeinde === gemeindeName)).length;
             }
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

    // Review fix: "Der Hook auf window.openGemeindeDossier ist zeit- und reassign-anfällig..."
    // To ensure a robust integration that survives late loading or reassignments, we proxy the global property.
    let _openGemeindeDossier = window.openGemeindeDossier;
    Object.defineProperty(window, 'openGemeindeDossier', {
        get: function() {
            return function(gemeindeName) {
                if (typeof _openGemeindeDossier === 'function') {
                    _openGemeindeDossier.apply(this, arguments);
                }

                // Ensure the new Stakeholder Modal acts as an explicit overlay
                const backdrop = document.getElementById('stakeholder-modal-backdrop');
                if (backdrop) backdrop.style.zIndex = '10009';

                const stakeholderModal = document.getElementById('stakeholder-modal');
                if (stakeholderModal) stakeholderModal.style.zIndex = '10010';

                // Ensure we only trigger for valid Gemeinde identifiers
                if (typeof gemeindeName === 'string' && gemeindeName.trim().length > 0) {
                    window.openStakeholderModal.call(this, gemeindeName.trim());
                }
            };
        },
        set: function(val) {
            _openGemeindeDossier = val;
        },
        configurable: true,
        enumerable: true
    });
});
