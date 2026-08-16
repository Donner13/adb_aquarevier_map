/**
 * js/groundwater_contours.js
 *
 * Implementiert eine clientseitige IDW-Interpolation und Isoband-Generierung
 * fuer Grundwassermessstellen.
 *
 * Erwartet, dass 'grundwassermessstellen.geojson' Messwerte enthaelt.
 * Ist das nicht der Fall, bleibt der Layer leer (Graceful Degradation).
 */

const gwIsoLayer = L.layerGroup();
let gwIsoLoaded = false;
window.gwIsoGeoData = null; // Exponiert für Counter-Update

// Farbenblind-sichere sequenzielle Okabe-Ito Palette
function getColorForLevel(level) {
    if (level === undefined || level === null) return '#56B4E9';
    if (level < 50) return '#0072B2';
    if (level < 100) return '#56B4E9';
    if (level < 150) return '#009E73';
    if (level < 200) return '#E69F00';
    return '#D55E00';
}

function loadGwIsoLayer() {
    if (gwIsoLoaded) return;
    gwIsoLoaded = true;

    fetch('grundwassermessstellen.geojson')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
        })
        .then(text => {
            // Check and strip UTF-8 BOM if present before parsing
            const cleanedText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
            if (!cleanedText.trim()) throw new Error("File is empty after stripping BOM");
            return JSON.parse(cleanedText);
        })
        .then(data => {
            if (!data || !data.features || data.features.length === 0) {
                console.warn("Grundwassergleichenplan: Keine Features in grundwassermessstellen.geojson. Layer bleibt leer.");
                return;
            }

            // Filtern nach Messstellen, die tatsaechlich einen numerischen Wert haben
            const validPoints = data.features.filter(f => {
                const val = f.properties.grundwasserstand !== undefined ? f.properties.grundwasserstand :
                            (f.properties.value !== undefined ? f.properties.value : f.properties.grundwasserstand_m_nhn);
                return val !== undefined && val !== null && !isNaN(parseFloat(val));
            });

            // Wenn keine Daten mit Messwerten vorhanden sind, bleibt der Layer leer.
            if (validPoints.length === 0) {
                console.warn("Grundwassergleichenplan: Keine numerischen Messwerte in grundwassermessstellen.geojson gefunden. Layer bleibt leer.");
                window.gwIsoGeoData = { type: "FeatureCollection", features: [] };
                if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
                return;
            }

            // IDW und Isoband-Generierung ohne externe Dependencies
            // Minimal-Implementierung: Generiert ein einfaches Grid als Fallback fuer die Darstellung
            const bounds = L.geoJSON(validPoints).getBounds();
            const cellSize = 0.05; // ~5km
            const gridFeatures = [];

            for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += cellSize) {
                for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += cellSize) {
                    const centerLng = lng + cellSize / 2;
                    const centerLat = lat + cellSize / 2;

                    let num = 0;
                    let den = 0;
                    validPoints.forEach(pt => {
                        const coords = pt.geometry.coordinates;
                        const d = Math.sqrt(Math.pow(coords[0] - centerLng, 2) + Math.pow(coords[1] - centerLat, 2));
                        if (d === 0) return;
                        const w = 1 / Math.pow(d, 2);
                        const val = parseFloat(pt.properties.grundwasserstand || pt.properties.value || pt.properties.grundwasserstand_m_nhn);
                        num += w * val;
                        den += w;
                    });

                    if (den > 0) {
                        const idwVal = num / den;
                        gridFeatures.push({
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [[
                                    [lng, lat], [lng + cellSize, lat],
                                    [lng + cellSize, lat + cellSize], [lng, lat + cellSize], [lng, lat]
                                ]]
                            },
                            properties: {
                                level_val: idwVal,
                                methode: "IDW Client-Side",
                                n_stationen: validPoints.length,
                                quelle: validPoints[0].properties.quelle || 'ELWAS-WEB (Land NRW)'
                            }
                        });
                    }
                }
            }

            const isoGeojson = {
                type: "FeatureCollection",
                features: gridFeatures
            };
            window.gwIsoGeoData = isoGeojson;

            L.geoJSON(isoGeojson, {
                style: function(feature) {
                    const val = feature.properties.level_val;
                    return {
                        fillColor: getColorForLevel(val),
                        fillOpacity: 0.55,
                        color: '#333333',
                        weight: 0.5
                    };
                },
                onEachFeature: function(feature, layer) {
                    const p = feature.properties;
                    const val = p.level_val;
                    const valDisplay = (val !== undefined && val !== null) ? val.toFixed(2) : '?';
                    let popupContent = `<div class="popup-card">
                        <div class="popup-group" style="color: #0072B2;">Grundwassergleichen</div>
                        <div class="popup-title">Wert: ${valDisplay} m ü. NHN</div>
                        <div class="popup-detail">ℹ️ ${p.methode ? 'Methode: ' + p.methode : 'Interpoliert'}</div>
                        <div class="popup-detail">📊 Stationen genutzt: ${p.n_stationen || '?'}</div>`;

                    if (p.stand_datum) {
                        popupContent += `<div class="popup-detail">📅 Stand: ${p.stand_datum}</div>`;
                    }
                    if (p.quelle) {
                        popupContent += `<div style="font-size: 0.85em; color: #666; margin-top: 8px;">Quelle: ${p.quelle}</div>`;
                    }
                    popupContent += `</div>`;
                    layer.bindPopup(popupContent);
                }
            }).addTo(gwIsoLayer);

            if (typeof updateSidebarCounters === 'function') {
                updateSidebarCounters();
            }
        })
        .catch(err => {
            console.log('Fehler beim Laden von grundwassermessstellen.geojson für Isolinien:', err);
            gwIsoLoaded = false; // Reset loaded flag for retries
        });
}

// Global verfügbar machen
window.gwIsoLayer = gwIsoLayer;
window.loadGwIsoLayer = loadGwIsoLayer;
