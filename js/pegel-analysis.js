// js/pegel-analysis.js

window.activePegelLines = null;
window.activePegelMarkers = null;

function initPegelAnalysisLayer() {
    if (typeof map !== 'undefined' && !window.activePegelLines) {
        window.activePegelLines = L.layerGroup().addTo(map);
        window.activePegelMarkers = L.layerGroup().addTo(map);
    }
}

window.analyzePegel = function(pegelNr) {
    initPegelAnalysisLayer();
    window.activePegelLines.clearLayers();
    window.activePegelMarkers.clearLayers();

    if (!window.pegelGeoData) return;

    const pegelFeature = window.pegelGeoData.features.find(f => f.properties.pegel_nr === pegelNr);
    if (!pegelFeature) return;

    const p = pegelFeature.properties;
    const pegelLatLng = [pegelFeature.geometry.coordinates[1], pegelFeature.geometry.coordinates[0]];

    const betriebe = p.upstream_betriebe || [];

    if (betriebe.length === 0) return;

    let bounds = L.latLngBounds([pegelLatLng]);

    betriebe.forEach(betrieb => {
        const bLatLng = [betrieb.lat, betrieb.lng];

        // Draw dashed polyline
        const line = L.polyline([pegelLatLng, bLatLng], {
            color: '#009E73',
            weight: 3,
            dashArray: '5, 10',
            className: 'pegel-analysis-line',
            opacity: 0.8
        });
        window.activePegelLines.addLayer(line);

        // Add marker for betrieb
        const marker = L.circleMarker(bLatLng, {
            radius: 8,
            fillColor: '#FFD700',
            color: '#D55E00',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'pegel-analysis-marker'
        }).bindTooltip(`<b>${betrieb.name}</b><br>Menge: ${betrieb.total_m3a || 0} m³/a`, {
            direction: 'top',
            offset: [0, -10]
        });
        window.activePegelMarkers.addLayer(marker);

        bounds.extend(bLatLng);
    });

    if (typeof map !== 'undefined') {
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }

    // Populate and show side panel
    populatePegelAnalysisPanel(p);
};

window.closePegelAnalysis = function() {
    if (window.activePegelLines) window.activePegelLines.clearLayers();
    if (window.activePegelMarkers) window.activePegelMarkers.clearLayers();

    const panel = document.getElementById('pegel-analysis-panel');
    if (panel) panel.classList.add('hidden');

    // Also toggle the active class on the button if exists
    const btn = document.getElementById('btn-pegel-analysis');
    if (btn) btn.classList.remove('active');
};

function populatePegelAnalysisPanel(p) {
    const panel = document.getElementById('pegel-analysis-panel');
    if (!panel) return;

    panel.classList.remove('hidden');

    // Toggle button state if exists
    const btn = document.getElementById('btn-pegel-analysis');
    if (btn) btn.classList.add('active');

    const pctStr = (p.upstream_mq_pct !== null && p.upstream_mq_pct !== undefined) ? Number(p.upstream_mq_pct).toFixed(2).replace('.', ',') : '0,00';

    let html = `
        <div class="panel-header">
            <h3>🌊 Pegel-Abwasser-Analyse</h3>
            <button class="close-btn" onclick="window.closePegelAnalysis()">✖</button>
        </div>
        <div class="panel-content">
            <h4>Pegel: ${p.name || 'Unbekannt'}</h4>
            <p><strong>Gewässer:</strong> ${p.gewaesser || '-'}</p>
            <p><strong>MQ (Median):</strong> ${p.mq_m3s || '-'} m³/s</p>

            <div class="analysis-stats">
                <div class="stat-box">
                    <span class="stat-value">${pctStr}%</span>
                    <span class="stat-label">Industrieabwasser-Anteil (Vol)</span>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${p.upstream_betriebe_count || 0}</span>
                    <span class="stat-label">Einleiter oberhalb</span>
                </div>
            </div>

            <h5>Angeschlossene Betriebe</h5>
            <ul class="betrieb-list">
    `;

    const betriebe = p.upstream_betriebe || [];
    if (betriebe.length === 0) {
        html += `<li>Keine Betriebe gefunden.</li>`;
    } else {
        betriebe.forEach(b => {
            html += `
                <li>
                    <strong>${b.name}</strong><br>
                    Menge: ${b.total_m3a ? b.total_m3a.toLocaleString('de-DE') + ' m³/a' : 'Keine Mengenangabe'}
                </li>
            `;
        });
    }

    html += `
            </ul>
        </div>
    `;

    panel.innerHTML = html;
}

// Global setup for toggle button
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-pegel-analysis');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const panel = document.getElementById('pegel-analysis-panel');
            if (panel && !panel.classList.contains('hidden')) {
                window.closePegelAnalysis();
            } else {
                // Just opening the panel without a specific pegel selected
                // (or could prompt user to click a pegel)
                if (panel) {
                    panel.innerHTML = `
                        <div class="panel-header">
                            <h3>🌊 Pegel-Abwasser-Analyse</h3>
                            <button class="close-btn" onclick="window.closePegelAnalysis()">✖</button>
                        </div>
                        <div class="panel-content" style="text-align: center; padding: 20px;">
                            <p>Klicken Sie auf einen Pegel-Marker (📏) auf der Karte, um dessen Industrieabwasser-Einzugsgebiet zu analysieren.</p>
                        </div>
                    `;
                    panel.classList.remove('hidden');
                    toggleBtn.classList.add('active');
                }
            }
        });
    }
});
