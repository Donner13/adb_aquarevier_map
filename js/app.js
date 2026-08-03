/**
 * Minimal tileerror handler for fallback logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Retry adding the event listener if map is not immediately available
    const initFallback = (retries = 5) => {
        if (typeof L === 'undefined' || typeof map === 'undefined') {
            if (retries > 0) {
                setTimeout(() => initFallback(retries - 1), 500);
            }
            return;
        }

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

        // Ensure newly added layers also get the fallback
        map.on('layeradd', (e) => {
            if (e.layer instanceof L.TileLayer) {
                e.layer.on('tileerror', (event) => {
                    if (event && event.tile) {
                        event.tile.src = fallbackTile;
                    }
                });
            }
        });
    };

    initFallback();
});
