/**
 * AquaRevier Layer Control Handler Module
 * Encapsulates the logic for toggling layers and handling "Quick Action" layer buttons.
 */

window.initLayerControls = function(map, overlayMaps, updateButtonVisualStates, updateSidebarCounters) {
    // Toggle listeners for Layer buttons
    document.querySelectorAll('.filter-btn[data-layer-name]').forEach(btn => {
        // Prevent duplicate listener attachment if this is called multiple times
        if (btn.hasAttribute('data-layer-control-bound')) return;
        btn.setAttribute('data-layer-control-bound', 'true');

        btn.addEventListener('click', (e) => {
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
            if (typeof updateButtonVisualStates === 'function') updateButtonVisualStates();
            if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
        });
    });

    // Quick Action: Hazard & Starkregen - Alle an
    const btnHazardAll = document.getElementById('btn-hazard-all');
    if (btnHazardAll && !btnHazardAll.hasAttribute('data-layer-control-bound')) {
        btnHazardAll.setAttribute('data-layer-control-bound', 'true');
        btnHazardAll.addEventListener('click', () => {
            const container = document.getElementById('hazard-layer-group');
            if (!container) return;
            const btns = container.querySelectorAll('.filter-btn[data-layer-name]');
            btns.forEach(btn => {
                const name = btn.getAttribute('data-layer-name');
                const layer = overlayMaps[name];
                if (layer && !map.hasLayer(layer)) {
                    map.addLayer(layer);
                    map.fire('overlayadd', { layer: layer, name: name });
                }
            });
            if (typeof updateButtonVisualStates === 'function') updateButtonVisualStates();
        });
    }

    // Quick Action: Hazard & Starkregen - Alle aus
    const btnHazardNone = document.getElementById('btn-hazard-none');
    if (btnHazardNone && !btnHazardNone.hasAttribute('data-layer-control-bound')) {
        btnHazardNone.setAttribute('data-layer-control-bound', 'true');
        btnHazardNone.addEventListener('click', () => {
            const container = document.getElementById('hazard-layer-group');
            if (!container) return;
            const btns = container.querySelectorAll('.filter-btn[data-layer-name]');
            btns.forEach(btn => {
                const name = btn.getAttribute('data-layer-name');
                const layer = overlayMaps[name];
                if (layer && map.hasLayer(layer)) {
                    map.removeLayer(layer);
                    map.fire('overlayremove', { layer: layer, name: name });
                }
            });
            if (typeof updateButtonVisualStates === 'function') updateButtonVisualStates();
        });
    }

    // Quick Action: Fachdaten & Layer - Alle an
    const btnLayersAll = document.getElementById('btn-layers-all');
    if (btnLayersAll && !btnLayersAll.hasAttribute('data-layer-control-bound')) {
        btnLayersAll.setAttribute('data-layer-control-bound', 'true');
        btnLayersAll.addEventListener('click', () => {
            Array.from(document.querySelectorAll('.filter-btn[data-layer-name]')).filter(b => !b.closest('#hazard-layer-group')).forEach(btn => {
                const name = btn.getAttribute('data-layer-name');
                const layer = overlayMaps[name];
                if (layer && !map.hasLayer(layer)) {
                    map.addLayer(layer);
                    map.fire('overlayadd', { layer: layer, name: name });
                }
            });
            if (typeof updateButtonVisualStates === 'function') updateButtonVisualStates();
            if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
        });
    }

    // Quick Action: Fachdaten & Layer - Alle aus
    const btnLayersNone = document.getElementById('btn-layers-none');
    if (btnLayersNone && !btnLayersNone.hasAttribute('data-layer-control-bound')) {
        btnLayersNone.setAttribute('data-layer-control-bound', 'true');
        btnLayersNone.addEventListener('click', () => {
            Array.from(document.querySelectorAll('.filter-btn[data-layer-name]')).filter(b => !b.closest('#hazard-layer-group')).forEach(btn => {
                const name = btn.getAttribute('data-layer-name');
                const layer = overlayMaps[name];
                if (layer && map.hasLayer(layer)) {
                    map.removeLayer(layer);
                    map.fire('overlayremove', { layer: layer, name: name });
                }
            });
            if (typeof updateButtonVisualStates === 'function') updateButtonVisualStates();
            if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
        });
    }
};
