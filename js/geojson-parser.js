/**
 * Parses a GeoJSON Feature and validates its coordinates.
 * This is Layer 1 of the GeoJSON validation.
 */
function parseFeature(input) {
    if (input === null || input === undefined) {
        return null;
    }

    let feature;
    if (typeof input === 'string') {
        try {
            // Check and strip UTF-8 BOM if present before parsing
            let cleanedInput = input;
            if (input.charCodeAt(0) === 0xFEFF) {
                cleanedInput = input.slice(1);
            }
            feature = JSON.parse(cleanedInput);
        } catch (e) {
            return null;
        }
    } else if (typeof input === 'object') {
        feature = input;
    } else {
        return null;
    }

    if (!feature || feature.type !== 'Feature') {
        return null;
    }

    if (!feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
        return null;
    }

    const coords = feature.geometry.coordinates;
    if (coords.length < 2) {
        return null;
    }

    const lng = coords[0];
    const lat = coords[1];

    // Check valid coordinate types and ranges
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        return null;
    }

    // GeoJSON uses [longitude, latitude]
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return null;
    }

    return feature;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseFeature };
}
