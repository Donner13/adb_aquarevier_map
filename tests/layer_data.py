"""
Static description of the sidebar layer-toggle buttons on index.html / internal.html.

Both pages render the same 13 map-layer toggles ("Fachdaten & Layer" filter
group) as `<button class="filter-btn" data-layer-name="...">` elements (NOT
`<input type="checkbox">` — Leaflet's own layer control is fed an empty
overlay object, see `L.control.layers(baseMaps, {}, ...)`). Clicking a button
runs the same JS in both files:

    const layer = overlayMaps[name];
    if (map.hasLayer(layer)) { map.removeLayer(layer); map.fire('overlayremove', ...); }
    else { map.addLayer(layer); map.fire('overlayadd', ...); }

This is exactly the code path that broke once before (click handler
silently disconnected by a sidebar refactor, zero console errors). The
lists below were derived by reading both HTML files + js/layers-config.js +
js/layers-loader.js (see PR/session notes) and classifying each layer by
*when* its geojson/tile request actually fires:

- EAGER_LAYERS: geojson is fetch()-ed unconditionally at page load
  (LAYER_CONFIGS non-cluster path, or a bare top-level `fetch(...)` call).
  The toggle button only calls map.addLayer/removeLayer — it does NOT
  trigger a new network request. All 8 of these layers default to ON
  (class="active" in the HTML).
- LAZY_LAYERS: geojson is only fetched the *first* time the layer is
  switched on, inside a `map.on('overlayadd', ...)` handler (or the
  MarkerClusterGroup lazy-load path in layers-loader.js for GWM). These are
  the strongest regression signal for a disconnected click handler, because
  if `map.fire('overlayadd', ...)` never happens, the fetch never happens
  either — no console error, the layer just silently never loads.
- WMS_LAYERS: same lazy-on-first-toggle shape as LAZY_LAYERS, but the
  "network request" is a tile image request to an external WMS endpoint
  instead of a same-origin geojson fetch.

All LAZY_LAYERS + WMS_LAYERS default to OFF (class="filter-btn" with no
"active"), which is also what makes them lazy in the first place.
"""

PAGES = ["index.html", "internal.html"]

# data-layer-name -> geojson filename guaranteed to have been fetch()-ed by
# the time the page reaches networkidle after load, REGARDLESS of the
# layer's on/off toggle state. Two independent code paths cause this:
#   (a) LAYER_CONFIGS non-cluster path / a bare top-level fetch() call —
#       the toggle button here only calls map.addLayer/removeLayer, it does
#       NOT trigger a new network request.
#   (b) buildUnifiedSearchIndex() (index.html / internal.html, "unabhaengige
#       Fetches" for the cross-entity search box) independently fetches a
#       fixed list of geojson files up front to build its search index —
#       this happens to include grundwassermessstellen.geojson even though
#       that layer's *map rendering* is lazy (see GWM note below).
EAGER_LAYERS = {
    "📏 Pegel (ELWAS)": "pegel.geojson",
    "⛰️ Stauanlagen (ELWAS)": "stauanlagen.geojson",
    "🌧️ Regenbecken/-entlastungsanlagen (ELWAS)": "regenbecken.geojson",
    "🧱 Querbauwerke (ELWAS)": "querbauwerke.geojson",
    "Rur Einzugsgebiet (Hydrologisch)": "rur_einzugsgebiet_outline.geojson",
    "Eigene Gewässer mit Namen": "gewaesser_rur_official.geojson",
    "Landkreisgrenzen (Rheinisches Revier)": "untersuchungsgebiet.geojson",
    "Kreisgrenzen (Schwarz gestrichelt)": "kreise_rr.geojson",
    "💧 Grundwassermessstellen (ELWAS, 3700+)": "grundwassermessstellen.geojson",
}

# data-layer-name -> geojson filename fetched lazily on first overlayadd of
# the *map* layer (map.on('overlayadd', ...) in index.html/internal.html).
# Unlike EAGER_LAYERS, no other code path pre-fetches these, so "no request
# yet, then exactly one request right after the toggle click" is a valid,
# tight assertion for a disconnected click handler.
LAZY_LAYERS = {
    "🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser)": "rur_einzugsgebiet_stats.geojson",
    "📊 Kreis-Vergleich (Choroplethenkarte)": "kreise_scorecard.geojson",
    "Wasserschutzgebiete (LANUV)": "wasserschutzgebiete.geojson",
}

# data-layer-name -> URL substring of the WMS tile request fired lazily on
# first overlayadd (cross-origin, intercepted/mocked in tests, see conftest.py)
WMS_LAYERS = {
    "Tagebaue & Bergbaufelder (GD)": "wms_nw_bergbauberechtigungen",
}

# 💧 Grundwassermessstellen: its geojson is fetched eagerly (see EAGER_LAYERS
# above), but the *map* layer (MarkerClusterGroup) only actually gets
# populated with markers the first time it's switched on
# (layers-loader.js: map.on('overlayadd', ...) -> loadClusterLayer()).
# A disconnected click handler for this one specific button would be
# invisible to a "was X fetched" check (it was, for the search index) —
# the only real signal is whether the cluster layer ends up with markers
# in it, checked directly via window.gwmLayer.getLayers().length.
GWM_NAME = "💧 Grundwassermessstellen (ELWAS, 3700+)"
GWM_LAYER_VAR = "gwmLayer"

ALL_LAYERS = {**EAGER_LAYERS, **LAZY_LAYERS, **WMS_LAYERS}
LAZY_OR_WMS = {**LAZY_LAYERS, **WMS_LAYERS}

# names whose button carries class="filter-btn active" in the pristine HTML
DEFAULT_ON = {
    "📏 Pegel (ELWAS)",
    "⛰️ Stauanlagen (ELWAS)",
    "🌧️ Regenbecken/-entlastungsanlagen (ELWAS)",
    "🧱 Querbauwerke (ELWAS)",
    "Rur Einzugsgebiet (Hydrologisch)",
    "Eigene Gewässer mit Namen",
    "Landkreisgrenzen (Rheinisches Revier)",
    "Kreisgrenzen (Schwarz gestrichelt)",
}

assert len(ALL_LAYERS) == 13, "Expected exactly 13 sidebar layer-toggle buttons"
assert DEFAULT_ON <= set(ALL_LAYERS), "DEFAULT_ON contains an unknown layer name"
