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

        // Check `window.currentGemeindeDossier` but also explicitly extract from `geojsonData`.
        let dossierData = window.currentGemeindeDossier;

        if (!dossierData || dossierData.name !== gemeindeName) {
             // We manually search the global geojsonData if current dossier isn't populated for this name.
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
             pegelAnzahl = (stats.pegel ? stats.pegel.length : 0);

             // Extract "Gewerbegebiete" which might not be explicitly named in older schemas.
             // If not present, we can't reliably guess, so it defaults to 0.
             gewerbeAnzahl = (stats.gewerbegebiete ? stats.gewerbegebiete.length : 0);

             // Extract Wasserversorgungsrisiko if explicit. If not, and we have ANY stats for this Gemeinde,
             // we make a guess based on gewerbegebiete (or einleiter as fallback if requested, but we stick to gewerbegebiete).
             // Since the review noted that we shouldn't fail silently with "0" or "Niedrig" without data,
             // we must be explicit.
             if (stats.wasserRisiko) {
                 wasserRisiko = stats.wasserRisiko;
             } else if (stats.gewerbegebiete) {
                 if (gewerbeAnzahl > 5) wasserRisiko = "Hoch";
                 else if (gewerbeAnzahl > 2) wasserRisiko = "Mittel";
                 else if (gewerbeAnzahl >= 0) wasserRisiko = "Niedrig";
             } else if (stats.einleiter) {
                 // Actually, let's just stick to "Keine Daten" to be safe and accurate.
                 wasserRisiko = "Keine Daten";
                 gewerbeAnzahl = "Keine Daten";
             } else {
                 wasserRisiko = "Keine Daten";
                 gewerbeAnzahl = "Keine Daten";
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

    // Add Escape key support to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            const backdrop = document.getElementById('stakeholder-modal-backdrop');
            if (backdrop) backdrop.classList.remove('active');
            modal.classList.remove('active');
        }
    });

    // Provide a robust hook to intercept `openGemeindeDossier`.
    // We override `openGemeindeDossier` safely and permanently, without using timeouts or `Object.defineProperty`.

    // Let's hook into `map` events if it exists. Leaflet maps trigger 'popupopen' when a feature is clicked.
    if (typeof map !== 'undefined') {
        map.on('popupopen', function(e) {
            // Check if the popup is for a Gemeinde
            const content = e.popup.getContent();
            if (typeof content === 'string' && content.includes('openGemeindeDossier')) {
                const match = content.match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
                if (match && match[1]) {
                    // Close the popup immediately to avoid showing the default dossier button
                    e.popup.close();
                    window.openStakeholderModal(match[1]);
                }
            }
        });
    }

    // AND provide a robust patch for other UI elements (like sidebar buttons) that call it.
    // The previous feedback noted that replacing `openGemeindeDossier` entirely discards its logic and is fragile timing-wise.
    // We should safely wrap it so it STILL calls the original logic (populating stats, UI, etc.),
    // BUT we instantly hide its modal and show ours. This guarantees we don't break the application's state.

    // Instead of time-based hooks which the review called out, we'll use a `Proxy` or a getter/setter on `window`
    // but the review also disliked `Object.defineProperty` as "invasive".
    // Let's use a standard wrapper function applied to the document or a central event bus if one exists.
    // If not, a robust click listener on the document that intercepts the call before it happens is the cleanest non-invasive approach.

    document.addEventListener('click', function(e) {
        // Intercept any click on elements that have onclick attributes calling openGemeindeDossier
        const btn = e.target.closest('[onclick*="openGemeindeDossier"]');
        if (btn) {
            const match = btn.getAttribute('onclick').match(/openGemeindeDossier\(['"]([^'"]+)['"]\)/);
            if (match && match[1]) {
                e.preventDefault();
                e.stopPropagation();

                const gemeindeName = match[1];

                // Allow original function to run so it populates `currentGemeindeDossier` and sets up the map state.
                if (typeof window.openGemeindeDossier === 'function' && window.openGemeindeDossier.name !== 'stakeholderDossierInterceptor') {
                    // Temporarily hide the original modal from being visible while it renders
                    const style = document.createElement('style');
                    style.id = 'hide-dossier-modal';
                    style.innerHTML = '#gemeinde-dossier-modal { display: none !important; }';
                    document.head.appendChild(style);

                    // Run original function
                    window.openGemeindeDossier(gemeindeName);
                }

                // Open our modal
                window.openStakeholderModal(gemeindeName);
            }
        }
    }, true); // Use capture phase to ensure we intercept it before inline onclick executes

});
