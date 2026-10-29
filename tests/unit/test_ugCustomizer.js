const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock DOM with plain JS objects
global.document = {
    getElementById: (id) => {
        return global.mockDOM[id];
    }
};

global.mockDOM = {
    'cfg-ug-color': { value: '#000000' },
    'cfg-ug-fill': { value: '#818cf8' },
    'cfg-ug-weight': { value: '1.8' },
    'cfg-ug-opacity': { value: '0.04' }
};

// Mock Global Variables required by ugCustomizer.js
global.styleSettings = {
    boundaries: {
        ugColor: '#000000',
        ugFill: '#818cf8',
        ugWeight: 1.8,
        ugOpacity: 0.04
    }
};

let setStyleCalledWith = null;
global.leafletUG = {
    setStyle: (styles) => {
        setStyleCalledWith = styles;
    }
};

let persistLocalCalled = false;
global.persistLocal = () => {
    persistLocalCalled = true;
};

// Ensure window is mocked to map to global for the script
global.window = global;

// Load the script
const scriptContent = fs.readFileSync(path.join(__dirname, '../../js/editor/ugCustomizer.js'), 'utf8');
eval(scriptContent);

function testUgCustomizer() {
    console.log("Running ugCustomizer.js tests...");

    // Set mock inputs
    global.mockDOM['cfg-ug-color'].value = '#112233';
    global.mockDOM['cfg-ug-fill'].value = '#aabbcc';
    global.mockDOM['cfg-ug-weight'].value = '3.5';
    global.mockDOM['cfg-ug-opacity'].value = '0.7';

    // Call function under test
    global.window.updateUGStyles();

    // Verify styleSettings update
    assert.strictEqual(global.styleSettings.boundaries.ugColor, '#112233');
    assert.strictEqual(global.styleSettings.boundaries.ugFill, '#aabbcc');
    assert.strictEqual(global.styleSettings.boundaries.ugWeight, 3.5);
    assert.strictEqual(global.styleSettings.boundaries.ugOpacity, 0.7);

    // Verify setStyle called on leafletUG
    assert.notStrictEqual(setStyleCalledWith, null);
    assert.strictEqual(setStyleCalledWith.color, '#112233');
    assert.strictEqual(setStyleCalledWith.fillColor, '#aabbcc');
    assert.strictEqual(setStyleCalledWith.weight, 3.5);
    assert.strictEqual(setStyleCalledWith.fillOpacity, 0.7);

    // Verify persistLocal was called
    assert.strictEqual(persistLocalCalled, true);

    console.log("All unit tests passed!");
}

try {
    testUgCustomizer();
} catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
}
