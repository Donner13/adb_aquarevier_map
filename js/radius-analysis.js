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
        const radiusSlider = document.getElementById('radius-slider');
        const radiusMeters = parseInt(radiusSlider ? radiusSlider.value : 5000, 10);
        
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
        const radiusSlider = document.getElementById('radius-slider');

        const lat = parseFloat(latInput ? latInput.value : '');
        const lng = parseFloat(lngInput ? lngInput.value : '');
        const radiusMeters = parseInt(radiusSlider ? radiusSlider.value : 5000, 10);

        if (isNaN(lat) || isNaN(lng)) {
            if (typeof window.showToast === 'function') window.showToast("Bitte gültige Koordinaten (Breite/Länge) eingeben", "⚠️");
            return;
        }

        window.runRadiusAnalysis(lat, lng, radiusMeters);
    };


    let radiusDebounceTimer = null;

    /**
     * Handles slider input events. Updates display value immediately and
     * debounces the actual point-in-polygon analysis.
     */
    window.handleRadiusSliderInput = function(val) {
        const radiusMeters = parseInt(val, 10);

        // Update display text
        const valSpan = document.getElementById('radius-slider-val');
        if (valSpan) {
            valSpan.textContent = (radiusMeters >= 1000 ? (radiusMeters / 1000) + ' km' : radiusMeters + ' m');
        }

        // Only run analysis if a center is already defined
        if (!window.lastRadiusResults || !window.lastRadiusResults.center) return;
        const center = window.lastRadiusResults.center;

        // Clear existing timer
        if (radiusDebounceTimer) clearTimeout(radiusDebounceTimer);

        // Set new timer for 150ms
        radiusDebounceTimer = setTimeout(() => {
            window.runRadiusAnalysis(center[0], center[1], radiusMeters);
        }, 150);
    };
    /**
     * Executes the radius analysis around a specific center coordinate.
     */
    window.runRadiusAnalysis = function(centerLat, centerLng, radiusMeters) {
        if (typeof map === 'undefined') return;

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

        // 2. Check ELWAS / Point Layer Datasets in layerDataStore
        const layerDatasetLabels = {
            'grundwassermessstellen': '💧 Grundwassermessstellen',
            'pegel': '📏 Flusspegel',
            'stauanlagen': '⛰️ Stauanlagen',
            'regenbecken': '🌧️ Regenbecken',
            'querbauwerke': '🧱 Querbauwerke',
            'elwas_einleiter': '🏭 Industrieeinleiter',
            'h2_elektrolyseure_nrw': '⚡ H2-Industrie'
        };

        if (window.layerDataStore) {
            Object.keys(layerDatasetLabels).forEach(key => {
                const geojson = window.layerDataStore[key];
                if (geojson && Array.isArray(geojson.features)) {
                    const label = layerDatasetLabels[key];
                    geojson.features.forEach(f => {
                        if (!f.geometry || f.geometry.type !== 'Point') return;
                        const coords = f.geometry.coordinates;
                        const dist = haversineDistance(centerLat, centerLng, coords[1], coords[0]);
                        if (dist <= radiusMeters) {
                            const p = f.properties || {};
                            const name = p.name || p.bezeichnung || p.betreiber || p.anlagen_nr || key;
                            const sub = p.gewaesser || p.gemeinde || p.kreis || p.typ || '';
                            addHit(label, {
                                name: name,
                                sub: sub,
                                dist: dist,
                                lat: coords[1],
                                lng: coords[0],
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
     */
    window.exportRadiusResultsCSV = function() {
        if (!window.lastRadiusResults || window.lastRadiusResults.totalHits === 0) return;
        const res = window.lastRadiusResults;

        let csv = 'Kategorie;Name;Zusatz/Ort;Entfernung_Meter;Breitengrad;Längengrad\n';

        Object.keys(res.byCategory).forEach(cat => {
            res.byCategory[cat].forEach(item => {
                const catClean = cat.replace(/;/g, ',');
                const nameClean = (item.name || '').replace(/;/g, ',');
                const subClean = (item.sub || '').replace(/;/g, ',');
                csv += `"${catClean}";"${nameClean}";"${subClean}";${Math.round(item.dist)};${item.lat};${item.lng}\n`;
            });
        });

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
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
