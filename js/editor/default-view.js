// js/editor/default-view.js
// Handles setting, saving, and loading the default map view (center and zoom) in the customizer.

function initDefaultViewCustomizer() {
    // 1. Hook into applyStyleSettingsToUI
    const originalApplyStyleSettingsToUI = window.applyStyleSettingsToUI;
    window.applyStyleSettingsToUI = function() {
        if (originalApplyStyleSettingsToUI) originalApplyStyleSettingsToUI();
        applyDefaultViewToUI();
    };

    // 2. Hook into persistLocal
    const originalPersistLocal = window.persistLocal;
    window.persistLocal = function() {
        saveDefaultViewToSettings();
        if (originalPersistLocal) originalPersistLocal();
    };

    // Apply the loaded view on map init, wait a bit so map is ready
    setTimeout(() => {
        if (window.styleSettings && window.styleSettings.defaultView && window.map) {
            const dv = window.styleSettings.defaultView;
            if (dv.lat !== undefined && dv.lng !== undefined && dv.zoom !== undefined) {
                 window.map.setView([dv.lat, dv.lng], dv.zoom);
            }
        }
    }, 500);
}

function applyDefaultViewToUI() {
    const dv = window.styleSettings.defaultView || { lat: 51.15, lng: 6.75, zoom: 9 };
    const latInput = document.getElementById('cfg-default-lat');
    const lngInput = document.getElementById('cfg-default-lng');
    const zoomInput = document.getElementById('cfg-default-zoom');

    if (latInput) latInput.value = dv.lat;
    if (lngInput) lngInput.value = dv.lng;
    if (zoomInput) zoomInput.value = dv.zoom;
}

function saveDefaultViewToSettings() {
    const latInput = document.getElementById('cfg-default-lat');
    const lngInput = document.getElementById('cfg-default-lng');
    const zoomInput = document.getElementById('cfg-default-zoom');

    if (latInput && lngInput && zoomInput) {
        window.styleSettings.defaultView = {
            lat: parseFloat(latInput.value),
            lng: parseFloat(lngInput.value),
            zoom: parseInt(zoomInput.value)
        };
    }
}

// Attach a function to set the inputs to the current map view
window.setCurrentViewAsDefault = function() {
    if (!window.map) return;
    const center = window.map.getCenter();
    const zoom = window.map.getZoom();

    const latInput = document.getElementById('cfg-default-lat');
    const lngInput = document.getElementById('cfg-default-lng');
    const zoomInput = document.getElementById('cfg-default-zoom');

    if (latInput) latInput.value = center.lat.toFixed(4);
    if (lngInput) lngInput.value = center.lng.toFixed(4);
    if (zoomInput) zoomInput.value = zoom;

    // Auto-save changes
    if (window.persistLocal) {
        window.persistLocal();
    }

    // Optional: show a quick toast or feedback here, alert is simple for now
    alert(`Standardansicht gespeichert: Lat ${center.lat.toFixed(4)}, Lng ${center.lng.toFixed(4)}, Zoom ${zoom}`);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initDefaultViewCustomizer();
});
