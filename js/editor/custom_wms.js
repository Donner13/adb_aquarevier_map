/**
 * js/editor/custom_wms.js
 *
 * Logic for custom WMS feeds.
 */

customWMSLayers = {};

window.addCustomWMS = function() {
    const name = document.getElementById('custom-wms-name').value.trim();
    const url = document.getElementById('custom-wms-url').value.trim();
    const layers = document.getElementById('custom-wms-layers').value.trim();

    if (!name || !url || !layers) {
        alert("Bitte füllen Sie alle Felder aus (Name, URL, Layers).");
        return;
    }

    const wmsConfig = { id: Date.now().toString(), name, url, layers, opacity: 0.8, zIndex: 5 };

    if (!styleSettings.customWMS) styleSettings.customWMS = [];
    styleSettings.customWMS.push(wmsConfig);

    document.getElementById('custom-wms-name').value = '';
    document.getElementById('custom-wms-url').value = '';
    document.getElementById('custom-wms-layers').value = '';

    window.loadCustomWMSLayer(wmsConfig);
    window.renderCustomWMSList();
    persistLocal();
};

window.removeCustomWMS = function(id) {
    if (!styleSettings.customWMS) return;
    const idx = styleSettings.customWMS.findIndex(w => w.id === id);
    if (idx > -1) {
        const wmsConfig = styleSettings.customWMS[idx];
        const layer = customWMSLayers[wmsConfig.name];
        if (layer) {
            map.removeLayer(layer);
            layerControl.removeLayer(layer);
            delete customWMSLayers[wmsConfig.name];
        }
        styleSettings.customWMS.splice(idx, 1);
        window.renderCustomWMSList();
        persistLocal();
    }
};

window.updateCustomWMSSetting = function(id, opacity) {
    const wmsConfig = styleSettings.customWMS.find(w => w.id === id);
    if (wmsConfig) {
        wmsConfig.opacity = parseFloat(opacity);
        const layer = customWMSLayers[wmsConfig.name];
        if (layer) {
            layer.setOpacity(wmsConfig.opacity);
        }
        persistLocal();
    }
};

window.loadCustomWMSLayer = function(wmsConfig) {
    if (customWMSLayers[wmsConfig.name]) return; // already loaded

    const layer = L.tileLayer.wms(wmsConfig.url, {
        layers: wmsConfig.layers,
        format: 'image/png',
        transparent: true,
        opacity: wmsConfig.opacity,
        zIndex: wmsConfig.zIndex || 5
    });

    customWMSLayers[wmsConfig.name] = layer;
    layerControl.addOverlay(layer, "🌐 " + wmsConfig.name);
};

window.renderCustomWMSList = function() {
    const list = document.getElementById('custom-wms-list');
    list.innerHTML = '';

    if (!styleSettings.customWMS) return;

    styleSettings.customWMS.forEach(w => {
        const div = document.createElement('div');
        div.style.background = 'rgba(255,255,255,0.03)';
        div.style.border = '1px solid var(--border-color)';
        div.style.padding = '4px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '9px';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '4px';

        const escapeHtml = (unsafe) => { return (unsafe || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); };
        const safeName = escapeHtml(w.name);
        const safeLayers = escapeHtml(w.layers);

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--accent-primary)">${safeName}</strong>
                <button onclick="window.removeCustomWMS('${w.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Löschen">🗑️</button>
            </div>
            <div style="color: var(--text-secondary); word-break: break-all;">${safeLayers}</div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <span>Opacity:</span>
                <input type="range" min="0" max="1" step="0.05" value="${w.opacity}" style="width: 100%;" oninput="window.updateCustomWMSSetting('${w.id}', this.value)">
            </div>
        `;
        list.appendChild(div);
    });
};
