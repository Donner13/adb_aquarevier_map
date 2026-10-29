window.BasemapManager = {
    initUI: function() {
        const container = document.getElementById('basemap-customizer-container');
        if (!container) return;

        // Initialize values from styleSettings or defaults
        const defaultMap = window.styleSettings.defaultBaseMap || 'osm';
        const customUrl = window.styleSettings.customTileUrl || '';

        container.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong style="font-size: 11px; display: block; margin-bottom: 4px;">Standard-Basiskarte</strong>
                <div class="form-row" style="margin-bottom: 6px;">
                    <select id="cfg-basemap-select" style="width: 100%; font-size: 10px; padding: 2px;" onchange="window.BasemapManager.onBasemapChange()">
                        <option value="osm" ${defaultMap === 'osm' ? 'selected' : ''}>OSM (Standard)</option>
                        <option value="light" ${defaultMap === 'light' ? 'selected' : ''}>Carto Light</option>
                        <option value="dark" ${defaultMap === 'dark' ? 'selected' : ''}>Carto Dark</option>
                        <option value="nrw" ${defaultMap === 'nrw' ? 'selected' : ''}>NRW (TopPlusOpen)</option>
                        <option value="custom" ${defaultMap === 'custom' ? 'selected' : ''}>Eigene (Tile-URL)</option>
                    </select>
                </div>
                <div class="form-row" id="cfg-basemap-custom-row" style="display: ${defaultMap === 'custom' ? 'block' : 'none'}; margin-bottom: 6px;">
                    <input type="text" id="cfg-basemap-custom-url" placeholder="z.B. https://{s}.tile.domain.com/{z}/{x}/{y}.png" value="${customUrl}" style="font-size: 10px; width: 100%; box-sizing: border-box;" onchange="window.BasemapManager.onBasemapChange()">
                </div>
            </div>
        `;
    },

    onBasemapChange: function() {
        const select = document.getElementById('cfg-basemap-select');
        const customUrlInput = document.getElementById('cfg-basemap-custom-url');
        const customRow = document.getElementById('cfg-basemap-custom-row');

        const selected = select.value;
        if (selected === 'custom') {
            customRow.style.display = 'block';
        } else {
            customRow.style.display = 'none';
        }

        window.styleSettings.defaultBaseMap = selected;
        window.styleSettings.customTileUrl = customUrlInput.value.trim();

        if (window.persistLocal) {
            window.persistLocal();
        }

        this.applyBasemap();
    },

    applyBasemap: function() {
        const map = window.map;
        if (!map) return;

        // Always remove all known base layers first to ensure a clean state
        if (window.baseOsm && map.hasLayer(window.baseOsm)) map.removeLayer(window.baseOsm);
        if (window.baseLight && map.hasLayer(window.baseLight)) map.removeLayer(window.baseLight);
        if (window.baseDark && map.hasLayer(window.baseDark)) map.removeLayer(window.baseDark);
        if (window.baseWebAtlas && map.hasLayer(window.baseWebAtlas)) map.removeLayer(window.baseWebAtlas);
        if (this._customLayer && map.hasLayer(this._customLayer)) {
            map.removeLayer(this._customLayer);
            this._customLayer = null;
        }

        const selected = window.styleSettings.defaultBaseMap || 'osm';

        if (selected === 'osm' && window.baseOsm) {
            window.baseOsm.addTo(map);
        } else if (selected === 'light' && window.baseLight) {
            window.baseLight.addTo(map);
        } else if (selected === 'dark' && window.baseDark) {
            window.baseDark.addTo(map);
        } else if (selected === 'nrw' && window.baseWebAtlas) {
            window.baseWebAtlas.addTo(map);
        } else if (selected === 'custom') {
            const url = window.styleSettings.customTileUrl;
            if (url) {
                this._customLayer = L.tileLayer(url, {
                    crossOrigin: 'anonymous',
                    maxZoom: 20
                }).addTo(map);
            } else if (window.baseOsm) {
                window.baseOsm.addTo(map); // fallback
            }
        } else if (window.baseOsm) {
             window.baseOsm.addTo(map); // global fallback
        }
    }
};
