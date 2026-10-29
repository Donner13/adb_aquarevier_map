const assert = require('assert');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Mock DOM
const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
        <input type="text" id="custom-wms-name" value="Test WMS" />
        <input type="text" id="custom-wms-url" value="http://example.com/wms" />
        <input type="text" id="custom-wms-layers" value="layer1,layer2" />
        <div id="custom-wms-list"></div>
    </body>
    </html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.alert = () => {};

// Mock mapping dependencies
global.L = {
    tileLayer: {
        wms: function(url, options) {
            return { url, options, setOpacity: function(op) { this.options.opacity = op; } };
        }
    }
};

global.map = {
    removeLayer: function() {}
};

global.layerControl = {
    addOverlay: function() {},
    removeLayer: function() {}
};

global.styleSettings = {
    customWMS: []
};

global.persistLocal = function() {};

// Load code to test
const code = fs.readFileSync('js/editor/custom_wms.js', 'utf8');
eval(code);

// Run tests
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

    test('addCustomWMS adds a new config and updates UI', () => {
        window.addCustomWMS();

        assert.strictEqual(global.styleSettings.customWMS.length, 1);
        const wmsConfig = global.styleSettings.customWMS[0];
        assert.strictEqual(wmsConfig.name, 'Test WMS');
        assert.strictEqual(wmsConfig.url, 'http://example.com/wms');
        assert.strictEqual(wmsConfig.layers, 'layer1,layer2');
        assert.ok(global.customWMSLayers['Test WMS']);

        const listDiv = document.getElementById('custom-wms-list');
        assert.ok(listDiv.innerHTML.includes('Test WMS'));
        assert.ok(listDiv.innerHTML.includes('layer1,layer2'));
    });

    test('updateCustomWMSSetting updates opacity', () => {
        const id = global.styleSettings.customWMS[0].id;
        window.updateCustomWMSSetting(id, '0.5');

        const wmsConfig = global.styleSettings.customWMS[0];
        assert.strictEqual(wmsConfig.opacity, 0.5);
        assert.strictEqual(global.customWMSLayers['Test WMS'].options.opacity, 0.5);
    });

    test('removeCustomWMS removes config and layer', () => {
        const id = global.styleSettings.customWMS[0].id;
        window.removeCustomWMS(id);

        assert.strictEqual(global.styleSettings.customWMS.length, 0);
        assert.strictEqual(global.customWMSLayers['Test WMS'], undefined);
        const listDiv = document.getElementById('custom-wms-list');
        assert.strictEqual(listDiv.innerHTML, '');
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
