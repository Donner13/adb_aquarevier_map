/**
 * Bindet basierend auf den styleSettings einen Hover-Tooltip an einen Marker.
 * @param {object} marker - Das Leaflet-Marker-Objekt.
 * @param {string} tooltipPref - Die Tooltip-Präferenz aus styleSettings.markerTooltip (z. B. 'name', 'name_group', 'all', 'none').
 * @param {string} institution - Der Name des Akteurs.
 * @param {string} group - Die Akteursgruppe.
 * @param {string} color - Die zugewiesene Farbe für die Gruppe.
 * @param {Array} people - Das Array der Personen (Kontakte) für diesen Akteur.
 */
function applyMarkerTooltip(marker, tooltipPref, institution, group, color, people) {
    if (!tooltipPref || tooltipPref === 'none') {
        return;
    }

    let tooltipHtml = '';
    if (tooltipPref === 'name') {
        tooltipHtml = `<b>${institution}</b>`;
    } else if (tooltipPref === 'name_group') {
        tooltipHtml = `<b>${institution}</b><br><span style="font-size:10px;color:${color}">${group}</span>`;
    } else if (tooltipPref === 'all') {
        tooltipHtml = `<b>${institution}</b><br><span style="font-size:10px;color:${color}">${group}</span>`;
        const pNames = people.map(p => {
            let n = p.name.split('(')[0].trim() || p.name;
            return n;
        });
        if (pNames.length > 0) {
            tooltipHtml += `<br><span style="font-size:10px;">👤 ${pNames.join(', ')}</span>`;
        }
    }

    if (tooltipHtml) {
        marker.bindTooltip(tooltipHtml, { sticky: true });
    }
}

// Export für Tests in Node, falls vorhanden
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyMarkerTooltip };
} else {
    // Globale Verügbarkeit im Browser
    window.applyMarkerTooltip = applyMarkerTooltip;
}
