window.renderWmsCustomizer = function() {
    const container = document.getElementById('wms-customizer-container');
    if (!container) return;
    container.innerHTML = '';

    if (typeof window.wmsLayersMap === 'undefined') return;
    if (typeof window.styleSettings === 'undefined') { window.styleSettings = { wmsSettings: {} }; }
    else if (!window.styleSettings.wmsSettings) { window.styleSettings.wmsSettings = {}; }

    Object.keys(window.wmsLayersMap).forEach(wmsName => {
        const settings = window.styleSettings.wmsSettings[wmsName] || { opacity: 0.5, zIndex: 5 };

        const row = document.createElement('div');
        row.style.borderBottom = '1px dashed var(--border-color)';
        row.style.paddingBottom = '4px';

        row.innerHTML = `
            <div style="font-size: 10px; color: var(--text-primary); margin-bottom: 2px;">${wmsName}</div>
            <div style="display: flex; gap: 6px; align-items: center; font-size: 9px;">
                <span>Deckkraft:</span>
                <input type="range" min="0" max="1" step="0.05" value="${settings.opacity}" style="width: 50px;" oninput="window.updateWmsSetting('${wmsName}', 'opacity', this.value)">
                <span>Z-Index:</span>
                <input type="number" min="1" max="20" value="${settings.zIndex}" style="width: 40px;" onchange="window.updateWmsSetting('${wmsName}', 'zIndex', this.value)">
            </div>
        `;
        container.appendChild(row);
    });
}

window.updateWmsSetting = function(name, prop, val) {
    if (!window.styleSettings.wmsSettings[name]) window.styleSettings.wmsSettings[name] = {};
    window.styleSettings.wmsSettings[name][prop] = parseFloat(val);
    window.applyWmsSettingsToLayers();
    if (typeof window.persistLocal === 'function') {
        window.persistLocal();
    }
}

window.applyWmsSettingsToLayers = function() {
    if (typeof window.wmsLayersMap === 'undefined' || typeof window.styleSettings === 'undefined') return;
    if (!window.styleSettings.wmsSettings) window.styleSettings.wmsSettings = {};

    Object.keys(window.wmsLayersMap).forEach(wmsName => {
        const layer = window.wmsLayersMap[wmsName];
        const settings = window.styleSettings.wmsSettings[wmsName];
        if (settings && layer) {
            layer.setOpacity(settings.opacity);
            layer.setZIndex(settings.zIndex);
        }
    });
}
