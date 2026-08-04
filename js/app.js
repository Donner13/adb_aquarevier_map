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

            <button class="print-btn">Steckbrief drucken</button>
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

        // Print event (fixes CSP issue)
        modalContent.querySelector('.print-btn').addEventListener('click', () => {
            window.print();
        });
    }

    // Show modal function
    window.openStakeholderModal = function(gemeindeName) {
        document.getElementById('stakeholder-modal-title').textContent = `Gemeinde-Steckbrief: ${gemeindeName}`;
        modalOverlay.style.display = 'flex';
    };

    function attachGemeindeClick(layer) {
        if (layer.feature && layer.feature.properties) {
            const props = layer.feature.properties;
            if (props.cat === 'gemeinde' || props.GN || props.gemeinde) {
                const name = props.GN || props.gemeinde || props.name || 'Unbekannt';
                // Attach directly to the layer click instead of popupopen
                layer.on('click', (e) => {
                    window.openStakeholderModal(name);
                    // Prevent default popup if possible, or let it happen alongside
                });
            }
        }
    }

    map.eachLayer((layer) => {
        if (layer.eachLayer) {
            layer.eachLayer(attachGemeindeClick);
        } else {
            attachGemeindeClick(layer);
        }
    });

    map.on('layeradd', (e) => {
        const layer = e.layer;
        if (layer.eachLayer) {
            layer.eachLayer(attachGemeindeClick);
        } else {
            attachGemeindeClick(layer);
        }
    });

});
