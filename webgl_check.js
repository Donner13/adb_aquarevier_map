// Perf Task 12: WebGL Context Fallback Guard
// NOTE: This repository does not currently load any WebGL-based map layers
// (e.g. Leaflet.glify, DeckGL, Mapbox GL JS). Leaflet standard markers and
// WMS tiles use SVG/Canvas 2D renderers. This guard exposes a global boolean
// and configures L.canvas() explicitly for environments that support WebGL.
window.AQUAREVIER_WEBGL_SUPPORTED = false;
window.AQUAREVIER_CUSTOM_RENDERER = L.svg();

try {
    const canvas = document.createElement('canvas');
    window.AQUAREVIER_WEBGL_SUPPORTED = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
} catch (e) {
    console.warn("WebGL support check failed.", e);
}

if (window.AQUAREVIER_WEBGL_SUPPORTED) {
    window.AQUAREVIER_CUSTOM_RENDERER = L.canvas();
}
