/**
 * js/radius-analysis.js
 * AquaRevier Spatial Query & Radius Analysis Tool
 * Calculates all actors, monitoring stations, industrial outlets, dams, etc. within a chosen radius.
 */

(function() {
    window.radiusAnalysisActive = false;
    window.radiusCircle = null;
    window.radiusCenterMarker = null;
    window.lastRadiusResults = null;

    /**
     * Haversine distance in meters between two lat/lng pairs.
     */
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Toggles radius selection mode on the map.
     */
    window.toggleRadiusAnalysis = function() {
        const btn = document.getElementById('btn-radius-activate');
        const statusInfo = document.getElementById('radius-status-info');
        
        if (!window.radiusAnalysisActive) {
            window.radiusAnalysisActive = true;
            if (btn) {
                btn.style.background = '#2563eb';
                btn.style.color = '#ffffff';
                btn.style.borderColor = '#1d4ed8';
                btn.innerHTML = '🎯 Klicke auf Karte...';
            }
            if (statusInfo) {
                statusInfo.style.background = '#e0f2fe';
                statusInfo.style.borderColor = '#0284c7';
                statusInfo.style.color = '#0369a1';
                statusInfo.innerHTML = '📍 <b>Aktiv:</b> Klicke jetzt auf einen Ort in der Karte.';
            }
            if (typeof map !== 'undefined' && map.getContainer()) {
                map.getContainer().style.cursor = 'crosshair';
            }
        } else {
            window.deactivateRadiusAnalysisMode();
        }
    };

    /**
     * Deactivates click mode without clearing current circle.
     */
    window.deactivateRadiusAnalysisMode = function() {
        window.radiusAnalysisActive = false;
        const btn = document.getElementById('btn-radius-activate');
        if (btn) {
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.innerHTML = '📍 Punkt wählen';
        }
        if (typeof map !== 'undefined' && map.getContainer()) {
            map.getContainer().style.cursor = '';
        }
    };

    /**
     * Handles map click event when radius analysis is active.
     */
    window.handleRadiusMapClick = function(e) {
        if (!window.radiusAnalysisActive) return;
        const latlng = e.latlng;
        const radiusSelect = document.getElementById('radius-select');
        const radiusMeters = parseInt(radiusSelect ? radiusSelect.value : 5000, 10);
        
        // Populate inputs for visibility
        const latInput = document.getElementById('radius-manual-lat');
        const lngInput = document.getElementById('radius-manual-lng');
        if (latInput) latInput.value = latlng.lat.toFixed(4);
        if (lngInput) lngInput.value = latlng.lng.toFixed(4);

        window.runRadiusAnalysis(latlng.lat, latlng.lng, radiusMeters);
        window.deactivateRadiusAnalysisMode();
    };

    /**
     * Executes radius analysis using manual inputs.
     */
    window.runRadiusAnalysisFromInputs = function() {
        const latInput = document.getElementById('radius-manual-lat');
        const lngInput = document.getElementById('radius-manual-lng');
        const radiusSelect = document.getElementById('radius-select');

        const lat = parseFloat(latInput ? latInput.value : '');
        const lng = parseFloat(lngInput ? lngInput.value : '');
        const radiusMeters = parseInt(radiusSelect ? radiusSelect.value : 5000, 10);

        if (isNaN(lat) || isNaN(lng)) {
            if (typeof window.showToast === 'function') window.showToast("Bitte gültige Koordinaten (Breite/Länge) eingeben", "⚠️");
            return;
        }

        window.runRadiusAnalysis(lat, lng, radiusMeters);
    };

    /**
     * Executes the radius analysis around a specific center coordinate.
     * [AQ-104] Now auto-loads required datasets.
     */
    window.runRadiusAnalysis = async function(centerLat, centerLng, radiusMeters) {
        if (typeof map === 'undefined') return;

        const statusInfo = document.getElementById('radius-status-info');
        if (statusInfo) {
            statusInfo.innerHTML = '🔄 Lade erforderliche Daten für Analyse...';
        }

        // Ensure all layers from LAYER_CONFIGS are loaded [AQ-104]
        if (window.layerLoaders) {
            const promises = Object.values(window.layerLoaders).map(loader => loader());
            try {
                await Promise.all(promises);
            } catch (e) {
                console.warn("Some layers failed to load for radius analysis", e);
            }
        }

        // Clear existing circle and marker
        if (window.radiusCircle) {
            map.removeLayer(window.radiusCircle);
            window.radiusCircle = null;
        }
        if (window.radiusCenterMarker) {
            map.removeLayer(window.radiusCenterMarker);
            window.radiusCenterMarker = null;
        }

        // Draw new center marker
        const centerIcon = L.divIcon({
            className: 'radius-center-icon',
            html: '<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 10px rgba(0,0,0,0.6);animation:pulse-marker 1.5s infinite;"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });
        window.radiusCenterMarker = L.marker([centerLat, centerLng], { icon: centerIcon }).addTo(map);

        // Draw new radius circle
        window.radiusCircle = L.circle([centerLat, centerLng], {
            radius: radiusMeters,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6, 6'
        }).addTo(map);

        // Fit map bounds with padding
        map.fitBounds(window.radiusCircle.getBounds(), { padding: [30, 30] });

        // Collect matching features
        const resultsByCategory = {};
        let totalHits = 0;

        function addHit(category, item) {
            if (!resultsByCategory[category]) {
                resultsByCategory[category] = [];
            }
            resultsByCategory[category].push(item);
            totalHits++;
        }

        // 1. Check Primary Contacts (geojsonData)
        if (window.geojsonData && Array.isArray(window.geojsonData.features)) {
            window.geojsonData.features.forEach(f => {
                if (!f.geometry || f.geometry.type !== 'Point') return;
                const coords = f.geometry.coordinates;
                const dist = haversineDistance(centerLat, centerLng, coords[1], coords[0]);
                if (dist <= radiusMeters) {
                    const p = f.properties || {};
                    const name = p.name || p.institution || p.name_anonymized || 'Akteur';
                    const group = p.group || p.gruppe || p.kategorie || 'Akteure';
                    addHit(`🤝 Akteure (${group})`, {
                        name: name,
                        sub: p.ort || p.stadt || p.typ || '',
                        dist: dist,
                        lat: coords[1],
                        lng: coords[0],
                        properties: p
                    });
                }
            });
        }

        // 2. Check ELWAS / Point & Polyline Layer Datasets in layerDataStore [AQ-105]
        const layerDatasetLabels = {
            'grundwassermessstellen': '💧 Grundwassermessstellen',
            'pegel': '📏 Flusspegel',
            'stauanlagen': '⛰️ Stauanlagen',
            'regenbecken': '🌧️ Regenbecken',
            'querbauwerke': '🧱 Querbauwerke',
            'elwas_einleiter': '🏭 Industrieeinleiter',
            'h2_elektrolyseure_nrw': '⚡ H2-Industrie',
            'gewaesserguete': '💧 Gewässergüte'
        };

        if (window.layerDataStore) {
            Object.keys(layerDatasetLabels).forEach(key => {
                const geojson = window.layerDataStore[key];
                if (geojson && Array.isArray(geojson.features)) {
                    const label = layerDatasetLabels[key];
                    geojson.features.forEach(f => {
                        if (!f.geometry) return;

                        let dist = Infinity;
                        let lat, lng;

                        if (f.geometry.type === 'Point') {
                            const coords = f.geometry.coordinates;
                            lat = coords[1];
                            lng = coords[0];
                            dist = haversineDistance(centerLat, centerLng, lat, lng);
                        } else if (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString' || f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
                            // [AQ-105] Use distance to nearest point of geometry
                            dist = getMinDistanceToGeometry(centerLat, centerLng, f.geometry);
                            // For result zooming, use centroid or first point
                            const center = getGeometryCenter(f.geometry);
                            lat = center[0];
                            lng = center[1];
                        }

                        if (dist <= radiusMeters) {
                            const p = f.properties || {};
                            const name = p.name || p.bezeichnung || p.betreiber || p.anlagen_nr || key;
                            const sub = p.gewaesser || p.gemeinde || p.kreis || p.typ || p.abschnitt || '';
                            addHit(label, {
                                name: name,
                                sub: sub,
                                dist: dist,
                                lat: lat,
                                lng: lng,
                                properties: p
                            });
                        }
                    });
                }
            });
        }

        window.lastRadiusResults = {
            center: [centerLat, centerLng],
            radiusMeters: radiusMeters,
            totalHits: totalHits,
            byCategory: resultsByCategory
        };

        // Render UI Results
        renderRadiusResults();
    };

    /**
     * Renders analysis results in the sidebar container.
     */
    function renderRadiusResults() {
        const resultsContainer = document.getElementById('radius-results-container');
        const statusInfo = document.getElementById('radius-status-info');
        const clearBtn = document.getElementById('btn-radius-clear');

        if (!window.lastRadiusResults) return;
        const res = window.lastRadiusResults;
        const kmStr = (res.radiusMeters / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 });

        if (clearBtn) clearBtn.disabled = false;

        if (statusInfo) {
            statusInfo.style.background = '#f0fdf4';
            statusInfo.style.borderColor = '#16a34a';
            statusInfo.style.color = '#15803d';
            statusInfo.innerHTML = `✅ <b>${res.totalHits} Treffer</b> im Radius von <b>${kmStr} km</b>.`;
        }

        if (!resultsContainer) return;
        resultsContainer.style.display = 'block';

        if (res.totalHits === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 10px; text-align: center; color: #64748b; font-size: 12px; background: #f8fafc; border-radius: 4px;">
                    Keine Objekte im gewählten Radius von ${kmStr} km gefunden.
                </div>
            `;
            return;
        }

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 600; font-size: 12px; color: #1e293b;">Ergebnisliste (${res.totalHits}):</span>
                <button type="button" class="btn btn-sm btn-outline-success" style="font-size: 10px; padding: 1px 6px;" onclick="exportRadiusResultsCSV()">
                    📥 CSV Export
                </button>
            </div>
        `;

        Object.keys(res.byCategory).forEach(cat => {
            const items = res.byCategory[cat];
            // Sort items by distance
            items.sort((a, b) => a.dist - b.dist);

            html += `
                <div style="margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; background: #ffffff;">
                    <div style="background: #f1f5f9; padding: 4px 8px; font-weight: 600; font-size: 11px; color: #334155; display: flex; justify-content: space-between;">
                        <span>${cat}</span>
                        <span class="badge bg-secondary" style="font-size: 10px;">${items.length}</span>
                    </div>
                    <div style="max-height: 120px; overflow-y: auto;">
            `;

            items.forEach(item => {
                const distText = item.dist >= 1000 
                    ? (item.dist / 1000).toFixed(1) + ' km' 
                    : Math.round(item.dist) + ' m';

                html += `
                    <div onclick="zoomToRadiusHit(${item.lat}, ${item.lng}, '${escapeHtml(item.name)}')" 
                         style="padding: 4px 8px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">
                            <div style="font-weight: 500; font-size: 11px; color: #0f172a;">${escapeHtml(item.name)}</div>
                            ${item.sub ? `<div style="font-size: 10px; color: #64748b;">${escapeHtml(item.sub)}</div>` : ''}
                        </div>
                        <span style="font-size: 10px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 1px 4px; border-radius: 3px; white-space: nowrap;">
                            ${distText}
                        </span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    /**
     * Zooms and highlights a hit on the map.
     */
    window.zoomToRadiusHit = function(lat, lng, name) {
        if (typeof map === 'undefined') return;
        map.setView([lat, lng], 16, { animate: true });
        
        const popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(`<div style="font-size:12px; font-weight:bold; padding:4px;">📍 ${escapeHtml(name)}</div>`)
            .openOn(map);
    };

    /**
     * Clears current radius analysis graphics and results.
     */
    window.clearRadiusAnalysis = function() {
        if (typeof map !== 'undefined') {
            if (window.radiusCircle) {
                map.removeLayer(window.radiusCircle);
                window.radiusCircle = null;
            }
            if (window.radiusCenterMarker) {
                map.removeLayer(window.radiusCenterMarker);
                window.radiusCenterMarker = null;
            }
        }
        window.lastRadiusResults = null;
        window.deactivateRadiusAnalysisMode();

        const resultsContainer = document.getElementById('radius-results-container');
        const statusInfo = document.getElementById('radius-status-info');
        const clearBtn = document.getElementById('btn-radius-clear');

        if (clearBtn) clearBtn.disabled = true;
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }
        if (statusInfo) {
            statusInfo.style.background = '#f8fafc';
            statusInfo.style.borderColor = '#cbd5e1';
            statusInfo.style.color = '#475569';
            statusInfo.innerHTML = 'Klicke auf "📍 Punkt wählen" und danach auf einen Ort in der Karte.';
        }
    };

    /**
     * Exports current radius query results as a CSV file.
     * [AQ-106, AQ-107] Improved escaping and injection protection.
     */
    window.exportRadiusResultsCSV = function() {
        if (!window.lastRadiusResults || window.lastRadiusResults.totalHits === 0) return;
        const res = window.lastRadiusResults;

        const headers = ['Kategorie', 'Name', 'Zusatz/Ort', 'Entfernung_Meter', 'Breitengrad', 'Längengrad'];
        let csvRows = [headers.map(h => sanitizeCsvCell(h)).join(';')];

        Object.keys(res.byCategory).forEach(cat => {
            res.byCategory[cat].forEach(item => {
                const row = [
                    cat,
                    item.name || '',
                    item.sub || '',
                    Math.round(item.dist),
                    item.lat,
                    item.lng
                ];
                csvRows.push(row.map(cell => sanitizeCsvCell(cell)).join(';'));
            });
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AquaRevier_Umkreis_Analyse_${res.radiusMeters}m.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /**
     * Sanitizes a single CSV cell to prevent formula injection and fix quoting [AQ-106, AQ-107].
     */
    function sanitizeCsvCell(value) {
        if (value === null || value === undefined) return '""';
        let str = String(value);

        // Escape double quotes by doubling them
        str = str.replace(/"/g, '""');

        // Check for CSV Formula Injection characters (=, +, -, @)
        if (['=', '+', '-', '@'].includes(str.charAt(0))) {
            str = "'" + str; // Add leading apostrophe to neutralize
        }

        return `"${str}"`;
    }

    /**
     * Helper to find minimum distance to a GeoJSON geometry.
     * [AQ-105] Improved to support edge distance and polygon intersection.
     */
    function getMinDistanceToGeometry(lat, lng, geom) {
        if (geom.type === 'Point') {
            return haversineDistance(lat, lng, geom.coordinates[1], geom.coordinates[0]);
        }

        if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
            if (isPointInGeometry(lat, lng, geom)) return 0;
        }

        let minPlayerDist = Infinity;

        function processCoords(coords, type) {
            if (typeof coords[0] === 'number') {
                // This shouldn't happen for Lines/Polygons if structured correctly,
                // but as a fallback check vertices.
                const d = haversineDistance(lat, lng, coords[1], coords[0]);
                if (d < minPlayerDist) minPlayerDist = d;
            } else if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
                // We have a list of points (a LineString or a Polygon Ring)
                for (let i = 0; i < coords.length - 1; i++) {
                    const d = distToSegment(lat, lng, coords[i][1], coords[i][0], coords[i+1][1], coords[i+1][0]);
                    if (d < minPlayerDist) minPlayerDist = d;
                }
            } else {
                coords.forEach(c => processCoords(c, type));
            }
        }

        processCoords(geom.coordinates, geom.type);
        return minPlayerDist;
    }

    /**
     * Calculates distance from a point to a line segment using Haversine approximations for small distances.
     */
    function distToSegment(plat, plng, vlat, vlng, wlat, wlng) {
        const d2 = distSq(vlat, vlng, wlat, wlng);
        if (d2 === 0) return haversineDistance(plat, plng, vlat, vlng);
        let t = ((plat - vlat) * (wlat - vlat) + (plng - vlng) * (wlng - vlng)) / d2;
        t = Math.max(0, Math.min(1, t));
        return haversineDistance(plat, plng, vlat + t * (wlat - vlat), vlng + t * (wlng - vlng));
    }

    function distSq(vlat, vlng, wlat, wlng) {
        return (vlat - wlat) ** 2 + (vlng - wlng) ** 2;
    }

    /**
     * Ray-casting algorithm to check if point is inside geometry.
     */
    function isPointInGeometry(lat, lng, geom) {
        if (geom.type === 'Polygon') {
            return isPointInPolygon(lat, lng, geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
            return geom.coordinates.some(poly => isPointInPolygon(lat, lng, poly));
        }
        return false;
    }

    function isPointInPolygon(lat, lng, rings) {
        // First ring is exterior, others are holes
        let inside = false;
        const x = lng, y = lat;

        // Check exterior ring
        const exterior = rings[0];
        for (let i = 0, j = exterior.length - 1; i < exterior.length; j = i++) {
            const xi = exterior[i][0], yi = exterior[i][1];
            const xj = exterior[j][0], yj = exterior[j][1];
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        if (!inside) return false;

        // Check holes
        for (let k = 1; k < rings.length; k++) {
            if (isPointInPolygonRing(lat, lng, rings[k])) return false;
        }

        return true;
    }

    function isPointInPolygonRing(lat, lng, ring) {
        let inside = false;
        const x = lng, y = lat;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i][0], yi = ring[i][1];
            const xj = ring[j][0], yj = ring[j][1];
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Helper to get a representative center for a geometry.
     */
    function getGeometryCenter(geom) {
        if (geom.type === 'Point') return [geom.coordinates[1], geom.coordinates[0]];

        let lats = [], lngs = [];
        function collect(coords) {
            if (typeof coords[0] === 'number') {
                lats.push(coords[1]);
                lngs.push(coords[0]);
            } else {
                coords.forEach(collect);
            }
        }
        collect(geom.coordinates);

        if (lats.length === 0) return [0, 0];
        const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        return [avgLat, avgLng];
    }

    /**
     * Utility HTML escape helper.
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Initialize map click listener when map is ready.
     */
    function initMapClickListener() {
        if (typeof map !== 'undefined') {
            map.on('click', window.handleRadiusMapClick);
        } else {
            setTimeout(initMapClickListener, 200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMapClickListener);
    } else {
        initMapClickListener();
    }
})();
