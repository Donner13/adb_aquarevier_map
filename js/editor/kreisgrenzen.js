/**
 * TASK-05: Kreisgrenzen (Dashed Line Style) konfigurieren
 * Handles the customization of the Rheinische Revier boundaries.
 */

function updateKreisgrenzenStyles(skipPersist = false) {
    if (typeof styleSettings === 'undefined') return;
    if (!styleSettings.boundaries) styleSettings.boundaries = {};

    const krColor = document.getElementById('cfg-kr-color').value;
    const krWeight = parseFloat(document.getElementById('cfg-kr-weight').value);
    const krDash = document.getElementById('cfg-kr-dash').value;

    styleSettings.boundaries.krColor = krColor;
    styleSettings.boundaries.krWeight = krWeight;
    styleSettings.boundaries.krDash = krDash;

    if (window.leafletKR) {
        window.leafletKR.setStyle({
            color: krColor,
            weight: krWeight,
            dashArray: krDash
        });
    }

    if (!skipPersist && typeof window.persistLocal === 'function') {
        window.persistLocal();
    }
}

function initKreisgrenzenUI(styleSettingsObj) {
    if (!styleSettingsObj || !styleSettingsObj.boundaries) return;
    const b = styleSettingsObj.boundaries;

    if (b.krColor !== undefined) {
        const el = document.getElementById('cfg-kr-color');
        if (el) el.value = b.krColor;
    }
    if (b.krWeight !== undefined) {
        const el = document.getElementById('cfg-kr-weight');
        if (el) el.value = b.krWeight;
    }
    if (b.krDash !== undefined) {
        const el = document.getElementById('cfg-kr-dash');
        if (el) el.value = b.krDash;
    }
}
