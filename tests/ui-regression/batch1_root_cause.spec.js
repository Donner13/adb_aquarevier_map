const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8011;

test.beforeAll(async () => {
    server = http.createServer((req, res) => {
        let filePath = path.join(__dirname, '../..', req.url.split('?')[0]);
        if (filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.geojson' || ext === '.json') contentType = 'application/json';
            if (ext === '.png') contentType = 'image/png';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
    await new Promise(r => server.listen(PORT, r));
});

test.afterAll(() => {
    if (server) server.close();
});

test('Batch 1: Root-Cause JS Bugs & Theme System Validation', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForTimeout(1000);

    // 1. Verify window.map is defined and valid Leaflet map instance
    const isMapDefined = await page.evaluate(() => typeof window.map !== 'undefined' && window.map !== null && typeof window.map.getZoom === 'function');
    expect(isMapDefined).toBe(true);

    // 2. Verify window.layerDataStore & window.geojsonData are populated
    const dataStoreKeys = await page.evaluate(() => window.layerDataStore ? Object.keys(window.layerDataStore) : []);
    expect(dataStoreKeys.length).toBeGreaterThan(0);
    expect(dataStoreKeys).toContain('akteure');

    const geojsonFeaturesCount = await page.evaluate(() => window.geojsonData && window.geojsonData.features ? window.geojsonData.features.length : 0);
    expect(geojsonFeaturesCount).toBeGreaterThan(0);

    // Dismiss onboarding role modal if present
    await page.evaluate(() => {
        const modal = document.getElementById('onboarding-role-modal');
        if (modal) modal.style.display = 'none';
        const backdrop = document.querySelector('.modal-backdrop, .onboarding-backdrop');
        if (backdrop) backdrop.style.display = 'none';
    });

    // 3. Verify Theme Toggle behavior and class consistency
    const themeBtn = page.locator('#theme-toggle, #btn-toggle-theme').first();
    await themeBtn.click({ force: true });
    await page.waitForTimeout(300);

    const toggledThemeState = await page.evaluate(() => ({
        hasLight: document.body.classList.contains('light-theme'),
        hasDark: document.body.classList.contains('dark-theme'),
        themeKey: localStorage.getItem('aquarevier_theme')
    }));

    // Ensure light-theme and dark-theme are NEVER simultaneously present
    expect(toggledThemeState.hasLight && toggledThemeState.hasDark).toBe(false);
    expect(toggledThemeState.themeKey).toBeTruthy();

    console.log('✓ Batch 1 Verification Passed: window.map set, window.layerDataStore populated, theme engine synchronized!');
});
