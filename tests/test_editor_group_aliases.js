const assert = require('assert');
const fs = require('fs');

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

    test('group_aliases.js defines updateGroupName correctly', () => {
        // Load the new js/editor/group_aliases.js script logic
        const scriptCode = fs.readFileSync('js/editor/group_aliases.js', 'utf8');

        // Mock global environment
        global.window = {};

        let updateFilterButtonNamesCalled = false;
        let renderMapAndSidebarCalled = false;
        let persistLocalCalled = false;

        global.window.updateFilterButtonNames = () => { updateFilterButtonNamesCalled = true; };
        global.window.renderMapAndSidebar = () => { renderMapAndSidebarCalled = true; };
        global.window.persistLocal = () => { persistLocalCalled = true; };

        global.window.styleSettings = {
            groupNames: {
                'Forschung': 'Forschung',
                'Behörde': 'Behörde'
            }
        };

        // Execute the script
        eval(scriptCode);

        // Assert function exists
        assert.ok(typeof window.updateGroupName === 'function', 'updateGroupName must be a function');

        // Call the function
        window.updateGroupName('Forschung', 'Wissenschaft & Hochschule');

        // Check if the underlying styleSettings was updated
        assert.strictEqual(global.window.styleSettings.groupNames['Forschung'], 'Wissenschaft & Hochschule', 'Should have updated the alias');

        // Check if related update functions were called
        assert.ok(updateFilterButtonNamesCalled, 'updateFilterButtonNames should have been called');
        assert.ok(renderMapAndSidebarCalled, 'renderMapAndSidebar should have been called');
        assert.ok(persistLocalCalled, 'persistLocal should have been called');
    });

    console.log(`\nTESTS: ${passed} passed / ${failed} failed`);
    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}
