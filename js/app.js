/**
 * Minimal tileerror handler for fallback logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Retry mechanism in case map is initialized asynchronously
    const initInterval = setInterval(() => {
        if (typeof L === 'undefined' || typeof map === 'undefined') return;
        clearInterval(initInterval);
        initStakeholderFeatures();
    }, 200);

    function initStakeholderFeatures() {
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

                <div class="stakeholder-modal-metric">
                    <strong>Wasserversorgungsrisiko</strong>
                    <span id="stakeholder-metric-wasser"></span>
                </div>

                <div class="stakeholder-modal-metric">
                    <strong>Pegeldaten</strong>
                    <span id="stakeholder-metric-pegel"></span>
                </div>

                <div class="stakeholder-modal-metric">
                    <strong>Gewerbegebiete</strong>
                    <span id="stakeholder-metric-gewerbe"></span>
                </div>

                <button class="stakeholder-print-btn">Steckbrief drucken</button>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            modalContent.querySelector('.close-btn').addEventListener('click', () => {
                modalOverlay.style.display = 'none';
            });

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
            });

            modalContent.querySelector('.stakeholder-print-btn').addEventListener('click', () => {
                window.print();
            });
        }

        function openStakeholderModal(props) {
            const gemeindeName = props.GN || props.gemeinde || props.name || 'Unbekannt';
            document.getElementById('stakeholder-modal-title').textContent = `Gemeinde-Steckbrief: ${gemeindeName}`;

            document.getElementById('stakeholder-metric-wasser').textContent = props.wasserversorgungsrisiko ?? 'Keine Daten verfügbar';
            document.getElementById('stakeholder-metric-pegel').textContent = props.pegeldaten ?? 'Keine Daten verfügbar';
            document.getElementById('stakeholder-metric-gewerbe').textContent = props.gewerbegebiete ?? 'Keine Daten verfügbar';

            modalOverlay.style.display = 'flex';
        }

        function handleGemeindeClick(e) {
            if (e.target && e.target.feature && e.target.feature.properties) {
                openStakeholderModal(e.target.feature.properties);
            }
        }

        function attachGemeindeClick(layer) {
            if (layer.eachLayer) {
                layer.eachLayer(attachGemeindeClick); // Recursive binding
            } else if (layer.feature && layer.feature.properties) {
                const props = layer.feature.properties;
                if (props.cat === 'gemeinde' || props.GN || props.gemeinde) {
                    layer.off('click', handleGemeindeClick);
                    layer.on('click', handleGemeindeClick);
                }
            }
        }

        map.eachLayer(attachGemeindeClick);
        map.on('layeradd', (e) => attachGemeindeClick(e.layer));
    }
});
