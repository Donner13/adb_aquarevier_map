window.sanitizeCsvCell = window.sanitizeCsvCell || function(value) {
    if (value === null || value === undefined) return '""';
    let str = String(value);

    // Escape double quotes by doubling them
    str = str.replace(/"/g, '""');

    // Check for CSV Formula Injection characters (=, +, -, @)
    if (['=', '+', '-', '@'].includes(str.charAt(0))) {
        str = "'" + str; // Add leading apostrophe to neutralize
    }

    return `"${str}"`;
};

window.exportFullPIIToCSV = function() {
    const features = window.geojsonData ? window.geojsonData.features : [];
    if (!features || features.length === 0) {
        alert("Keine Daten zum Exportieren vorhanden.");
        return;
    }

    // Extract all unique property keys from features dynamically
    const propertyKeys = new Set();
    features.forEach(feature => {
        if (feature.properties) {
            Object.keys(feature.properties).forEach(key => propertyKeys.add(key));
        }
    });

    const propArray = Array.from(propertyKeys);
    const headers = [...propArray, 'Breitengrad', 'Längengrad', 'Lizenz', 'Exportdatum'];
    const csvRows = [headers.join(';')];

    const today = new Date().toISOString().split('T')[0];
    const license = "Daten bereitgestellt durch AquaRevier. Lizenz: CC BY 4.0";

    features.forEach(feature => {
        const props = feature.properties || {};
        const geom = feature.geometry;
        const lat = geom && geom.coordinates ? geom.coordinates[1] : '';
        const lng = geom && geom.coordinates ? geom.coordinates[0] : '';

        const rowVals = propArray.map(key => props[key] !== undefined && props[key] !== null ? props[key] : '');

        const row = [
            ...rowVals,
            lat,
            lng,
            license,
            today
        ].map(val => window.sanitizeCsvCell(val));
        csvRows.push(row.join(';'));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const filename = `Akteure_Vollstaendig_${today}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
