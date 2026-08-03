/**
 * js/layer_control.js
 * Extracted logic for layer toggling to enable unit testing and reuse.
 */

function setupLayerToggleLogic(map, overlayMaps, buttons, updateVisualStates, updateCounters) {
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-layer-name');
            const layer = overlayMaps[name];

            if (!layer) return;

            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
                map.fire('overlayremove', { layer: layer, name: name });
            } else {
                map.addLayer(layer);
                map.fire('overlayadd', { layer: layer, name: name });
            }

            if (typeof updateVisualStates === 'function') {
                updateVisualStates();
            }
            if (typeof updateCounters === 'function') {
                updateCounters();
            }
        });
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupLayerToggleLogic };
}
