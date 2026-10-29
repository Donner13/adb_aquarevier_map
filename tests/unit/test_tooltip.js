const { test, expect } = require('@playwright/test');

test.describe('Tooltip Logic', () => {
    test('applyMarkerTooltip logic binds correct tooltip for "name_group"', async ({ page }) => {
        // Load the script directly into the page context
        const fs = require('fs');
        const path = require('path');
        const scriptContent = fs.readFileSync(path.join(__dirname, '../../js/editor/tooltip.js'), 'utf-8');

        await page.addScriptTag({ content: scriptContent });

        // Execute function and retrieve the result from the mock marker
        const tooltipHtml = await page.evaluate(() => {
            // Mock Leaflet marker
            const marker = {
                boundHtml: null,
                bindTooltip: function(html, options) {
                    this.boundHtml = html;
                    this.boundOptions = options;
                    return this; // typical leaflet chainable mock
                }
            };

            // Call the globally registered function
            window.applyMarkerTooltip(marker, 'name_group', 'Test Institution', 'Behörde', '#ff0000', [{name: 'Max Mustermann'}]);

            return marker.boundHtml;
        });

        expect(tooltipHtml).toContain('Test Institution');
        expect(tooltipHtml).toContain('Behörde');
        expect(tooltipHtml).toContain('#ff0000');
        expect(tooltipHtml).not.toContain('Max Mustermann'); // "name_group" shouldn't show people
    });

    test('applyMarkerTooltip logic binds correct tooltip for "all"', async ({ page }) => {
        const fs = require('fs');
        const path = require('path');
        const scriptContent = fs.readFileSync(path.join(__dirname, '../../js/editor/tooltip.js'), 'utf-8');

        await page.addScriptTag({ content: scriptContent });

        const tooltipHtml = await page.evaluate(() => {
            const marker = {
                boundHtml: null,
                bindTooltip: function(html, options) {
                    this.boundHtml = html;
                }
            };

            window.applyMarkerTooltip(marker, 'all', 'Test Institution', 'Behörde', '#ff0000', [{name: 'Max Mustermann'}, {name: 'Erika (Musterfrau)'}]);

            return marker.boundHtml;
        });

        expect(tooltipHtml).toContain('Test Institution');
        expect(tooltipHtml).toContain('Behörde');
        expect(tooltipHtml).toContain('Max Mustermann');
        expect(tooltipHtml).toContain('Erika'); // stripped parenthesis
        expect(tooltipHtml).not.toContain('(Musterfrau)');
    });

    test('applyMarkerTooltip does not bind tooltip if pref is "none"', async ({ page }) => {
        const fs = require('fs');
        const path = require('path');
        const scriptContent = fs.readFileSync(path.join(__dirname, '../../js/editor/tooltip.js'), 'utf-8');

        await page.addScriptTag({ content: scriptContent });

        const boundHtml = await page.evaluate(() => {
            const marker = {
                boundHtml: null,
                bindTooltip: function(html, options) {
                    this.boundHtml = html;
                }
            };

            window.applyMarkerTooltip(marker, 'none', 'Test Institution', 'Behörde', '#ff0000', []);

            return marker.boundHtml;
        });

        expect(boundHtml).toBeNull();
    });
});
