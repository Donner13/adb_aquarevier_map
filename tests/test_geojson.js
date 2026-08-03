const assert = require('assert');
const { parseFeature } = require('../js/geojson-parser.js');

// Unit tests
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

    test('Null handling: returns null for null/undefined input', () => {
        assert.strictEqual(parseFeature(null), null);
        assert.strictEqual(parseFeature(undefined), null);
    });

    test('Null handling: returns null for invalid JSON string', () => {
        assert.strictEqual(parseFeature('invalid'), null);
        assert.strictEqual(parseFeature(''), null);
    });

    test('Feature parsing: returns null if not a Feature', () => {
        assert.strictEqual(parseFeature(JSON.stringify({ type: 'Point' })), null);
        assert.strictEqual(parseFeature({ type: 'FeatureCollection' }), null);
    });

    test('Valid coordinate checks: parses valid GeoJSON feature string', () => {
        const validStr = JSON.stringify({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [6.5, 50.5] },
            properties: { id: 1 }
        });
        const result = parseFeature(validStr);
        assert.ok(result);
        assert.strictEqual(result.type, 'Feature');
        assert.deepStrictEqual(result.geometry.coordinates, [6.5, 50.5]);
    });

    test('Valid coordinate checks: parses valid GeoJSON object', () => {
        const validObj = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-10.0, 20.0] },
            properties: {}
        };
        const result = parseFeature(validObj);
        assert.ok(result);
        assert.deepStrictEqual(result.geometry.coordinates, [-10.0, 20.0]);
    });

    test('Valid coordinate checks: fails on out-of-bounds coordinates', () => {
        const outOfBoundsLat = { type: 'Feature', geometry: { coordinates: [0, 91] } };
        const outOfBoundsLng = { type: 'Feature', geometry: { coordinates: [181, 0] } };
        assert.strictEqual(parseFeature(outOfBoundsLat), null);
        assert.strictEqual(parseFeature(outOfBoundsLng), null);
    });

    test('Valid coordinate checks: fails on non-numeric coordinates', () => {
        const nonNumeric = { type: 'Feature', geometry: { coordinates: ['0', 0] } };
        assert.strictEqual(parseFeature(nonNumeric), null);
    });

    test('Valid coordinate checks: fails on missing coordinates', () => {
        const missing = { type: 'Feature', geometry: { coordinates: [] } };
        assert.strictEqual(parseFeature(missing), null);
        const missingGeometry = { type: 'Feature' };
        assert.strictEqual(parseFeature(missingGeometry), null);
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

// Only run tests if executed directly
if (require.main === module) {
    runTests();
}
