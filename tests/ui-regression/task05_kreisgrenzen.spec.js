const { test, expect } = require('@playwright/test');

test.describe('Task 05: Kreisgrenzen Editor', () => {
    // Adding credentials from env instead of hardcoding
    test.use({ httpCredentials: { username: process.env.EDITOR_USER || 'florian', password: process.env.EDITOR_PASSWORD } });

    test('should change Kreisgrenzen style and verify logic directly', async ({ page }) => {
        await page.goto('/internal.html');

        // Wait for inputs
        await page.waitForSelector('#cfg-kr-color', { state: 'attached', timeout: 10000 });

        // Wait for map
        await page.waitForSelector('#map', { state: 'visible' });

        // Let things load
        await page.waitForTimeout(2000);

        // Inject a mocked window.styleSettings if none
        await page.evaluate(() => {
            if (typeof styleSettings === 'undefined') {
                window.styleSettings = { boundaries: {} };
            }
            if (typeof styleSettings !== 'undefined' && !styleSettings.boundaries) {
                styleSettings.boundaries = {};
            }
        });

        // Change styles
        await page.evaluate(() => {
            document.getElementById('cfg-kr-color').value = '#ff0000';
            document.getElementById('cfg-kr-weight').value = '5';
            document.getElementById('cfg-kr-dash').value = '10, 10';
            updateKreisgrenzenStyles(true);
        });

        const settings = await page.evaluate(() => {
            return {
                krColor: typeof styleSettings !== 'undefined' ? styleSettings.boundaries.krColor : null,
                krWeight: typeof styleSettings !== 'undefined' ? styleSettings.boundaries.krWeight : null,
                krDash: typeof styleSettings !== 'undefined' ? styleSettings.boundaries.krDash : null
            };
        });

        expect(settings.krColor).toBe('#ff0000');
        expect(settings.krWeight).toBe(5);
        expect(settings.krDash).toBe('10, 10');
    });
});
