/**
 * Minimal tileerror handler for fallback logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined' || typeof map === 'undefined') return;

    // A tiny transparent 1x1 pixel base64 as the absolute fallback to prevent broken image icons on 404
    const fallbackTile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    function addTileErrorHandler(layer) {
        // Prevent double binding by checking a custom flag
        if (!layer._hasTileErrorHandler) {
            layer.on('tileerror', (event) => {
                if (event && event.tile) {
                    event.tile.src = fallbackTile;
                }
            });
            layer._hasTileErrorHandler = true;
        }
    }

    // Hook tileerror globally for all newly added tile layers
    map.on('layeradd', (e) => {
        if (e.layer instanceof L.TileLayer) {
            addTileErrorHandler(e.layer);
        }
    });

    // Also apply to any layers already added before layeradd was hooked
    map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            addTileErrorHandler(layer);
        }
    });
});
