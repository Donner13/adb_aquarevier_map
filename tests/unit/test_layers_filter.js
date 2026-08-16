const assert = require('assert');
const { filterValidGeoJsonFeature } = require('../../js/layers-loader.js');

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
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [6.5, 50.5] } }), true);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: ['6.5', '50.5'] } }), true);
        // Valid negative coordinates
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [-10.5, -20.5] } }), true);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: ['-10.5', '-20.5'] } }), true);
    });

    test('NaN coordinates', () => {
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [NaN, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [6.5, NaN] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: ['invalid', 50.5] } }), false);
    });

    test('Out of bounds', () => {
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [181, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [-181, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [6.5, 91] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [6.5, -91] } }), false);
    });

    test('Implicit coercion edge cases (should be rejected)', () => {
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [null, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: ['', 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: ['   ', 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [false, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [true, 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [[], 50.5] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [[0], 50.5] } }), false);
    });

    test('Invalid or missing geometry definitions', () => {
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: null }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point', coordinates: [1] } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Point' } }), false);
        assert.strictEqual(filterValidGeoJsonFeature({ }), false);
    });

    test('Non-Point geometries should pass', () => {
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'LineString', coordinates: [[1, 2], [3, 4]] } }), true);
        assert.strictEqual(filterValidGeoJsonFeature({ geometry: { type: 'Polygon', coordinates: [[[1, 2], [3, 4], [1, 2]]] } }), true);
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}
