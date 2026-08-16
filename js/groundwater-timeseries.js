/**
 * js/groundwater-timeseries.js
 * AquaRevier Historical Groundwater Time-Series & Recovery Slider (2000–2030)
 * Visualizes historical groundwater level changes, pit lake recovery, and trend forecasts across Rheinisches Revier.
 */

(function() {
    window.timeSeriesYears = [2000, 2005, 2010, 2015, 2020, 2025, 2030];
    window.currentTimeSeriesIndex = 5; // Default: 2025
    window.isTimeSeriesPlaying = false;
    window.timeSeriesInterval = null;
    window.timeSeriesSpeedMs = 1500;
    window.timeSeriesMarkersGroup = null;

    /**
     * Simulation trend model generator (SIMULATION / HYDROLOGICAL MODEL).
     * Clarification: Real time-series measurement datasets (2000-2030) are not present in the static GeoJSON layer.
     * Values are modeled trends for demonstration/scenario simulation.
     */
    function getStationDelta(stationId, year) {
        let hash = 0;
        const str = String(stationId || 'gwm_default');
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        const baseTrend = (hash % 100) / 10.0; // -10.0 to +10.0 base
        const progress = (year - 2000) / 30.0; // 0.0 to 1.0

        // Tagebau-Sümpfung phase (2000-2015) vs Wiederanstieg phase (2015-2030)
        let delta = 0;
        if (year <= 2015) {
            delta = baseTrend * (1.0 - progress * 0.5);
        } else {
            delta = baseTrend * 0.5 + (year - 2015) * 0.25 * (Math.abs(hash % 3) + 0.5);
        }
        return Math.round(delta * 10) / 10;
    }

    /**
     * Color helper based on groundwater level delta (in meters).
     */
    function getDeltaColor(delta) {
        if (delta >= 3.0) return '#1e40af';       // Deep Navy (+3m+)
        if (delta >= 1.0) return '#2563eb';       // Blue (+1m to +3m)
        if (delta >= 0.2) return '#0284c7';       // Cyan (+0.2m to +1m)
        if (delta >= -0.2) return '#16a34a';      // Green (-0.2m to +0.2m Stable)
        if (delta >= -1.5) return '#d97706';      // Orange (-1.5m to -0.2m Drop)
        return '#dc2626';                         // Red (Severe Drop < -1.5m)
    }

    /**
     * Renders time-series data for the specified year index.
     */
    window.setTimeSeriesYearIndex = function(index) {
        if (index < 0) index = 0;
        if (index >= window.timeSeriesYears.length) index = window.timeSeriesYears.length - 1;
        window.currentTimeSeriesIndex = index;

        const year = window.timeSeriesYears[index];
        const yearDisplay = document.getElementById('timeseries-year-display');
        const slider = document.getElementById('timeseries-slider');

        if (yearDisplay) yearDisplay.textContent = String(year);
        if (slider) slider.value = String(index);

        window.updateTimeSeriesVisualization(year);
    };

    /**
     * Updates map markers & summary stats for a given year.
     */
    window.updateTimeSeriesVisualization = function(year) {
        if (typeof map === 'undefined') return;

        if (!window.timeSeriesMarkersGroup) {
            window.timeSeriesMarkersGroup = L.layerGroup().addTo(map);
        }
        window.timeSeriesMarkersGroup.clearLayers();

        let totalStations = 0;
        let risingCount = 0;
        let droppingCount = 0;
        let deltaSum = 0;

        // Fetch Grundwassermessstellen from layerDataStore
        let gwmFeatures = [];
        if (window.layerDataStore && window.layerDataStore['grundwassermessstellen']) {
            gwmFeatures = window.layerDataStore['grundwassermessstellen'].features || [];
        }

        gwmFeatures.forEach(f => {
            if (!f.geometry || f.geometry.type !== 'Point') return;
            const coords = f.geometry.coordinates;
            const p = f.properties || {};
            const stationId = p.messstellen_nr || p.name || 'gwm';

            const delta = getStationDelta(stationId, year);
            totalStations++;
            deltaSum += delta;

            if (delta > 0.2) risingCount++;
            else if (delta < -0.2) droppingCount++;

            const color = getDeltaColor(delta);
            const radius = Math.max(5, Math.min(12, 6 + Math.abs(delta)));

            const marker = L.circleMarker([coords[1], coords[0]], {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 1.5,
                opacity: 0.9,
                fillOpacity: 0.8
            }).bindTooltip(`
                <div style="font-size: 11px;">
                    <b>${escapeHtml(p.name || 'Messstelle')}</b> <span style="background:#e0f2fe; color:#0369a1; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:600;">SIMULATION</span><br>
                    Modelljahr: <b>${year}</b><br>
                    Simuliertes Delta: <b style="color:${color};">${delta >= 0 ? '+' : ''}${delta} m</b>
                </div>
            `, { direction: 'top', offset: [0, -6] });

            window.timeSeriesMarkersGroup.addLayer(marker);
        });

        // Update stats readout
        const statsSummary = document.getElementById('timeseries-stats-summary');
        if (statsSummary) {
            if (totalStations === 0) {
                statsSummary.innerHTML = `
                    <div style="font-size: 11px; color: var(--text-secondary, #64748b); text-align: center; padding: 4px;">
                        <span style="background:#fef3c7; color:#92400e; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:600; display:inline-block; margin-bottom:4px;">⚠️ HYDROLOGISCHE SIMULATION</span><br>
                        Aktiviere den Layer "Grundwassermessstellen", um Stations-Modellreihen (2000-2030) anzuzeigen.
                    </div>
                `;
            } else {
                const avgDelta = (deltaSum / totalStations).toFixed(1);
                const avgColor = getDeltaColor(parseFloat(avgDelta));
                statsSummary.innerHTML = `
                    <div id="gwm-timeseries-spinner" style="display:none; text-align:center; padding:6px; color:#2563eb; font-size:11px;">
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Lade Grundwasser-Zeitreihe...
                    </div>
                    <div style="background:#fef3c7; color:#92400e; font-size:9.5px; padding:2px 4px; border-radius:3px; text-align:center; font-weight:600; margin-bottom:4px;">
                        ⚠️ Trendmodell / Modellierte Werte (Keine Echtdaten-Zeitreihe)
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center; font-size: 11px;">
                        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <div style="font-weight: 700; color: ${avgColor};">${avgDelta >= 0 ? '+' : ''}${avgDelta} m</div>
                            <div style="font-size: 9.5px; color: var(--text-secondary, #64748b);">Ø Sim. Delta</div>
                        </div>
                        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <div style="font-weight: 700; color: #2563eb;">${risingCount}</div>
                            <div style="font-size: 9.5px; color: var(--text-secondary, #64748b);">📈 Anstieg</div>
                        </div>
                        <div style="background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <div style="font-weight: 700; color: #dc2626;">${droppingCount}</div>
                            <div style="font-size: 9.5px; color: var(--text-secondary, #64748b);">📉 Absenkung</div>
                        </div>
                    </div>
                `;
            }
        }
    };

    /**
     * Toggles Play / Pause animation loop.
     */
    window.toggleTimeSeriesPlay = function() {
        const btn = document.getElementById('btn-timeseries-play');
        if (!window.isTimeSeriesPlaying) {
            window.pauseTimeSeries();
            window.isTimeSeriesPlaying = true;
            if (btn) {
                btn.innerHTML = '⏸️ Pause';
                btn.style.background = '#d97706';
                btn.style.borderColor = '#b45309';
            }
            window.timeSeriesInterval = setInterval(() => {
                let nextIdx = window.currentTimeSeriesIndex + 1;
                if (nextIdx >= window.timeSeriesYears.length) {
                    nextIdx = 0; // Loop back to 2000
                }
                window.setTimeSeriesYearIndex(nextIdx);
            }, window.timeSeriesSpeedMs);
        } else {
            window.pauseTimeSeries();
        }
    };

    /**
     * Pauses animation loop.
     */
    window.pauseTimeSeries = function() {
        window.isTimeSeriesPlaying = false;
        if (window.timeSeriesInterval) {
            clearInterval(window.timeSeriesInterval);
            window.timeSeriesInterval = null;
        }
        const btn = document.getElementById('btn-timeseries-play');
        if (btn) {
            btn.innerHTML = '▶️ Play';
            btn.style.background = '#16a34a';
            btn.style.borderColor = '#15803d';
        }
    };

    /**
     * Clears animation and removes time-series markers.
     */
    window.resetTimeSeries = function() {
        window.pauseTimeSeries();
        if (typeof map !== 'undefined' && window.timeSeriesMarkersGroup) {
            map.removeLayer(window.timeSeriesMarkersGroup);
            window.timeSeriesMarkersGroup = null;
        }
        const slider = document.getElementById('timeseries-year-slider');
        if (slider) slider.value = 5;
        window.setTimeSeriesYearIndex(5); // Reset to 2025
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Initialize deterministically once the controls exist. A delayed reset
    // used to overwrite real user input made during the first 600 ms.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.setTimeSeriesYearIndex(5), { once: true });
    } else {
        window.setTimeSeriesYearIndex(5);
    }
})();
