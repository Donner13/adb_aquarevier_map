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

    // ---------- Stakeholder Gemeinde-Steckbrief Modal ----------

    // Create the modal overlay in the DOM if it doesn't exist
    let modalOverlay = document.getElementById('stakeholder-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'stakeholder-modal-overlay';

        const modalContent = document.createElement('div');
        modalContent.id = 'stakeholder-modal';

        modalContent.innerHTML = `
            <button class="close-btn" aria-label="Schließen">&times;</button>
            <h2 id="stakeholder-modal-title">Gemeinde-Steckbrief</h2>
            <p>Was bedeutet das für uns?</p>

            <div class="modal-metric">
                <strong>Wasserversorgungsrisiko</strong>
                <span id="stakeholder-metric-wasser">Keine Daten verfügbar</span>
            </div>

            <div class="modal-metric">
                <strong>Pegeldaten</strong>
                <span id="stakeholder-metric-pegel">Keine Daten verfügbar</span>
            </div>

            <div class="modal-metric">
                <strong>Gewerbegebiete</strong>
                <span id="stakeholder-metric-gewerbe">Keine Daten verfügbar</span>
            </div>

            <button onclick="window.print()" style="margin-top: 16px; padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;" class="print-btn">Steckbrief drucken</button>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Close event
        modalContent.querySelector('.close-btn').addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        // Hide on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }

    // Show modal function
    window.openStakeholderModal = function(gemeindeName) {
        document.getElementById('stakeholder-modal-title').textContent = \`Gemeinde-Steckbrief: \${gemeindeName}\`;

        // Within js/app.js, we don't have access to real metrics for these
        // constraints requested "no dummy data", so they remain default "Keine Daten verfügbar".

        modalOverlay.style.display = 'flex';
    };

    // Global Click Hook for "Gemeinde" Layers on the map
    map.on('click', (e) => {
        // If clicking on a Gemeinde-Polygon or similar marker that passes the name
        // we'd want to find the feature. Wait, standard leaflet clicks on map don't give the feature.
        // We can hook into popupopen or layer click if any.
        // Leaflet layer click events are propagated to the map if not stopped.
    });

    // Better hook: intercept popup opens to see if it's a Gemeinde.
    // Wait, the prompt says "bei Gemeinde-Klick".
    // We can iterate layers and attach click events if they look like a Gemeinde,
    // or just listen to map layer clicks broadly.
    map.on('popupopen', (e) => {
        // Try to infer gemeinde name from popup if it has one, or feature properties
        const layer = e.popup._source;
        if (layer && layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;

            // Check if it's a Gemeinde polygon or has 'gemeinde' in properties
            // If the layer is specifically representing a Gemeinde:
            if (props.cat === 'gemeinde' || props.GN || props.gemeinde) {
                const gemeindeName = props.GN || props.gemeinde || props.name || 'Unbekannt';

                // Add a button to the popup to open the stakeholder modal?
                // The task says "bei Gemeinde-Klick", which might mean directly opening it.
                // But opening it over a popup might be annoying. Let's just hook the click directly.
            }
        }
    });

    // Let's hook into layer clicks directly for anything that looks like a Gemeinde
    map.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            // Best guess for a Gemeinde-layer based on typical NRW properties (GN = Gemeindename)
            if (props.cat === 'gemeinde' || (props.GN && !props.kreis)) {
                layer.on('click', (e) => {
                    window.openStakeholderModal(props.GN || props.name || 'Unbekannt');
                });
            }
        }
    });

    // Also listen for new layers added to the map to attach the hook dynamically
    map.on('layeradd', (e) => {
        const layer = e.layer;
        if (layer && layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            // Hook if the feature represents a Gemeinde
            if (props.cat === 'gemeinde' || props.GN) {
                layer.on('click', (event) => {
                    window.openStakeholderModal(props.GN || props.name || 'Unbekannt');
                });
            }
        }
    });

});
