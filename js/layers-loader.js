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
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Baut den Popup-HTML-String aus cfg.popupFields */
window.buildFeaturePopupHtml = function(p, layerId) {
  const cfg = (window.LAYER_ID_TO_CONFIG && window.LAYER_ID_TO_CONFIG[layerId]) ? window.LAYER_ID_TO_CONFIG[layerId] : null;
  if (!cfg) return "";

  const glossarSpan = (key) =>
    key ? `<span class="glossar-icon" data-glossar="${escapeHtml(key)}">i</span>` : '';

  const tLabel = (s) => window.AQUAREVIER_I18N ? window.AQUAREVIER_I18N.translatePopupLabel(s) : s;

  let html = `
    <div class="popup-card">
      <div class="popup-group" style="color:${cfg.color}">${escapeHtml(tLabel(cfg.groupLabel))}</div>
      <div class="popup-title">${escapeHtml(p.name || 'Unbekannt')}</div>
  `;

  for (const field of (cfg.popupFields || [])) {
    let value;
    if (field.expr) {
      value = field.expr(p);
    } else {
      value = p[field.field];
    }
    if (!value || String(value).trim() === '' || String(value).toLowerCase() === 'null' || String(value).toLowerCase() === 'undefined') continue;

    const safeVal = escapeHtml(value);
    if (field.label === '📍') {
      html += `<div class="popup-detail">📍 ${safeVal}</div>`;
    } else {
      html += `<div class="popup-detail">${escapeHtml(tLabel(field.label))}${glossarSpan(field.glossar)}: ${safeVal}${escapeHtml(field.suffix || '')}</div>`;
    }
  }

  if (cfg.pegelStats && p.mq_m3s) {
    html += `<div class="popup-detail">📊 NQ<span class="glossar-icon" data-glossar="NQ">i</span>: ${escapeHtml(p.nq_m3s) || '–'}, MNQ<span class="glossar-icon" data-glossar="MNQ">i</span>: ${escapeHtml(p.mnq_m3s) || '–'}, MQ<span class="glossar-icon" data-glossar="MQ">i</span>: ${escapeHtml(p.mq_m3s)}, HQ<span class="glossar-icon" data-glossar="HQ">i</span>: ${escapeHtml(p.hq_m3s) || '–'} m³/s</div>`;

    if (p.nq_m3s && p.mnq_m3s) {
        const nqNum = parseFloat(String(p.nq_m3s).replace(',', '.'));
        const mnqNum = parseFloat(String(p.mnq_m3s).replace(',', '.'));

        if (!isNaN(nqNum) && !isNaN(mnqNum)) {
            let trendColor = '#64748b';
            let trendText = 'Normal';
            let trendIcon = '🌊';

            if (nqNum < mnqNum * 0.5) {
                trendColor = '#ef4444';
                trendText = 'Kritisch (Dürre-Trend)';
                trendIcon = '⚠️';
            } else if (nqNum < mnqNum) {
                trendColor = '#f59e0b';
                trendText = 'Niedrig (Beobachtung)';
                trendIcon = '📉';
            } else if (nqNum > mnqNum * 1.5) {
                trendColor = '#0ea5e9';
                trendText = 'Entspannt';
                trendIcon = '📈';
            }

            html += `<div class="popup-detail" style="color: ${trendColor}; font-weight: 500; font-size: 0.6875rem; margin-top: 4px; padding: 4px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;">
                ${trendIcon} Niedrigwasser-Status: ${escapeHtml(trendText)}
            </div>`;
        }
    }
  }

  if (cfg.pegelStats && p.mq_m3s && p.upstream_data_available && p.upstream_mq_pct !== null && p.upstream_mq_pct !== undefined) {
    const pctStr = Number(p.upstream_mq_pct).toFixed(2).replace('.', ',');
    const betriebeHinweis = p.upstream_betriebe_mit_wert > 0
      ? ` (${p.upstream_betriebe_mit_wert} Betrieb(e) mit Mengenangabe oberhalb)`
      : ' (keine quantifizierten Industrieeinleiter oberhalb gefunden)';
    html += `<div class="popup-detail">🏭 Dieser Pegel führt im Median ${escapeHtml(p.mq_m3s)} m³/s, die oberhalb liegenden Betriebe leiten bis zu ${escapeHtml(pctStr)}% davon als Industrieabwasser ein${escapeHtml(betriebeHinweis)}.</div>`;
    if (p.upstream_betriebe_count > 0) {
      html += `<button class="action-btn" style="margin-top:8px; width:100%;" onclick="if(window.analyzePegel) window.analyzePegel('${escapeHtml(p.pegel_nr)}')">🔍 Industrieabwasser-Einzugsgebiet analysieren</button>`;
    }
  }

  if (typeof getZustaendigkeitHtml === 'function') {
    html += getZustaendigkeitHtml(p);
  }

  if (cfg.id === 'pegel') {
    html += `<div class="pegelonline-container" style="margin-top:8px; padding:8px; background:#f0f9ff; border-radius:4px; font-size: 0.75rem; border:1px solid #bae6fd;">
      <div style="color:#0284c7; font-weight:bold; margin-bottom:4px;">📡 Live-Daten (PEGELONLINE)</div>
      <div class="pegelonline-content" style="color:#64748b;">Lade Live-Daten...</div>
    </div>`;
  }

  html += `<div style="margin-top: 8px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 6px;">
    <button type="button" onclick="openFeedbackModal('${escapeHtml(p.name || '').replace(/'/g, "\\'")}', '${escapeHtml(cfg.groupLabel)}', '${escapeHtml(p.id || p.anlagen_nr || p.pegel_nr || p.betriebs_nr || p.name || '')}', ${p.lat || p.latitude || 0}, ${p.lng || p.longitude || p.lon || 0})" style="background:transparent; border:none; padding:0; color: var(--accent-primary, #0ea5e9); text-decoration: underline; font-size: 0.6875rem; display: flex; align-items: center; gap: 4px; cursor: pointer;">⚠️ Fehler melden</button>
  </div>`;

  const footer = cfg.footerTemplate
    ? cfg.footerTemplate(p)
    : 'Quelle: ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung 2.0';
  html += `<div style="font-size: 0.625rem;color:#475569;margin-top:6px;">${escapeHtml(footer)}</div>`;
  html += `</div>`;
  return html;
};

function addGeoLayer(cfg, map, overlayMaps, layerDataStore) {
  const size = cfg.cluster ? 10 : 22;

  if (!window.LAYER_ID_TO_CONFIG) window.LAYER_ID_TO_CONFIG = {};
  window.LAYER_ID_TO_CONFIG[cfg.id] = cfg;

  function buildIcon() {
    if (cfg.cluster) {
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
        font-size: 0.75rem;
        box-shadow:0 0 6px ${cfg.color},0 0 2px rgba(0,0,0,0.5);
      ">${cfg.icon}</div>`,
      className: cfg.className,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  if (!window.layerLoaders) window.layerLoaders = {};

  if (cfg.geometryType === 'polyline') {
    const layerGroup = cfg.defaultOn ? L.layerGroup().addTo(map) : L.layerGroup();
    window[cfg.layerVar] = layerGroup;
    overlayMaps[cfg.overlayLabel] = layerGroup;

    let loadedPoly = false;
    function loadPolyLayer() {
      if (loadedPoly) return Promise.resolve(window.layerDataStore[cfg.id]);
      loadedPoly = true;
      return fetch(cfg.file)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          layerDataStore[cfg.id] = data;
          window[cfg.geoDataVar] = data;

          const geoLayer = L.geoJSON(data, {
            style: (feature) => {
              const style = { weight: cfg.styleConfig.weight || 3, opacity: cfg.styleConfig.opacity || 0.8, color: '#94a3b8' };
              if (cfg.styleConfig.colorMap && cfg.styleConfig.colorField) {
                const val = feature.properties[cfg.styleConfig.colorField];
                style.color = cfg.styleConfig.colorMap[val] || style.color;
              }
              return style;
            },
            onEachFeature: (feature, layer) => {
              if (feature && feature.properties) {
                const p = feature.properties;
                const tooltipHtml = `<strong>${escapeHtml(p.name || 'Unbekannt')}</strong>`;
                layer.bindTooltip(tooltipHtml, { sticky: true });
                layer.bindPopup(window.buildFeaturePopupHtml(p, cfg.id));
              }
            }
          });
          geoLayer.addTo(layerGroup);
          if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
          window.dispatchEvent(new CustomEvent('aquarevier:layer-loaded', { detail: { id: cfg.id } }));
          return data;
        })
        .catch(err => {
            console.error(`[addGeoLayer] Polyline "${cfg.id}" load error:`, err);
            loadedPoly = false;
            throw err;
        });
    }

    window.layerLoaders[cfg.id] = loadPolyLayer;
    map.on('overlayadd', (e) => { if (e.layer === layerGroup) loadPolyLayer(); });
    if (cfg.defaultOn) loadPolyLayer();
    return;
  }

  if (cfg.cluster) {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 13,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const dim = count >= 100 ? 44 : (count >= 10 ? 38 : 32);
        return L.divIcon({
          html: `<div style="width:${dim}px;height:${dim}px;line-height:${dim}px;background:rgba(86,180,233,0.855);border:2px solid #fff;border-radius:50%;color:#fff;font-weight:600;text-align:center;font-size: 0.75rem;box-shadow:0 0 6px rgba(0,0,0,0.5);">${count}</div>`,
          className: 'gwm-cluster-icon',
          iconSize: L.point(dim, dim)
        });
      }
    });

    window[cfg.layerVar] = clusterGroup;
    overlayMaps[cfg.overlayLabel] = clusterGroup;

    let loaded = false;
    function loadClusterLayer() {
      if (loaded) return Promise.resolve(window.layerDataStore[cfg.id]);
      loaded = true;
      return fetch(cfg.file)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          layerDataStore[cfg.id] = data;
          window[cfg.geoDataVar] = data;
          const markers = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: buildIcon() }),
            onEachFeature: (feature, layer) => layer.bindPopup(window.buildFeaturePopupHtml(feature.properties, cfg.id))
          });
          clusterGroup.addLayers(markers.getLayers());
          if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
          window.dispatchEvent(new CustomEvent('aquarevier:layer-loaded', { detail: { id: cfg.id } }));
          return data;
        });
    }
    window.layerLoaders[cfg.id] = loadClusterLayer;
    map.on('overlayadd', (e) => { if (e.layer === clusterGroup) loadClusterLayer(); });
    return;
  }

  const layerGroup = cfg.defaultOn ? L.layerGroup().addTo(map) : L.layerGroup();
  window[cfg.layerVar] = layerGroup;
  overlayMaps[cfg.overlayLabel] = layerGroup;

  let loadedStandard = false;
  function loadStandardLayer() {
    if (loadedStandard) return Promise.resolve(window.layerDataStore[cfg.id]);
    loadedStandard = true;
    return fetch(cfg.file)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        layerDataStore[cfg.id] = data;
        window[cfg.geoDataVar] = data;
        const geoLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => L.marker(latlng, { icon: buildIcon() }),
          onEachFeature: (feature, layer) => {
            layer.bindPopup(window.buildFeaturePopupHtml(feature.properties, cfg.id));
            if (cfg.pegelStats && window.analyzePegel) {
              layer.on('click', () => window.analyzePegel(feature.properties.pegel_nr));
            }
          }
        });
        geoLayer.eachLayer(l => layerGroup.addLayer(l));
        if (typeof updateSidebarCounters === 'function') updateSidebarCounters();
        window.dispatchEvent(new CustomEvent('aquarevier:layer-loaded', { detail: { id: cfg.id } }));
        return data;
      });
  }
  window.layerLoaders[cfg.id] = loadStandardLayer;
  loadStandardLayer();
}
