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

    // Review fix: "handling of openGemeindeDossier globally may introduce maintenance issues" & "bindMapLayerClicks function has a potential issue with its return value".
    // We avoid global openGemeindeDossier overwrites, and attach securely to map layers natively.

    let layerHooked = false;
    function bindMapLayerClicks() {
        if (typeof map !== 'undefined' && !layerHooked) {
            layerHooked = true; // Set immediately to prevent race conditions

            map.on('layeradd', function(e) {
                const layer = e.layer;
                if (layer.feature && layer.feature.properties && layer.feature.properties.name && layer.feature.properties.typ === 'Gemeinde' && !layer._stakeholderHook) {
                    layer.on('click', function() {
                        window.openStakeholderModal(layer.feature.properties.name);
                    });
                    layer._stakeholderHook = true;
                }
            });

            // Backfill already loaded layers
            map.eachLayer(function(layer) {
                if (layer.feature && layer.feature.properties && layer.feature.properties.name && layer.feature.properties.typ === 'Gemeinde' && !layer._stakeholderHook) {
                    layer.on('click', function() {
                        window.openStakeholderModal(layer.feature.properties.name);
                    });
                    layer._stakeholderHook = true;
                }
            });

            return true;
        }
        return false;
    }

    if (!bindMapLayerClicks()) {
        window.addEventListener('load', () => {
            if (!bindMapLayerClicks()) {
                // Short polling for asynchronous map initialization
                let attempts = 0;
                const interval = setInterval(() => {
                    if (bindMapLayerClicks() || attempts > 50) {
                        clearInterval(interval);
                    }
                    attempts++;
                }, 100);
            }
        });
    }

    // Sidebar integration: delegate clicks purely in DOM for the list, avoiding global function interceptors
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.gemeinde-sidebar-item, [onclick*="openGemeindeDossier"]');
        if (btn) {
            let name = '';
            if (btn.hasAttribute('onclick')) {
                const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
                if (match && match[1]) name = match[1];
            } else if (btn.dataset && btn.dataset.name) {
                name = btn.dataset.name;
            }
            if (name) {
                window.openStakeholderModal(name);
            }
        }
    });

});
