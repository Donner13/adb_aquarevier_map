const assert = require('assert');
const { setupLayerToggleLogic } = require('../../js/layer_control.js');

// ------------------------------------------------------------------
// Mock Environment
// ------------------------------------------------------------------
class MockMap {
    constructor() {
        this.layers = new Set();
        this.events = [];
    }
    hasLayer(layer) {
        return this.layers.has(layer);
    }
    addLayer(layer) {
        this.layers.add(layer);
    }
    removeLayer(layer) {
        this.layers.delete(layer);
    }
    fire(eventName, data) {
        this.events.push({ eventName, data });
    }
}

class MockElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.attributes = {};
        this.classList = {
            add: () => {},
            remove: () => {}
        };
        this.listeners = {};
    }
    getAttribute(name) {
        return this.attributes[name] || null;
    }
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    addEventListener(event, callback) {
        this.listeners[event] = callback;
    }
    click() {
        if (this.listeners['click']) {
            this.listeners['click']();
        }
    }
}

// ------------------------------------------------------------------
// Test Suite
// ------------------------------------------------------------------
function runTests() {
    console.log('--- Starting Layer Control Unit Tests ---');

    // 1. Initialize mocks
    const map = new MockMap();
    const mockLayerA = { _type: 'MockLayerA' };
    const mockLayerB = { _type: 'MockLayerB' };

    const overlayMaps = {
        'LayerA': mockLayerA,
        'LayerB': mockLayerB
    };

    const btnA = new MockElement('button');
    btnA.setAttribute('data-layer-name', 'LayerA');

    const btnB = new MockElement('button');
    btnB.setAttribute('data-layer-name', 'LayerB');

    const buttons = [btnA, btnB];

    let visualStatesUpdated = 0;
    let countersUpdated = 0;

    const updateVisualStates = () => { visualStatesUpdated++; };
    const updateCounters = () => { countersUpdated++; };

    // 2. Bind the logic
    setupLayerToggleLogic(map, overlayMaps, buttons, updateVisualStates, updateCounters);

    // Test Case 1: Toggling ON a layer adds it to map and emits 'overlayadd'
    btnA.click();
    assert.strictEqual(map.events.length, 1, 'Clicking inactive layer should fire exactly one event.');
    assert.strictEqual(map.events[0].eventName, 'overlayadd', 'Event should be overlayadd.');
    assert.strictEqual(map.events[0].data.name, 'LayerA', 'Event payload must contain correct layer name.');
    assert.strictEqual(map.events[0].data.layer, mockLayerA, 'Event payload must contain the layer object.');
    assert.ok(map.hasLayer(mockLayerA), 'Map should register the layer as added.');
    assert.strictEqual(visualStatesUpdated, 1);
    assert.strictEqual(countersUpdated, 1);
    console.log('✓ Test 1 Passed: Toggling a layer ON emits overlayadd');

    // Test Case 2: Toggling OFF an active layer removes it and emits 'overlayremove'
    map.events = []; // Reset events log
    btnA.click();
    assert.strictEqual(map.events.length, 1, 'Clicking active layer should fire exactly one event.');
    assert.strictEqual(map.events[0].eventName, 'overlayremove', 'Event should be overlayremove.');
    assert.strictEqual(map.events[0].data.name, 'LayerA', 'Event payload must contain correct layer name.');
    assert.strictEqual(map.events[0].data.layer, mockLayerA, 'Event payload must contain the layer object.');
    assert.ok(!map.hasLayer(mockLayerA), 'Map should register the layer as removed.');
    assert.strictEqual(visualStatesUpdated, 2);
    assert.strictEqual(countersUpdated, 2);
    console.log('✓ Test 2 Passed: Toggling a layer OFF emits overlayremove');

    // Test Case 3: Toggling multiple layers works independently
    map.events = [];
    btnA.click(); // Add Layer A
    btnB.click(); // Add Layer B

    assert.strictEqual(map.events.length, 2, 'Two events should be fired for two clicks.');
    assert.strictEqual(map.events[0].eventName, 'overlayadd');
    assert.strictEqual(map.events[1].eventName, 'overlayadd');
    assert.strictEqual(map.events[1].data.name, 'LayerB');
    assert.ok(map.hasLayer(mockLayerA) && map.hasLayer(mockLayerB), 'Map should have both layers.');
    console.log('✓ Test 3 Passed: Independent layer toggles function correctly');

    console.log('\n=========================================');
    console.log('ALL LAYER CONTROL UNIT TESTS PASSED!');
    console.log('=========================================\n');
}

try {
    runTests();
} catch (err) {
    console.error('Test suite failed:', err);
    process.exit(1);
}
