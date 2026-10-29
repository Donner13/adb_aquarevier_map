/**
 * TASK-06: Untersuchungsgebiet-Hintergrund (Fill Style) anpassen
 * Extracted logic for updating the UG boundary style
 */
window.updateUGStyles = function(skipPersist = false) {
    if (!document.getElementById('cfg-ug-color')) return; // Exit if DOM not loaded yet

    const ugColor = document.getElementById('cfg-ug-color').value;
    const ugFill = document.getElementById('cfg-ug-fill').value;
    const ugWeight = parseFloat(document.getElementById('cfg-ug-weight').value);
    const ugOpacity = parseFloat(document.getElementById('cfg-ug-opacity').value);

    // Use global var for boundary layer defined in internal.html if possible
    if (typeof styleSettings !== 'undefined' && styleSettings.boundaries) {
        styleSettings.boundaries.ugColor = ugColor;
        styleSettings.boundaries.ugFill = ugFill;
        styleSettings.boundaries.ugWeight = ugWeight;
        styleSettings.boundaries.ugOpacity = ugOpacity;
    }

    if (typeof leafletUG !== 'undefined' && leafletUG) {
        leafletUG.setStyle({
            color: ugColor,
            weight: ugWeight,
            fillColor: ugFill,
            fillOpacity: ugOpacity
        });
    }

    if (!skipPersist && typeof persistLocal === 'function') {
        persistLocal();
    }
};
