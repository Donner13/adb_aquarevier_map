const { test, expect } = require('@playwright/test');

test.describe('Tile Error Handling', () => {
    test('Fallback tile is used on 404', async ({ page }) => {
        let tileErrorTriggered = false;

        // Intercept all map tile requests to return a 404 response
        await page.route('**/*.png*', async (route) => {
            const url = route.request().url();
            // Broader catch for tile providers by intercepting standard tile formats
            if (url.includes('/{z}/{x}/{y}') || url.match(/\/(\d+)\/(\d+)\/(\d+)\.png/)) {
                tileErrorTriggered = true;
                await route.fulfill({
                    status: 404,
                    contentType: 'text/plain',
                    body: 'Not Found'
                });
            } else {
                await route.continue();
            }
        });

        // Use DomContentLoaded to ensure map initialization
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Expose a test hook to attach a listener explicitly, to prove tileerror callback works
        await page.evaluate(() => {
            return new Promise((resolve) => {
                 if(typeof map !== 'undefined') {
                    let tileErrorFired = false;
                    map.eachLayer((layer) => {
                        if (layer instanceof L.TileLayer) {
                            layer.on('tileerror', () => { tileErrorFired = true; });
                        }
                    });

                    // Wait for layers to try and load
                    setTimeout(() => resolve(tileErrorFired), 1000);
                 } else {
                     resolve(false);
                 }
            });
        });

        // Use locators instead of arbitrary timeouts for assertions
        const fallbackTile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        // Wait until at least one tile element appears
        await page.waitForSelector('img.leaflet-tile');

        const fallbackTilesLocator = page.locator(`img.leaflet-tile[src="${fallbackTile}"]`);

        // Assert that the callback updated at least one tile's source
        await expect(fallbackTilesLocator.first()).toBeVisible({ timeout: 5000 });
        expect(tileErrorTriggered).toBeTruthy();
    });
});
