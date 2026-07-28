'use strict';
/**
 * Static description of the sidebar layer-toggle buttons on index.html /
 * internal.html. Ported from tests/layer_data.py (the Python suite this
 * replaces) - see that file's history / backlog #8 for how the
 * EAGER/LAZY/WMS classification was derived (by reading index.html,
 * js/layers-config.js and js/layers-loader.js).
 *
 * Both pages render the same 13 map-layer toggles ("Fachdaten & Layer"
 * filter group) as `<button class="filter-btn" data-layer-name="...">`
 * elements. Clicking one runs:
 *
 *   const layer = overlayMaps[name];
 *   if (map.hasLayer(layer)) { map.removeLayer(layer); map.fire('overlayremove', ...); }
 *   else { map.addLayer(layer); map.fire('overlayadd', ...); }
 *
 * This is exactly the code path that broke once before (commit 5a91acb,
 * 16.07.2026: sidebar refactor silently disconnected the click handlers,
 * zero console errors).
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const PAGES = ['index.html', 'internal.html'];

// geojson fetched unconditionally at page load; the toggle button only
// calls map.addLayer/removeLayer, no new network request on click.
const EAGER_LAYERS = {
  '📏 Pegel (ELWAS)': 'pegel.geojson',
  '⛰️ Stauanlagen (ELWAS)': 'stauanlagen.geojson',
  '🌧️ Regenbecken/-entlastungsanlagen (ELWAS)': 'regenbecken.geojson',
  '🧱 Querbauwerke (ELWAS)': 'querbauwerke.geojson',
  'Rur Einzugsgebiet (Hydrologisch)': 'rur_einzugsgebiet_outline.geojson',
  'Eigene Gewässer mit Namen': 'gewaesser_rur_official.geojson',
  'Landkreisgrenzen (Rheinisches Revier)': 'untersuchungsgebiet.geojson',
  'Kreisgrenzen (Schwarz gestrichelt)': 'kreise_rr.geojson',
  // fetched eagerly for the cross-entity search index (buildUnifiedSearchIndex),
  // even though the *map rendering* of this one is lazy - see GWM_NAME below.
  '💧 Grundwassermessstellen (ELWAS, 3700+)': 'grundwassermessstellen.geojson',
  '⚡ H₂-Elektrolyseure NRW': 'h2_elektrolyseure_nrw.geojson',
};

// geojson fetched only the first time the layer is switched on
// (map.on('overlayadd', ...) in index.html/internal.html).
const LAZY_LAYERS = {
  '🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser)': 'rur_einzugsgebiet_stats.geojson',
  '📊 Kreis-Vergleich (Choroplethenkarte)': 'kreise_scorecard.geojson',
  'Wasserschutzgebiete (LANUV)': 'wasserschutzgebiete.geojson',
  'Wassergewinnungsgebiete (Zone I)': 'wasserschutzgebiete.geojson',
  '📈 Grundwasserwiederanstieg (Modell)': 'grundwasserwiederanstieg.geojson',
};

// same lazy-on-first-toggle shape, but an external WMS tile request
// instead of a same-origin geojson fetch (mocked in fixtures.js).
const WMS_LAYERS = {
  'Tagebaue & Bergbaufelder (GD)': 'wms/bebu',
  'HQ häufig (LANUV)': 'Tiefen_Ueberflutungsgebiet_nw',
  'HQ100 (LANUV)': 'Tiefen_Ueberflutungsgebiet_mw',
  'HQ extrem (LANUV)': 'Tiefen_Ueberflutungsgebiet_hw',
  'Starkregen Euskirchen': 'L_T100_v1.1_depth3857',
};

// #hazard-layer-group (the 4 LANUV/Starkregen layers) is deliberately
// excluded from the #btn-layers-all / #btn-layers-none bulk-toggle handlers
// in index.html/internal.html (see the `!b.closest('#hazard-layer-group')`
// filter there) - these are heavy external WMS overlays meant to be
// switched on individually, not swept in with everything else.
const HAZARD_LAYERS = {
  'HQ häufig (LANUV)': true,
  'HQ100 (LANUV)': true,
  'HQ extrem (LANUV)': true,
  'Starkregen Euskirchen': true,
};

// Grundwassermessstellen: geojson is fetched eagerly (search index), but the
// MarkerClusterGroup only gets populated with markers the first time it's
// switched on (js/layers-loader.js: map.on('overlayadd', ...) -> loadClusterLayer()).
// A disconnected click handler here is invisible to "was X fetched" - the
// only real signal is window.gwmLayer.getLayers().length.
const GWM_NAME = '💧 Grundwassermessstellen (ELWAS, 3700+)';
const GWM_LAYER_VAR = 'gwmLayer';

const ALL_LAYERS = { ...EAGER_LAYERS, ...LAZY_LAYERS, ...WMS_LAYERS };
const LAZY_OR_WMS = { ...LAZY_LAYERS, ...WMS_LAYERS };
const BULK_TOGGLE_LAYERS = Object.fromEntries(
  Object.entries(ALL_LAYERS).filter(([name]) => !(name in HAZARD_LAYERS))
);

// class="filter-btn active" in the pristine HTML
const DEFAULT_ON = new Set([
  '📏 Pegel (ELWAS)',
  '⛰️ Stauanlagen (ELWAS)',
  '🌧️ Regenbecken/-entlastungsanlagen (ELWAS)',
  '🧱 Querbauwerke (ELWAS)',
  'Rur Einzugsgebiet (Hydrologisch)',
  'Eigene Gewässer mit Namen',
  'Landkreisgrenzen (Rheinisches Revier)',
  'Kreisgrenzen (Schwarz gestrichelt)',
]);

// The two layers hit by the 15.07.2026 data-corruption postmortem
// (Stauanlagen, Regenbecken) plus the most prominent lazy layer (GWM) get a
// hard numeric assert: counter-badge total must equal the real feature
// count read live from the corresponding .geojson file - never hardcoded
// (backlog #8 explicitly warns the counts drift on every re-scrape).
const MANDATORY_COUNT_LAYERS = {
  '💧 Grundwassermessstellen (ELWAS, 3700+)': 'grundwassermessstellen.geojson',
  '⛰️ Stauanlagen (ELWAS)': 'stauanlagen.geojson',
  '🌧️ Regenbecken/-entlastungsanlagen (ELWAS)': 'regenbecken.geojson',
};

function realFeatureCount(geojsonFile) {
  const raw = fs.readFileSync(path.join(REPO_ROOT, geojsonFile), 'utf8');
  return JSON.parse(raw).features.length;
}

if (Object.keys(ALL_LAYERS).length !== 20) {
  throw new Error(`Expected exactly 20 sidebar layer-toggle buttons, got ${Object.keys(ALL_LAYERS).length}`);
}
for (const name of DEFAULT_ON) {
  if (!(name in ALL_LAYERS)) throw new Error(`DEFAULT_ON contains an unknown layer name: ${name}`);
}

module.exports = {
  REPO_ROOT,
  PAGES,
  EAGER_LAYERS,
  LAZY_LAYERS,
  WMS_LAYERS,
  ALL_LAYERS,
  LAZY_OR_WMS,
  HAZARD_LAYERS,
  BULK_TOGGLE_LAYERS,
  DEFAULT_ON,
  GWM_NAME,
  GWM_LAYER_VAR,
  MANDATORY_COUNT_LAYERS,
  realFeatureCount,
};
