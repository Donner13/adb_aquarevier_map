/**
 * js/layers-loader.js
 * Generischer Layer-Builder für alle ELWAS-Punkt-Layer.
 *
 * Erwartet: LAYER_CONFIGS (aus layers-config.js), Leaflet (L), map,
 *           getZustaendigkeitHtml() (inline in index/internal.html).
 *
 * Aufruf: addGeoLayer(cfg, map, overlayMaps, layerDataStore)
 *   - cfg: ein Eintrag aus LAYER_CONFIGS
 *   - map: die Leaflet-Karte
 *   - overlayMaps: das Objekt, das L.control.layers() befüllt
 *   - layerDataStore: {} – wird mit cfg.id → GeoJSON-Daten befüllt
 *                     (für updateSidebarCounters)
 *
 * Globale Variablen: Jeder Layer wird zusätzlich als window[cfg.layerVar]
 *   exposiert, damit bestehende Referenzen (search, events) weiter funktionieren.
 */

function addGeoLayer(cfg, map, overlayMaps, layerDataStore) {
  const size = cfg.cluster ? 10 : 22;

  /** Baut das divIcon für normale (nicht-Cluster) Marker */
  function buildIcon() {
    if (cfg.cluster) {
      // GWM: kleiner Punkt, wird per MarkerClusterGroup geclustert
      return L.divIcon({
        html: `<div style="width:10px;height:10px;background:${cfg.color};border:1px solid #fff;border-radius:50%;box-shadow:0 0 3px rgba(0,0,0,0.5);"></div>`,
        className: cfg.className,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });
    }
    return L.divIcon({
      html: `<div style="
        width:${size}px;height:${size}px;
        background-color:${cfg.color};
        border:2px solid #fff;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:12px;
        box-shadow:0 0 6px ${cfg.color},0 0 2px rgba(0,0,0,0.5);
      ">${cfg.icon}</div>`,
      className: cfg.className,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  /** Baut den Popup-HTML-String aus cfg.popupFields */
  function buildPopupHtml(p) {
    const glossarSpan = (key) =>
      key ? `<span class="glossar-icon" data-glossar="${key}">i</span>` : '';

    let html = `
      <div class="popup-card">
        <div class="popup-group" style="color:${cfg.color}">${cfg.groupLabel}</div>
        <div class="popup-title">${p.name || 'Unbekannt'}</div>
    `;

    for (const field of (cfg.popupFields || [])) {
      let value;
      if (field.expr) {
        value = field.expr(p);
      } else {
        value = p[field.field];
      }
      if (!value) continue;

      // first field (📍) has no label prefix, just the value
      if (field.label === '📍') {
        html += `<div class="popup-detail">📍 ${value}</div>`;
      } else {
        html += `<div class="popup-detail">${field.label}${glossarSpan(field.glossar)}: ${value}${field.suffix || ''}</div>`;
      }
    }

    // Special: Pegel NQ/MQ/HQ row
    if (cfg.pegelStats && p.mq_m3s) {
      html += `<div class="popup-detail">📊 NQ<span class="glossar-icon" data-glossar="NQ">i</span>: ${p.nq_m3s || '–'}, MQ<span class="glossar-icon" data-glossar="MQ">i</span>: ${p.mq_m3s}, HQ<span class="glossar-icon" data-glossar="HQ">i</span>: ${p.hq_m3s || '–'} m³/s</div>`;
    }

    // Special: Pegel <-> Industrieeinleiter-Korrelation (siehe
    // elwas_raw_data/build_pegel_correlation.py für Methodik/Limitierungen).
    // upstream_mq_pct kann ein echtes 0 sein (kein fabricated Wert) -- daher
    // explizit auf null/undefined prüfen, nicht auf Falsy.
    if (cfg.pegelStats && p.mq_m3s && p.upstream_data_available && p.upstream_mq_pct !== null && p.upstream_mq_pct !== undefined) {
      const pctStr = Number(p.upstream_mq_pct).toFixed(2).replace('.', ',');
      const betriebeHinweis = p.upstream_betriebe_mit_wert > 0
        ? ` (${p.upstream_betriebe_mit_wert} Betrieb(e) mit Mengenangabe oberhalb)`
        : ' (keine quantifizierten Industrieeinleiter oberhalb gefunden)';
      html += `<div class="popup-detail">🏭 Dieser Pegel führt im Median ${p.mq_m3s} m³/s, die oberhalb liegenden Betriebe leiten bis zu ${pctStr}% davon als Industrieabwasser ein${betriebeHinweis}.</div>`;
    }

    // getZustaendigkeitHtml is a global function defined in index/internal.html
    if (typeof getZustaendigkeitHtml === 'function') {
      html += getZustaendigkeitHtml(p);
    }

    // Footer
    const footer = cfg.footerTemplate
      ? cfg.footerTemplate(p)
      : 'Quelle: ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung 2.0';
    html += `<div style="font-size:10px;color:#94a3b8;margin-top:6px;">${footer}</div>`;
    html += `</div>`;
    return html;
  }

  // --- GWM special case: MarkerClusterGroup with lazy-loading ---
  if (cfg.cluster) {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        const dim = count >= 100 ? 44 : (count >= 10 ? 38 : 32);
        return L.divIcon({
          html: `<div style="width:${dim}px;height:${dim}px;line-height:${dim}px;background:rgba(86,180,233,0.855);border:2px solid #fff;border-radius:50%;color:#fff;font-weight:600;text-align:center;font-size:12px;box-shadow:0 0 6px rgba(0,0,0,0.5);">${count}</div>`,
          className: 'gwm-cluster-icon',
          iconSize: L.point(dim, dim)
        });
      }
    });

    window[cfg.layerVar] = clusterGroup;
    overlayMaps[cfg.overlayLabel] = clusterGroup;

    let loaded = false;
    function loadClusterLayer() {
      if (loaded) return;
      loaded = true;
      fetch(cfg.file)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          layerDataStore[cfg.id] = data;
          window[cfg.geoDataVar] = data;  // backward-compat global
          const markers = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: buildIcon() }),
            onEachFeature: (feature, layer) => layer.bindPopup(buildPopupHtml(feature.properties))
          });
          // Add individual markers (not the FeatureGroup) to cluster
          clusterGroup.addLayers(markers.getLayers());
          // Counter badge must reflect real feature count once the lazy
          // cluster load resolves - see updateSidebarCounters() in
          // index.html/internal.html; layers-loader.js is shared, hence
          // the defensive typeof guard (same pattern as getZustaendigkeitHtml above).
          if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
        })
        .catch(err => console.log(`${cfg.id} layer not loaded:`, err));
    }

    map.on('overlayadd', function(e) {
      if (e.layer === clusterGroup) loadClusterLayer();
    });

    return; // done for cluster layer
  }

  // --- Standard point layer ---
  const layerGroup = L.layerGroup().addTo(map);
  window[cfg.layerVar] = layerGroup;
  overlayMaps[cfg.overlayLabel] = layerGroup;

  fetch(cfg.file)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      layerDataStore[cfg.id] = data;
      window[cfg.geoDataVar] = data;  // backward-compat global
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: buildIcon() }),
        onEachFeature: (feature, layer) => layer.bindPopup(buildPopupHtml(feature.properties))
      }).addTo(layerGroup);
    })
    .catch(err => console.log(`${cfg.id} layer not loaded:`, err));
}
