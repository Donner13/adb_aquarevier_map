/**
 * js/layers-config.js
 * Config-Array für alle 6 ELWAS-Punkt-Layer.
 * Jeder Eintrag beschreibt genau einen Layer: Datei, Farbe, Icon,
 * Label, ob defaultOn, ob GWM-Cluster-Spezialfall, Popup-Template.
 *
 * Scope (v1): nur farbige divIcon-Kreis-Layer mit popup-card.
 * Polygon/Polyline-Layer, elwasLayer, catchmentStats bleiben unberührt.
 */

const LAYER_CONFIGS = [
  {
    id: 'klaeranlagen',
    file: 'klaeranlagen.geojson',
    name: 'Kläranlagen (ELWAS)',
    overlayLabel: '🚰 Kläranlagen (ELWAS)',
    icon: '🚰',
    color: '#0072B2',
    className: 'klaeranlage-marker',
    groupLabel: 'Kläranlage',
    defaultOn: true,
    cluster: false,
    // windowGlobal: name of the global variable to assign geoData to (for sidebar counters)
    geoDataVar: 'klaeranlagenGeoData',
    // layerVar: name of window-level layer variable
    layerVar: 'klaeranlagenLayer',
    popupFields: [
      { label: '📍', expr: p => [p.gemeinde, p.kreis].filter(Boolean).join(', ') },
      { label: '🏢 Betreiber', glossar: 'BETREIBER', field: 'betreiber' },
      { label: '🌊 Einleitung in', glossar: 'GEWAESSER_EINLEITUNG', field: 'gewaesser' },
      { label: '📊 Ausbaugröße', glossar: 'AUSBAUGROESSE_EW', field: 'ausbaugroesse_ew', suffix: ' EW' }
    ]
  },
  {
    id: 'grundwassermessstellen',
    file: 'grundwassermessstellen.geojson',
    name: 'Grundwassermessstellen (ELWAS, 3700+)',
    overlayLabel: '💧 Grundwassermessstellen (ELWAS, 3700+)',
    icon: null, // special small dot marker
    color: '#56B4E9',
    className: 'gwm-marker',
    groupLabel: 'Grundwassermessstelle',
    defaultOn: false,
    cluster: true,  // uses MarkerClusterGroup + lazy-loading
    geoDataVar: 'gwmGeoData',
    layerVar: 'gwmLayer',
    popupFields: [
      { label: '📍', expr: p => [p.gemeinde, p.kreis].filter(Boolean).join(', ') },
      { label: '🏢 Eigentümer', field: 'eigentuemer' },
      { label: '🔧 Art', glossar: 'MESSSTELLENART', field: 'messstellenart' }
    ],
    footerTemplate: p => `Koordinaten ${p.genauigkeit || ''}. Quelle: ELWAS-WEB (Land NRW)`
  },
  {
    id: 'pegel',
    file: 'pegel.geojson',
    name: 'Pegel (ELWAS)',
    overlayLabel: '📏 Pegel (ELWAS)',
    icon: '📏',
    color: '#009E73',
    className: 'pegel-marker',
    groupLabel: 'Pegel',
    defaultOn: true,
    cluster: false,
    geoDataVar: 'pegelGeoData',
    layerVar: 'pegelLayer',
    popupFields: [
      { label: '📍', field: 'kreis' },
      { label: '🌊 Gewässer', glossar: 'GEWAESSER_EINLEITUNG', field: 'gewaesser' },
      { label: '📐 Einzugsgebiet', glossar: 'EINZUGSGEBIET', field: 'einzugsgebiet_km2', suffix: ' km²' }
    ],
    // special: NQ/MQ/HQ row – handled by customPopup flag in loader
    pegelStats: true
  },
  {
    id: 'stauanlagen',
    file: 'stauanlagen.geojson',
    name: 'Stauanlagen (ELWAS)',
    overlayLabel: '⛰️ Stauanlagen (ELWAS)',
    icon: '⛰️',
    color: '#D55E00',
    className: 'stauanlage-marker',
    groupLabel: 'Stauanlage',
    defaultOn: true,
    cluster: false,
    geoDataVar: 'stauanlagenGeoData',
    layerVar: 'stauanlagenLayer',
    popupFields: [
      { label: '📍', field: 'kreis' },
      { label: '🏢 Betreiber', glossar: 'BETREIBER', field: 'betreiber' },
      { label: '🌊 Gewässer', glossar: 'GEWAESSER_EINLEITUNG', field: 'gewaesser' },
      { label: '🔧 Typ', field: 'typ' }
    ]
  },
  {
    id: 'regenbecken',
    file: 'regenbecken.geojson',
    name: 'Regenbecken/-entlastungsanlagen (ELWAS)',
    overlayLabel: '🌧️ Regenbecken/-entlastungsanlagen (ELWAS)',
    icon: '🌧️',
    color: '#CC79A7',
    className: 'regenbecken-marker',
    groupLabel: 'Regenbecken / Sonderbauwerk',
    defaultOn: true,
    cluster: false,
    geoDataVar: 'regenbeckenGeoData',
    layerVar: 'regenbeckenLayer',
    popupFields: [
      { label: '📍', expr: p => [p.gemeinde, p.kreis].filter(Boolean).join(', ') },
      { label: '🏢 Betreiber', glossar: 'BETREIBER', field: 'betreiber' },
      { label: '🔧 Typ', field: 'typ' },
      { label: '⚙️ Abwasserbereich', glossar: 'ABWASSERBEREICH', field: 'abwasserbereich' }
    ]
  },
  {
    id: 'querbauwerke',
    file: 'querbauwerke.geojson',
    name: 'Querbauwerke (ELWAS)',
    overlayLabel: '🧱 Querbauwerke (ELWAS)',
    icon: '🧱',
    color: '#E69F00',
    className: 'querbauwerke-marker',
    groupLabel: 'Querbauwerk / Bauwerk',
    defaultOn: true,
    cluster: false,
    geoDataVar: 'querbauwerkeGeoData',
    layerVar: 'querbauwerkeLayer',
    popupFields: [
      { label: '📍', field: 'kreis' },
      { label: '🌊 Gewässer', glossar: 'GEWAESSER_EINLEITUNG', field: 'gewaesser' },
      { label: '🏗️ Bauwerksart', glossar: 'BAUWERKSART', field: 'bauwerksart' },
      { label: '🔧 Typ', field: 'typ' }
    ]
  },
  {
    id: 'h2_elektrolyseure_nrw',
    file: 'h2_elektrolyseure_nrw.geojson',
    name: 'H2-Industrie (Elektrolyseure NRW)',
    overlayLabel: '⚡ H2-Industrie (Elektrolyseure NRW)',
    icon: '⚡',
    color: '#F0E442',
    className: 'h2-elektrolyseure-marker',
    groupLabel: 'H2-Elektrolyseur',
    defaultOn: false,
    cluster: false,
    geoDataVar: 'h2ElektrolyseureGeoData',
    layerVar: 'h2ElektrolyseureLayer',
    popupFields: [
      { label: '📍', expr: p => [p.gemeinde, p.kreis].filter(Boolean).join(', ') },
      { label: '🏢 Betreiber', field: 'operator' },
      { label: '⚡ Kapazität', field: 'capacity_mw', suffix: ' MW' },
      { label: '📊 Status', field: 'status' }
    ]
  }
];
