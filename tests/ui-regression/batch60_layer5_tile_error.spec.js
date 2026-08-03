const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8016;

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

test('Batch 60: Layer 5 Tile Loading Error Handler behavior', async ({ page }) => {
    let failedWmsTileCount = 0;

    // Bypass onboarding modal via localStorage
    await page.addInitScript(() => {
        localStorage.setItem('aquarevier_onboarding_completed_v1', '1');
    });

    // Mock basemap requests successfully so they don't pollute the counter
    const PLACEHOLDER_TILE_PNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    );
    await page.route(/basemaps\.cartocdn\.com|tile\.openstreetmap\.org|sgx\.geodatenzentrum\.de/, async route => {
        await route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_TILE_PNG });
    });

    // Setup 404 interception specifically for the WMS layer under test
    await page.route(/wms\.nrw\.de|cismet\.de/, async route => {
        failedWmsTileCount++;
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found' });
    });

    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));

    await page.goto(`http://localhost:${PORT}/index.html`);

    // Enable a WMS layer to trigger tile loading
    const layerName = 'Tagebaue & Bergbaufelder (GD)';
    await page.waitForSelector('.filter-btn[data-layer-name]');
    const btn = page.locator(`.filter-btn[data-layer-name="${layerName}"]`);
    await btn.click();

    // Wait for the WMS request to fail
    await page.waitForTimeout(2000);

    // 1. Assert that specific WMS tile requests failed and we intercepted them
    expect(failedWmsTileCount).toBeGreaterThan(0);

    // 2. Assert no uncaught JS exceptions occurred (app shouldn't crash)
    expect(pageErrors.length).toBe(0);

    // 3. Document missing fallback/error handling (current state):
    // The tileerror handler is NOT implemented yet, so no warning toast is shown.
    const toasts = await page.locator('.aqua-toast-warning').count();
    expect(toasts, 'Tile loading error toast is NOT currently shown (missing feature)').toBe(0);

    console.log('✓ Batch 60 Verification Passed: Specific WMS tile loading failure handled without crashing, missing tileerror handler verified!');
});
