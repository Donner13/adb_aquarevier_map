const assert = require('assert');

// Extracted filter logic for testing
function filterFeature(feature) {
    if (!feature.geometry || feature.geometry.type !== 'Point' || !feature.geometry.coordinates || feature.geometry.coordinates.length < 2) return false;
    const rawLng = feature.geometry.coordinates[0];
    const rawLat = feature.geometry.coordinates[1];
    if (rawLng === null || rawLat === null || rawLng === '' || rawLat === '') return false;
    const lng = Number(rawLng);
    const lat = Number(rawLat);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return false;
    return true;
}

function runTests() {
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${name}`);
            console.error(err);
            failed++;
        }
    }

    test('Valid coordinates', () => {
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, 50.5] } }), true);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: ['6.5', '50.5'] } }), true);
    });

    test('NaN coordinates', () => {
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [NaN, 50.5] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, NaN] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: ['invalid', 50.5] } }), false);
    });

    test('Out of bounds', () => {
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [181, 50.5] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [-181, 50.5] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, 91] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, -91] } }), false);
    });

    test('Null or empty string coordinates', () => {
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [null, 50.5] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, null] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: ['', 50.5] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [6.5, ''] } }), false);
    });

    test('Invalid geometry types', () => {
        assert.strictEqual(filterFeature({ geometry: null }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'LineString', coordinates: [[1, 2], [3, 4]] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point', coordinates: [1] } }), false);
        assert.strictEqual(filterFeature({ geometry: { type: 'Point' } }), false);
        assert.strictEqual(filterFeature({ }), false);
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}
