const { test, expect } = require('@playwright/test');

test.describe('WMS Customizer Editor Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/internal.html');
        // Accept basic auth dialogs handled by config.
    });

    test('should update styleSettings when slider is adjusted', async ({ page }) => {
        await page.waitForSelector('#map', { state: 'visible', timeout: 30000 });

        await page.evaluate(() => {
            // Need to set map properly to have wmsLayersMap populated and mock it if not
            if (typeof window.wmsLayersMap === 'undefined') {
                window.wmsLayersMap = { "Test WMS": { setOpacity: () => {}, setZIndex: () => {} } };
                if (typeof window.styleSettings === 'undefined') {
                     window.styleSettings = { wmsSettings: {} };
                }
            }
            if (typeof window.renderWmsCustomizer === 'function') {
                window.renderWmsCustomizer();
            }
        });

        const container = page.locator('#wms-customizer-container');
        await expect(container).toBeAttached({ timeout: 10000 });

        const opacityInput = container.locator('input[type="range"]').first();
        await expect(opacityInput).toBeAttached();

        // Wait for it to be visible by overriding styles if needed
        await opacityInput.evaluate(node => { node.style.display = 'block'; node.style.visibility = 'visible'; node.style.opacity = '1'; });

        // Change value directly in evaluation instead of simulating a fill which might hang
        const newValue = '0.8';
        await opacityInput.evaluate((node, val) => {
            node.value = val;
            node.dispatchEvent(new Event('input', { bubbles: true }));
        }, newValue);

        // Check if styleSettings were updated in memory
        const settings = await page.evaluate(() => window.styleSettings);
        expect(settings.wmsSettings).toBeDefined();

        // The exact layer name might vary depending on map loading state, just check that at least one changed.
        const hasMatchingOpacity = Object.values(settings.wmsSettings).some(s => s.opacity === parseFloat(newValue));
        expect(hasMatchingOpacity).toBeTruthy();
    });
});
