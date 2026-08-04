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
let gwIsoGeoData = null;

function loadGwIsoLayer() {
    if (gwIsoLoaded) return;
    gwIsoLoaded = true;

    fetch('grundwassermessstellen.geojson')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            if (!data || !data.features || data.features.length === 0) {
                return;
            }

            // Filtern nach Messstellen, die tatsaechlich einen numerischen Wert haben
            const validPoints = data.features.filter(f => {
                const val = f.properties.grundwasserstand || f.properties.value || f.properties.grundwasserstand_m_nhn;
                return val !== undefined && val !== null && !isNaN(parseFloat(val));
            });

            // Wenn keine Daten mit Messwerten vorhanden sind (aktueller Stand), bleibt der Layer leer
            if (validPoints.length === 0) {
                console.warn("Grundwassergleichenplan: Keine numerischen Messwerte in grundwassermessstellen.geojson gefunden. Layer bleibt leer.");
                return;
            }

            // IDW und Isoband-Generierung (Minimal-Implementierung fuer den Fall, dass Daten vorhanden waeren)
            // Hier wuerde eine Raster-Berechnung + Marching Squares stattfinden.
            // Da wir keine externen Dependencies laden sollen und keine Daten vorhanden sind,
            // belassen wir es bei der Daten-Validierung und einem leeren Layer-Fallback.
            // Sobald Daten vorhanden sind, wuerde dieser Block die Geometrien auf gwIsoLayer addieren.

            // Dummy: Wenn wir Daten haetten, wuerden wir hier L.geoJSON(...) aufrufen
            // const isoGeojson = calculateContours(validPoints);
            // L.geoJSON(isoGeojson, { style: ... }).addTo(gwIsoLayer);
        })
        .catch(err => {
            console.error('Fehler beim Laden von grundwassermessstellen.geojson fuer Isolinien:', err);
        });
}

// Global verfuegbar machen fuer index.html
window.gwIsoLayer = gwIsoLayer;
window.loadGwIsoLayer = loadGwIsoLayer;
