const { test, expect } = require('@playwright/test');

test.describe('Tile Error Handling', () => {
    test('Fallback tile is used on 404', async ({ page }) => {
        let tileErrorTriggered = false;

        // Intercept map tile requests to return a 404 response
        await page.route('**/*.png*', (route) => {
            const url = route.request().url();
            if (url.includes('basemaps.cartocdn.com') || url.includes('openstreetmap.org')) {
                tileErrorTriggered = true;
                route.fulfill({
                    status: 404,
                    contentType: 'text/plain',
                    body: 'Not Found'
                });
            } else {
                route.continue();
            }
        });

        await page.goto('/');

        // Wait for map to initialize and tiles to load (and fail)
        await page.waitForTimeout(2000);

        // Verify the interception worked
        expect(tileErrorTriggered).toBeTruthy();

        // Check if any map tiles exist with the fallback data-uri
        const fallbackTile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        const tiles = await page.$$('img.leaflet-tile');
        let foundFallback = false;

        for (const tile of tiles) {
            const src = await tile.getAttribute('src');
            if (src === fallbackTile) {
                foundFallback = true;
                break;
            }
        }

        expect(foundFallback).toBe(true);
    });
});
