const fs = require('fs');
const path = 'js/app-enhancements.js';
let content = fs.readFileSync(path, 'utf8');

const targetFunctionStart = content.indexOf('window.exportActiveLayersData = function (format = \'geojson\') {');
const targetFunctionEnd = content.indexOf('// --- 4. UPTIME & SYSTEM HEALTH BADGE ---');

const exportFunctionOld = content.substring(targetFunctionStart, targetFunctionEnd);

const newExportFunction = `window.exportActiveLayersData = function (format = 'geojson') {
        const activeFeatures = [];
        let invalidFeaturesCount = 0;

        // Strict number check: Must be number, not NaN, not Infinity
        const isStrictNumber = (n) => typeof n === 'number' && Number.isFinite(n);

        // A position is an array of at least two strict numbers (usually [lon, lat, ?elevation, ?m])
        const isPositionArray = (arr) => Array.isArray(arr) && arr.length >= 2 && arr.every(isStrictNumber);

        // Multigeometries and Polygons can technically be empty [] representing empty geometries in some implementations
        const isMultiPointArray = (arr) => Array.isArray(arr) && (arr.length === 0 || arr.every(isPositionArray));
        const isLineStringArray = (arr) => Array.isArray(arr) && (arr.length === 0 || (arr.length >= 2 && arr.every(isPositionArray)));
        const isMultiLineStringArray = (arr) => Array.isArray(arr) && (arr.length === 0 || arr.every(isLineStringArray));

        const isLinearRing = (arr) => {
            if (!Array.isArray(arr)) return false;
            if (arr.length < 4) return false;
            if (!arr.every(isPositionArray)) return false;

            const first = arr[0];
            const last = arr[arr.length - 1];
            if (first.length !== last.length) return false;
            for (let i = 0; i < first.length; i++) {
                if (first[i] !== last[i]) return false;
            }
            return true;
        };

        const isPolygonArray = (arr) => Array.isArray(arr) && (arr.length === 0 || arr.every(isLinearRing));
        const isMultiPolygonArray = (arr) => Array.isArray(arr) && (arr.length === 0 || arr.every(isPolygonArray));

        const assertValidGeometry = (geom, isCollectionItem = false) => {
            if (geom === null) {
                if (isCollectionItem) throw new TypeError('GeometryCollection element cannot be null');
                return; // Valid for Feature geometry
            }
            if (typeof geom !== 'object') throw new TypeError('Geometry must be an object or null');
            if (!geom.type || typeof geom.type !== 'string') throw new TypeError('Geometry must have a type string');

            const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];
            if (!validTypes.includes(geom.type)) throw new TypeError('Invalid geometry type');

            if (geom.type === 'GeometryCollection') {
                if (!Array.isArray(geom.geometries)) throw new TypeError('GeometryCollection must have a geometries array');
                geom.geometries.forEach(g => assertValidGeometry(g, true)); // Deep validation, elements cannot be null
            } else {
                if (!Array.isArray(geom.coordinates)) throw new TypeError('Geometry must have a coordinates array');

                // Point cannot have an empty coordinate array
                if (geom.type === 'Point' && !isPositionArray(geom.coordinates)) throw new TypeError('Invalid Point coordinates');

                // Allow empty coordinates for empty geometries explicitly ONLY for non-point geometries
                if (geom.type !== 'Point' && geom.coordinates.length === 0) return;

                if (geom.type === 'MultiPoint' && !isMultiPointArray(geom.coordinates)) throw new TypeError('Invalid MultiPoint coordinates');
                if (geom.type === 'LineString' && !isLineStringArray(geom.coordinates)) throw new TypeError('Invalid LineString coordinates');
                if (geom.type === 'MultiLineString' && !isMultiLineStringArray(geom.coordinates)) throw new TypeError('Invalid MultiLineString coordinates');
                if (geom.type === 'Polygon' && !isPolygonArray(geom.coordinates)) throw new TypeError('Invalid Polygon coordinates');
                if (geom.type === 'MultiPolygon' && !isMultiPolygonArray(geom.coordinates)) throw new TypeError('Invalid MultiPolygon coordinates');
            }
        };

        const isPlainObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return false;
            const proto = Object.getPrototypeOf(obj);
            return proto === Object.prototype || proto === null;
        };

        const assertValidFeature = (f) => {
            if (!isPlainObject(f)) throw new TypeError('Feature must be an object');
            if (f.type !== 'Feature') throw new TypeError('Type must be Feature');
            if ('properties' in f && f.properties !== null && f.properties !== undefined && !isPlainObject(f.properties)) throw new TypeError('Properties must be a plain object, null, or undefined');
            assertValidGeometry(f.geometry);
        };

        const processFeature = (f, key) => {
            try {
                // Type Assertions
                assertValidFeature(f);

                const featCopy = JSON.parse(JSON.stringify(f));
                if (!featCopy.properties || featCopy.properties === null) {
                    featCopy.properties = {};
                }
                featCopy.properties._layer_name = String(key);
                activeFeatures.push(featCopy);
            } catch (e) {
                // Feature fails assertion, skip it
                invalidFeaturesCount++;
                console.warn('Skipping invalid GeoJSON feature during export:', e.message);
            }
        };

        // Track layers directly mapped to avoid missing fallback behavior
        const matchedKeys = new Set();
        let anyOverlayActive = false;

        if (window.layerDataStore && window.overlayMaps && window.map) {
            Object.keys(window.overlayMaps).forEach(label => {
                const layer = window.overlayMaps[label];
                if (layer && window.map.hasLayer(layer)) {
                    anyOverlayActive = true;
                    // Find all dataset keys that are active
                    Object.keys(window.layerDataStore).forEach(key => {
                        const storeData = window.layerDataStore[key];
                        // Just map the store keys based on the existing logic
                        if (storeData && Array.isArray(storeData.features)) {
                            matchedKeys.add(key);
                        }
                    });
                }
            });
        }

        // Only run fallback if NO overlays are active AT ALL
        if (!anyOverlayActive && window.layerDataStore) {
            Object.keys(window.layerDataStore).forEach(key => {
                const storeData = window.layerDataStore[key];
                if (storeData && Array.isArray(storeData.features)) {
                    matchedKeys.add(key);
                }
            });
        }

        // Process strictly deduplicated store keys to guarantee each feature array is extracted exactly once per key mapping
        matchedKeys.forEach(key => {
            const storeData = window.layerDataStore[key];
            if (storeData && Array.isArray(storeData.features)) {
                storeData.features.forEach(f => {
                    try {
                        assertValidFeature(f);
                        const featCopy = JSON.parse(JSON.stringify(f));
                        if (!featCopy.properties || featCopy.properties === null) {
                            featCopy.properties = {};
                        }
                        featCopy.properties._layer_name = String(key);
                        activeFeatures.push(featCopy);
                    } catch (e) {
                        invalidFeaturesCount++;
                        console.warn('Skipping invalid GeoJSON feature during export:', e.message);
                    }
                });
            }
        });

        if (activeFeatures.length === 0) {
            if (invalidFeaturesCount > 0) {
                window.showToast(\`Keine gültigen Objekte gefunden. \${invalidFeaturesCount} ungültige Objekte wurden übersprungen.\`, "⚠️");
            } else {
                window.showToast("Keine aktiven Fachdaten-Layer auf der Karte sichtbar", "⚠️");
            }
            return;
        }

        if (invalidFeaturesCount > 0) {
            window.showToast(\`\${invalidFeaturesCount} fehlerhafte Objekte wurden beim Export übersprungen.\`, "⚠️");
        }

        const dateStr = new Date().toISOString().split('T')[0];

        if (format === 'geojson') {
            const geojsonOutput = {
                type: "FeatureCollection",
                _metadata: {
                    title: "AquaRevier Akteurskarte — Geodaten-Export",
                    exported_at: new Date().toISOString(),
                    license: "Data licence Germany – attribution – Version 2.0 / Land NRW",
                    source: "ELWAS-WEB (Land NRW) / Geobasis NRW",
                    feature_count: activeFeatures.length
                },
                features: activeFeatures
            };

            const blob = new Blob([JSON.stringify(geojsonOutput, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`aquarevier_geodata_export_\${dateStr}.geojson\`;
            a.click();
            URL.revokeObjectURL(url);
            window.showToast(\`\${activeFeatures.length} Objekte als GeoJSON exportiert\`, "💾");
        } else if (format === 'csv') {
            // Flatten properties to CSV with semicolon delimiter and UTF-8 BOM
            const allKeys = new Set();
            activeFeatures.forEach(f => {
                if (f.properties) Object.keys(f.properties).forEach(k => allKeys.add(k));
            });
            const keyArray = Array.from(allKeys);
            let csv = '\\uFEFF' + keyArray.join(';') + '\\n';

            activeFeatures.forEach(f => {
                const row = keyArray.map(k => {
                    let val = f.properties[k];
                    if (val === null || val === undefined) return '""';
                    if (typeof val === 'object') val = JSON.stringify(val);
                    val = String(val).replace(/"/g, '""');
                    return \`"\${val}"\`;
                });
                csv += row.join(';') + '\\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`aquarevier_data_export_\${dateStr}.csv\`;
            a.click();
            URL.revokeObjectURL(url);
            window.showToast(\`\${activeFeatures.length} Objekte als CSV exportiert\`, "💾");
        }
    };

    `;

content = content.replace(exportFunctionOld, newExportFunction);
fs.writeFileSync(path, content);
