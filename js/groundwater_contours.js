/**
 * js/groundwater_contours.js
 *
 * Lädt vorkalkulierte Grundwassergleichen (Isolinien/Isobänder) aus
 * grundwassergleichen.geojson und rendert sie als Polygon-Overlay.
 */

const gwIsoLayer = L.layerGroup();
let gwIsoLoaded = false;
window.gwIsoGeoData = null; // Exponiert für Counter-Update

// Farbenblind-sichere sequenzielle Okabe-Ito Palette
function getColorForLevel(level) {
    if (level === undefined || level === null) return '#56B4E9';
    // Beispielhafte Skala, wird anhand echter Level dynamisch oder hier statisch belegt
    if (level < 50) return '#0072B2';
    if (level < 100) return '#56B4E9';
    if (level < 150) return '#009E73';
    if (level < 200) return '#E69F00';
    return '#D55E00';
}

function loadGwIsoLayer() {
    if (gwIsoLoaded) return;
    gwIsoLoaded = true;

    fetch('grundwassergleichen.geojson')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            if (!data || !data.features || data.features.length === 0) {
                console.warn("Grundwassergleichenplan: Keine Features in grundwassergleichen.geojson. Layer bleibt leer.");
                return;
            }

            window.gwIsoGeoData = data;

            L.geoJSON(data, {
                style: function(feature) {
                    return {
                        fillColor: getColorForLevel(feature.properties.level_min || feature.properties.level_max),
                        fillOpacity: 0.55,
                        color: '#333333',
                        weight: 0.5
                    };
                },
                onEachFeature: function(feature, layer) {
                    const p = feature.properties;
                    let popupContent = `<div class="popup-card">
                        <div class="popup-group" style="color: #0072B2;">Grundwassergleichen</div>
                        <div class="popup-title">Wertebereich: ${p.level_min || '?'} – ${p.level_max || '?'} m ü. NHN</div>
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

            // Update Counter falls definiert (wird in index/internal getriggert)
            if (typeof updateSidebarCounters === 'function') {
                updateSidebarCounters();
            }
        })
        .catch(err => {
            // Fehlende Datei ist erwartet, bis das Python-Backend läuft
            console.log('grundwassergleichen.geojson nicht geladen (Layer bleibt leer). Grund:', err);
        });
}

// Global verfügbar machen
window.gwIsoLayer = gwIsoLayer;
window.loadGwIsoLayer = loadGwIsoLayer;
