const assert = require('assert');
const fs = require('fs');

// We test logic independently of browser globals
// Load code manually and evaluate in context
const code = fs.readFileSync('js/editor/basemap.js', 'utf-8');

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

    test('BasemapManager sets default layer based on styleSettings', () => {
        const window = {
            styleSettings: { defaultBaseMap: 'dark' },
            baseOsm: { id: 'osm', addTo: function(map) { this.added = true; } },
            baseLight: { id: 'light', addTo: function(map) { this.added = true; } },
            baseDark: { id: 'dark', addTo: function(map) { this.added = true; } },
            baseWebAtlas: { id: 'nrw', addTo: function(map) { this.added = true; } },
            map: {
                layers: [],
                hasLayer: function(l) { return this.layers.includes(l); },
                removeLayer: function(l) { this.layers = this.layers.filter(x => x !== l); },
                addToMap: function(l) { this.layers.push(l); }
            }
        };

        const document = { getElementById: () => null };

        // mock eval env
        eval(code);

        window.BasemapManager.applyBasemap();

        assert.strictEqual(window.baseDark.added, true);
        assert.strictEqual(window.baseOsm.added, undefined);
    });

    test('BasemapManager defaults to OSM if not specified', () => {
        const window = {
            styleSettings: { },
            baseOsm: { id: 'osm', addTo: function(map) { this.added = true; } },
            map: {
                layers: [],
                hasLayer: function(l) { return this.layers.includes(l); },
                removeLayer: function(l) { this.layers = this.layers.filter(x => x !== l); }
            }
        };

        const document = { getElementById: () => null };

        eval(code);

        window.BasemapManager.applyBasemap();

        assert.strictEqual(window.baseOsm.added, true);
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}
