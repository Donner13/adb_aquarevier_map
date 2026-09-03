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
    if (typeof map === 'undefined' || !window.layerDataStore || !window.layerDataStore['pegel']) return;

    const pegelData = window.layerDataStore['pegel'];
    const p = (pegelData.features || []).map(f => f.properties).find(props => props.pegel_nr === pegelNr);
    if (!p) return;

    if (!window.activePegelLines) window.activePegelLines = L.layerGroup().addTo(map);
    if (!window.activePegelMarkers) window.activePegelMarkers = L.layerGroup().addTo(map);

    window.activePegelLines.clearLayers();
    window.activePegelMarkers.clearLayers();

    // [AQ-121] Validate coordinates
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) {
        console.error("Invalid pegel coordinates", p);
        return;
    }

    const pLatLng = [p.lat, p.lng];
    const bounds = L.latLngBounds([pLatLng]);

    const betriebe = p.upstream_betriebe || [];
    betriebe.forEach(betrieb => {
        if (!Number.isFinite(betrieb.lat) || !Number.isFinite(betrieb.lng)) return; // [AQ-121]

        const bLatLng = [betrieb.lat, betrieb.lng];

        const line = L.polyline([pLatLng, bLatLng], {
            color: '#D55E00',
            weight: 2,
            dashArray: '5, 5',
            className: 'pegel-analysis-line',
            opacity: 0.8
        });
        window.activePegelLines.addLayer(line);

        const safeName = escapeHtml(betrieb.name);
        const safeMenge = escapeHtml(betrieb.total_m3a || 0);

        const marker = L.circleMarker(bLatLng, {
            radius: 8,
            fillColor: '#FFD700',
            color: '#D55E00',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'pegel-analysis-marker'
        }).bindTooltip(`<b>${safeName}</b><br>Menge: ${safeMenge} m³/a`, {
            direction: 'top',
            offset: [0, -10]
        });
        window.activePegelMarkers.addLayer(marker);

        bounds.extend(bLatLng);
    });

    if (typeof map !== 'undefined') {
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 }) : map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }

    populatePegelAnalysisPanel(p);
};

window.closePegelAnalysis = function() {
    if (window.activePegelLines) window.activePegelLines.clearLayers();
    if (window.activePegelMarkers) window.activePegelMarkers.clearLayers();

    const panel = document.getElementById('pegel-analysis-panel');
    if (panel) panel.classList.add('hidden');

    const btn = document.getElementById('btn-pegel-analysis');
    if (btn) btn.classList.remove('active');
};

function populatePegelAnalysisPanel(p) {
    const panel = document.getElementById('pegel-analysis-panel');
    if (!panel) return;

    panel.classList.remove('hidden');

    const btn = document.getElementById('btn-pegel-analysis');
    if (btn) btn.classList.add('active');

    // [AQ-122] Safe numeric parsing to avoid NaN
    const rawPct = parseFloat(String(p.upstream_mq_pct || '0').replace(',', '.'));
    const pctStr = (!isNaN(rawPct) ? rawPct.toFixed(2) : '0,00').replace('.', ',');

    let html = `
        <div class="panel-header">
            <h2>🌊 Pegel-Abwasser-Analyse</h2>
            <button class="close-btn" onclick="window.closePegelAnalysis()" aria-label="Schließen">✖</button>
        </div>
        <div class="panel-content">
            <h3>Pegel: ${escapeHtml(p.name || 'Unbekannt')}</h3>
            <p><strong>Gewässer:</strong> ${escapeHtml(p.gewaesser || '-')}</p>
            <p><strong>MQ (Median):</strong> ${escapeHtml(p.mq_m3s || '-')} m³/s</p>

            <div class="analysis-stats">
                <div class="stat-box">
                    <span class="stat-value">${escapeHtml(pctStr)}%</span>
                    <span class="stat-label">Abwasser-Anteil (Räumlich berechnet)</span>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${escapeHtml(p.upstream_betriebe_count || 0)}</span>
                    <span class="stat-label">Einleiter im Einzugsgebiet</span>
                </div>
            </div>
            <p style="font-size: 10px; color: var(--text-secondary); margin-top: 8px; line-height: 1.2;">
                ℹ️ Hinweis: Dies ist eine räumliche Upstream-Analyse basierend auf genehmigten Mengen. Es handelt sich nicht um eine chemische Echtzeit-Messung.
            </p>

            <h4>Angeschlossene Betriebe</h4>
            <ul class="betrieb-list">
    `;

    const betriebe = p.upstream_betriebe || [];
    if (betriebe.length === 0) {
        html += `<li>Keine Betriebe gefunden.</li>`;
    } else {
        betriebe.forEach(b => {
            html += `
                <li>
                    <strong>${escapeHtml(b.name)}</strong><br>
                    Menge: ${b.total_m3a ? escapeHtml(b.total_m3a.toLocaleString('de-DE')) + ' m³/a' : 'Keine Mengenangabe'}
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
                            <h2>🌊 Pegel-Abwasser-Analyse</h2>
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
