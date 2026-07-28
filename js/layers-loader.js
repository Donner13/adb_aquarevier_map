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

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
      key ? `<span class="glossar-icon" data-glossar="${escapeHtml(key)}">i</span>` : '';

    let html = `
      <div class="popup-card">
        <div class="popup-group" style="color:${cfg.color}">${escapeHtml(cfg.groupLabel)}</div>
        <div class="popup-title">${escapeHtml(p.name || 'Unbekannt')}</div>
    `;

    for (const field of (cfg.popupFields || [])) {
      let value;
      if (field.expr) {
        value = field.expr(p);
      } else {
        value = p[field.field];
      }
      if (!value) continue;

      const safeVal = escapeHtml(value);
      // first field (📍) has no label prefix, just the value
      if (field.label === '📍') {
        html += `<div class="popup-detail">📍 ${safeVal}</div>`;
      } else {
        html += `<div class="popup-detail">${escapeHtml(field.label)}${glossarSpan(field.glossar)}: ${safeVal}${escapeHtml(field.suffix || '')}</div>`;
      }
    }

    // Special: Pegel NQ/MQ/HQ row
    if (cfg.pegelStats && p.mq_m3s) {
      html += `<div class="popup-detail">📊 NQ<span class="glossar-icon" data-glossar="NQ">i</span>: ${escapeHtml(p.nq_m3s) || '–'}, MNQ<span class="glossar-icon" data-glossar="MNQ">i</span>: ${escapeHtml(p.mnq_m3s) || '–'}, MQ<span class="glossar-icon" data-glossar="MQ">i</span>: ${escapeHtml(p.mq_m3s)}, HQ<span class="glossar-icon" data-glossar="HQ">i</span>: ${escapeHtml(p.hq_m3s) || '–'} m³/s</div>`;

      // Calculate trend indicators if we have numerical values
      if (p.nq_m3s && p.mnq_m3s) {
          const nqNum = parseFloat(String(p.nq_m3s).replace(',', '.'));
          const mnqNum = parseFloat(String(p.mnq_m3s).replace(',', '.'));

          if (!isNaN(nqNum) && !isNaN(mnqNum)) {
              let trendColor = '#64748b'; // default gray
              let trendText = 'Normal';
              let trendIcon = '🌊';

              if (nqNum < mnqNum * 0.5) {
                  trendColor = '#ef4444'; // red (severe drought indicator)
                  trendText = 'Kritisch (Dürre-Trend)';
                  trendIcon = '⚠️';
              } else if (nqNum < mnqNum) {
                  trendColor = '#f59e0b'; // orange (warning)
                  trendText = 'Niedrig (Beobachtung)';
                  trendIcon = '📉';
              } else if (nqNum > mnqNum * 1.5) {
                  trendColor = '#0ea5e9'; // blue (above average NQ)
                  trendText = 'Entspannt';
                  trendIcon = '📈';
              }

              html += `<div class="popup-detail" style="color: ${trendColor}; font-weight: 500; font-size: 11px; margin-top: 4px; padding: 4px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;">
                  ${trendIcon} Niedrigwasser-Trend: ${escapeHtml(trendText)}
              </div>`;
          }
      }
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
      html += `<div class="popup-detail">🏭 Dieser Pegel führt im Median ${escapeHtml(p.mq_m3s)} m³/s, die oberhalb liegenden Betriebe leiten bis zu ${escapeHtml(pctStr)}% davon als Industrieabwasser ein${escapeHtml(betriebeHinweis)}.</div>`;
      if (p.upstream_betriebe_count > 0) {
        html += `<button class="action-btn" style="margin-top:8px; width:100%;" onclick="if(window.analyzePegel) window.analyzePegel('${escapeHtml(p.pegel_nr)}')">🔍 Industrieabwasser-Einzugsgebiet analysieren</button>`;
      }
    }

    // getZustaendigkeitHtml is a global function defined in index/internal.html
    if (typeof getZustaendigkeitHtml === 'function') {
      html += getZustaendigkeitHtml(p);
    }

    // Pegelonline Live-Dashboard Placeholder
    if (cfg.id === 'pegel') {
      html += `<div class="pegelonline-container" style="margin-top:8px; padding:8px; background:#f0f9ff; border-radius:4px; font-size:12px; border:1px solid #bae6fd;">
        <div style="color:#0284c7; font-weight:bold; margin-bottom:4px;">📡 Live-Daten (PEGELONLINE)</div>
        <div class="pegelonline-content" style="color:#64748b;">Lade Live-Daten...</div>
      </div>`;
    }

    // Feedback Link
    html += `<div style="margin-top: 8px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 6px;">
      <a href="#" onclick="openFeedbackModal('${escapeHtml(p.name || '').replace(/'/g, "\\'")}', '${escapeHtml(cfg.groupLabel)}', '${escapeHtml(p.id || p.anlagen_nr || p.pegel_nr || p.betriebs_nr || p.name || '')}', ${p.lat || p.latitude || 0}, ${p.lng || p.longitude || p.lon || 0}); return false;" style="color: var(--accent-primary, #0ea5e9); text-decoration: none; font-size: 11px; display: flex; align-items: center; gap: 4px;">⚠️ Fehler melden</a>
    </div>`;

    // Footer
    const footer = cfg.footerTemplate
      ? cfg.footerTemplate(p)
      : 'Quelle: ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung 2.0';
    html += `<div style="font-size:10px;color:#94a3b8;margin-top:6px;">${escapeHtml(footer)}</div>`;
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
          if (!window.layerDataStore) window.layerDataStore = {};
          window.layerDataStore[cfg.id] = data;
          if (cfg.id === 'contacts' || cfg.id === 'akteure') window.geojsonData = data;
          window[cfg.geoDataVar] = data;  // backward-compat global
          const markers = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
              const marker = L.marker(latlng, { icon: buildIcon() });
              // Safely extract name from nested blocks like Stammdaten or Lage if they exist
              let extractedName = '';
              if (feature.properties) {
                  extractedName = feature.properties.name || feature.properties.bezeichnung || feature.properties.standort || feature.properties.id || '';
                  if (!extractedName) {
                      if (feature.properties.Stammdaten && (feature.properties.Stammdaten.name || feature.properties.Stammdaten.Name)) {
                          extractedName = feature.properties.Stammdaten.name || feature.properties.Stammdaten.Name;
                      } else if (feature.properties.Lage && (feature.properties.Lage.name || feature.properties.Lage.Name)) {
                          extractedName = feature.properties.Lage.name || feature.properties.Lage.Name;
                      }
                  }
              }
              const nameProp = extractedName;
              const ariaLabel = nameProp ? `${cfg.groupLabel}: ${nameProp}` : `${cfg.groupLabel} Standort`;
              // Try to use the global makeMarkerAccessible if defined
              if (typeof makeMarkerAccessible === 'function') {
                return makeMarkerAccessible(marker, ariaLabel);
              }
              // Inline fallback if not
              marker.on('add', () => {
                  const el = marker.getElement();
                  if (el) {
                      el.setAttribute('role', 'button');
                      el.setAttribute('aria-label', ariaLabel);
                  }
              });
              return marker;
            },
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
  const layerGroup = cfg.defaultOn ? L.layerGroup().addTo(map) : L.layerGroup();
  window[cfg.layerVar] = layerGroup;
  overlayMaps[cfg.overlayLabel] = layerGroup;

  fetch(cfg.file)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
      layerDataStore[cfg.id] = data;
      if (!window.layerDataStore) window.layerDataStore = {};
      window.layerDataStore[cfg.id] = data;
      if (cfg.id === 'contacts' || cfg.id === 'akteure') window.geojsonData = data;
      window[cfg.geoDataVar] = data;  // backward-compat global
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          const marker = L.marker(latlng, { icon: buildIcon() });
          // Safely extract name from nested blocks like Stammdaten or Lage if they exist
          let extractedName = '';
          if (feature.properties) {
              extractedName = feature.properties.name || feature.properties.bezeichnung || feature.properties.standort || feature.properties.id || '';
              if (!extractedName) {
                  if (feature.properties.Stammdaten && (feature.properties.Stammdaten.name || feature.properties.Stammdaten.Name)) {
                      extractedName = feature.properties.Stammdaten.name || feature.properties.Stammdaten.Name;
                  } else if (feature.properties.Lage && (feature.properties.Lage.name || feature.properties.Lage.Name)) {
                      extractedName = feature.properties.Lage.name || feature.properties.Lage.Name;
                  }
              }
          }
          const nameProp = extractedName;
          const ariaLabel = nameProp ? `${cfg.groupLabel}: ${nameProp}` : `${cfg.groupLabel} Standort`;
          if (typeof makeMarkerAccessible === 'function') {
            return makeMarkerAccessible(marker, ariaLabel);
          }
          marker.on('add', () => {
              const el = marker.getElement();
              if (el) {
                  el.setAttribute('role', 'button');
                  el.setAttribute('aria-label', ariaLabel);
              }
          });
          return marker;
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(buildPopupHtml(feature.properties));
          if (cfg.pegelStats) {
            layer.on('click', () => {
              if (window.analyzePegel) window.analyzePegel(feature.properties.pegel_nr);
            });
          }
        }
      }).addTo(layerGroup);
    })
    .catch(err => console.log(`${cfg.id} layer not loaded:`, err));
}
