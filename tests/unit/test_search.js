const { test, expect } = require('@playwright/test');

test.describe('Search Bar Query Normalization - Unit Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Load the JS file in a blank page so we can test it directly
        await page.goto('about:blank');

        // Mock data and dependencies
        await page.evaluate(() => {
            window.getAvailableGemeinden = () => [
                { name: 'Aachen', kreis: 'Städteregion Aachen', centerLat: 50, centerLng: 6 },
                { name: 'Baesweiler', kreis: 'Städteregion Aachen', centerLat: 50.9, centerLng: 6.18 },
                { name: 'Bonn', kreis: 'Stadt Bonn', centerLat: 50.73, centerLng: 7.1 },
                { name: 'Brühl', kreis: 'Rhein-Erft-Kreis', centerLat: 50.83, centerLng: 6.9 },
                { name: 'Bergheim', kreis: 'Rhein-Erft-Kreis', centerLat: 50.95, centerLng: 6.63 },
                { name: 'Bedburg', kreis: 'Rhein-Erft-Kreis', centerLat: 51.0, centerLng: 6.58 }
            ];
            window.geojsonData = {
                features: [
                    { properties: { name: 'Wasserverband Eifel-Rur', group: 'Verband', stadt: 'Düren' }, geometry: { type: 'Point', coordinates: [6.48, 50.8] } },
                    { properties: { name: 'Erftverband', group: 'Verband', stadt: 'Bergheim' }, geometry: { type: 'Point', coordinates: [6.63, 50.95] } }
                ]
            };
            window.layerDataStore = {
                'pegel': {
                    features: [
                        { properties: { name: 'Pegel Rur', gewaesser: 'Rur', gemeinde: 'Jülich' }, geometry: { type: 'Point', coordinates: [6.36, 50.92] } },
                        { properties: { name: 'Pegel Erft', gewaesser: 'Erft', gemeinde: 'Bedburg' }, geometry: { type: 'Point', coordinates: [6.58, 51.0] } }
                    ]
                }
            };
        });

        // Inject the script content
        const path = require('path');
        const scriptPath = path.resolve(__dirname, '../../js/universal-search.js');
        const scriptContent = require('fs').readFileSync(scriptPath, 'utf-8');
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

    test('supports fuzzy partial substring matching in title', async ({ page }) => {
        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('eifel');
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.title.includes('Wasserverband Eifel-Rur'))).toBe(true);
    });

    test('supports typo-tolerant fuzzy matching', async ({ page }) => {
        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('Achen'); // Typo for Aachen (missing 'a')
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.title === 'Aachen')).toBe(true);
    });

    test('supports fuzzy partial substring matching in subtitle', async ({ page }) => {
        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('ür'); // Partial match for 'Düren'
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.subtitle.includes('Düren'))).toBe(true);
    });

    test('supports fuzzy partial substring matching in category', async ({ page }) => {
        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('egel'); // Partial match for 'Pegel'
        });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.category.includes('Pegel'))).toBe(true);
    });

    test('limits results to a maximum of 15', async ({ page }) => {
        // Add 20 mock results matching "test"
        await page.evaluate(() => {
            const extraGemeinden = Array.from({ length: 20 }, (_, i) => ({
                name: `TestGemeinde${i}`, kreis: 'TestKreis', centerLat: 50, centerLng: 6
            }));
            const orig = window.getAvailableGemeinden;
            window.getAvailableGemeinden = () => [...orig(), ...extraGemeinden];
            window.buildUniversalSearchIndex(); // Reset index to force rebuild
        });

        const results = await page.evaluate(() => {
            return window.queryUniversalSearch('test');
        });
        expect(results.length).toBe(15);
        expect(results.every(r => r.title.startsWith('TestGemeinde'))).toBe(true);
    });
});
