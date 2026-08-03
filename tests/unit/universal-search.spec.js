const { test, expect } = require('@playwright/test');

test.describe('Search Bar Query Normalization - Unit Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Load the JS file in a blank page so we can test it directly
        await page.goto('about:blank');

        // Mock data and dependencies
        await page.evaluate(() => {
            window.getAvailableGemeinden = () => [{ name: 'Aachen', kreis: 'Städteregion Aachen', centerLat: 50, centerLng: 6 }];
            window.geojsonData = { features: [] };
            window.layerDataStore = {};
        });

        // Inject the script content
        const scriptContent = require('fs').readFileSync('./js/universal-search.js', 'utf-8');
        await page.addScriptTag({ content: scriptContent });
    });

    test('ignores leading and trailing whitespace', async ({ page }) => {
        const [withSpaces, withoutSpaces] = await page.evaluate(() => {
            return [
                window.queryUniversalSearch('  Aachen  '),
                window.queryUniversalSearch('Aachen')
            ];
        });
        expect(withSpaces.length).toBeGreaterThan(0);
        expect(withSpaces).toEqual(withoutSpaces);
    });

    test('is case insensitive', async ({ page }) => {
        const [upper, lower, mixed] = await page.evaluate(() => {
            return [
                window.queryUniversalSearch('AACHEN'),
                window.queryUniversalSearch('aachen'),
                window.queryUniversalSearch('AaChEn')
            ];
        });
        expect(upper.length).toBeGreaterThan(0);
        expect(upper).toEqual(lower);
        expect(upper).toEqual(mixed);
    });

    test('returns empty array for queries < 2 chars', async ({ page }) => {
        const results = await page.evaluate(() => {
            return [
                window.queryUniversalSearch('A'),
                window.queryUniversalSearch('  a  '),
                window.queryUniversalSearch(''),
                window.queryUniversalSearch(' ')
            ];
        });
        for (const res of results) {
            expect(res).toEqual([]);
        }
    });

    test('handles null or undefined queries gracefully', async ({ page }) => {
        const results = await page.evaluate(() => {
            return [
                window.queryUniversalSearch(null),
                window.queryUniversalSearch(undefined)
            ];
        });
        for (const res of results) {
            expect(res).toEqual([]);
        }
    });

    test('handles special characters without crashing', async ({ page }) => {
        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('!?#%*^');
        });
        expect(Array.isArray(results)).toBe(true);
    });
});
