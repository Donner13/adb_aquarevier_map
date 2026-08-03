const fs = require('fs');
let html = fs.readFileSync('internal.html', 'utf8');

// The reviewer mentioned:
// `zIndex` für Wasserschutzgebiete ist jedoch ein stiller No-op: der `eachLayer`-Zweig ist leer.
// Die Opazitäts-Skalierung ist inkonsistent: der Default setzt bei 0,8 nur `fillOpacity: 0,4`, obwohl der Kommentar 0,5 als Ausgangswert nennt.
// Die zusätzlich eingefügten Kommentare und die fehlerhafte Einrückung sind unnötige kosmetische Änderungen.

// Fix the indentation and issues in applyWmsSettingsToLayers()
const searchString = `                function applyWmsSettingsToLayers() {
            Object.keys(wmsLayersMap).forEach(wmsName => {
                const layer = wmsLayersMap[wmsName];
                const settings = styleSettings.wmsSettings[wmsName];
                if (settings && layer) {
                    if (typeof layer.setOpacity === 'function') {
                        layer.setOpacity(settings.opacity);
                    } else if (typeof layer.eachLayer === 'function') {
                        layer.eachLayer(l => {
                            if (typeof l.setStyle === 'function') {
                                // Extract current style to maintain ratio if needed, or just set explicitly
                                // Given Wasserschutzgebiete has zone I (0.5), II (0.3), III (0.15) fillOpacity initially.
                                // But simply overriding works for the customizer intent, or we can use the value directly.
                                let fillOpacity = settings.opacity * 0.5; // default scale
                                if (l.feature && l.feature.properties) {
                                    const zone = String(l.feature.properties.wsg_zone || '').toUpperCase();
                                    if (zone.includes("III") || zone.includes("3")) {
                                        fillOpacity = settings.opacity * (0.15 / 0.8);
                                    } else if (zone.includes("II") || zone.includes("2")) {
                                        fillOpacity = settings.opacity * (0.3 / 0.8);
                                    } else if (zone === "1" || zone === "1A" || zone === "1B" || zone === "I") {
                                        fillOpacity = settings.opacity * (0.5 / 0.8);
                                    }
                                }
                                l.setStyle({ fillOpacity: fillOpacity, opacity: settings.opacity });
                            }
                        });
                    }
                    if (typeof layer.setZIndex === 'function') {
                        layer.setZIndex(settings.zIndex);
                    } else if (typeof layer.eachLayer === 'function') {
                        // GeoJSON LayerGroups use panes for z-index typically, or bringing to front/back.
                        // However, setting z-index on paths is not standard Leaflet, but we can try if there's a pane or just skip for vectors.
                    }
                }
            });
        }`;

const replacementString = `        function applyWmsSettingsToLayers() {
            Object.keys(wmsLayersMap).forEach(wmsName => {
                const layer = wmsLayersMap[wmsName];
                const settings = styleSettings.wmsSettings[wmsName];
                if (settings && layer) {
                    if (typeof layer.setOpacity === 'function') {
                        layer.setOpacity(settings.opacity);
                    } else if (typeof layer.eachLayer === 'function') {
                        layer.eachLayer(l => {
                            if (typeof l.setStyle === 'function') {
                                let fillOpacity = settings.opacity * (0.25 / 0.8);
                                if (l.feature && l.feature.properties) {
                                    const zone = String(l.feature.properties.wsg_zone || '').toUpperCase();
                                    if (zone.includes("III") || zone.includes("3")) {
                                        fillOpacity = settings.opacity * (0.15 / 0.8);
                                    } else if (zone.includes("II") || zone.includes("2")) {
                                        fillOpacity = settings.opacity * (0.3 / 0.8);
                                    } else if (zone === "1" || zone === "1A" || zone === "1B" || zone === "I") {
                                        fillOpacity = settings.opacity * (0.5 / 0.8);
                                    }
                                }
                                l.setStyle({ fillOpacity: fillOpacity, opacity: settings.opacity });
                            }
                        });
                    }
                    if (typeof layer.setZIndex === 'function') {
                        layer.setZIndex(settings.zIndex);
                    }
                }
            });
        }`;

if (html.includes(searchString)) {
    html = html.replace(searchString, replacementString);
    fs.writeFileSync('internal.html', html, 'utf8');
    console.log('Fixed applyWmsSettingsToLayers');
} else {
    console.log('Could not find search string');
}
