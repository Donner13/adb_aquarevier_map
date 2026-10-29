/**
 * Editor Feature: Rur Watershed Customizer (TASK-07)
 * Extracted logic for updating and persisting the Rur catchment boundary layer.
 */

function updateRurWatershedStyle(styleSettings, leafletCA) {
    const caColor = document.getElementById('cfg-ca-color').value;
    const caFill = document.getElementById('cfg-ca-fill').value;
    const caWeight = parseFloat(document.getElementById('cfg-ca-weight').value);
    const caOpacity = parseFloat(document.getElementById('cfg-ca-opacity').value);

    // Update style settings object
    if (!styleSettings.boundaries) styleSettings.boundaries = {};
    styleSettings.boundaries.caColor = caColor;
    styleSettings.boundaries.caFill = caFill;
    styleSettings.boundaries.caWeight = caWeight;
    styleSettings.boundaries.caOpacity = caOpacity;

    // Apply to Leaflet layer
    if (leafletCA) {
        leafletCA.setStyle({
            color: caColor,
            weight: caWeight,
            fillColor: caFill,
            fillOpacity: caOpacity
        });
    }
}

window.updateRurWatershedStyle = updateRurWatershedStyle;
