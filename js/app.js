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
    // Inline styles dynamically to satisfy strict scope constraints robustly across all nested routes
    if (!document.getElementById('stakeholder-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'stakeholder-modal-styles';
        style.textContent = `/* Stakeholder Modal Styling */
#stakeholder-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 10010; /* Above regular modals */
    padding: 24px;
    width: 90%;
    max-width: 600px;
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#stakeholder-modal.active {
    display: block;
}

#stakeholder-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 10009;
    display: none;
}

#stakeholder-modal-backdrop.active {
    display: block;
}

.stakeholder-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 12px;
    margin-bottom: 20px;
}

.stakeholder-modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.stakeholder-modal-close {
    background: transparent;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #94a3b8;
    line-height: 1;
}

.stakeholder-modal-close:hover {
    color: #0f172a;
}

.stakeholder-modal-content h3 {
    margin-top: 0;
    color: #334155;
    font-size: 16px;
    margin-bottom: 16px;
}

.stakeholder-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.stakeholder-kpi-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
}

.stakeholder-kpi-value {
    font-size: 24px;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 8px;
}

.stakeholder-kpi-label {
    font-size: 12px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stakeholder-print-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.2s;
}

.stakeholder-print-btn:hover {
    background: #1d4ed8;
}

/* Print Styles */
@media print {
    body * {
        visibility: hidden !important;
    }

    #stakeholder-modal, #stakeholder-modal * {
        visibility: visible !important;
    }

    #stakeholder-modal {
        position: absolute;
        left: 0;
        top: 0;
        transform: none;
        width: 100%;
        max-width: 100%;
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
    }

    .stakeholder-modal-close, .stakeholder-print-btn {
        display: none !important;
    }

    .stakeholder-kpi-card {
        border: 1px solid #000;
        break-inside: avoid;
    }
}
`;
        document.head.appendChild(style);
    }

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
    const openStakeholderModalInternal = function(gemeindeName) {
        previousFocus = document.activeElement;
        document.getElementById('stakeholder-gemeinde-name').textContent = gemeindeName;

        let dossierData = window.currentGemeindeDossier;

        // Rely entirely on global state updated by originalOpenDossier to avert side effects from compileGemeindeDossier
        if (dossierData && dossierData.name !== gemeindeName) {
            dossierData = null; // Stale dossier protection
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

        // Ensure explicit z-index to overlay native modals (which use 10008)
        backdrop.style.zIndex = '10009';
        modal.style.zIndex = '10010';

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
    // A persistent polling wrapper secures the hook against reassignment without triggering Object.defineProperty conflicts.
    setInterval(() => {
        if (typeof window.openGemeindeDossier === 'function' && !window.openGemeindeDossier._stakeholderHooked) {
            const originalOpenDossier = window.openGemeindeDossier;
            window.openGemeindeDossier = function(gemeindeName) {
                originalOpenDossier.apply(this, arguments);

                const backdrop = document.getElementById('stakeholder-modal-backdrop');
                if (backdrop) backdrop.style.zIndex = '10009';

                const stakeholderModal = document.getElementById('stakeholder-modal');
                if (stakeholderModal) stakeholderModal.style.zIndex = '10010';

                if (typeof gemeindeName === 'string' && gemeindeName.trim().length > 0) {
                    openStakeholderModalInternal(gemeindeName.trim());
                }
            };
            window.openGemeindeDossier._stakeholderHooked = true;
        }
    }, 500);
});
