const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8012;

test.beforeAll(async () => {
    server = http.createServer((req, res) => {
        let filePath = path.join(__dirname, '../..', req.url.split('?')[0]);
        if (filePath.endsWith('/')) filePath = path.join(filePath, 'internal.html');

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

test('Batch 2: HTML Toolbar & Structure Synchronization on internal.html', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/internal.html`);
    await page.waitForTimeout(1000);

    // 1. Verify #reset-filters-btn exists on internal.html
    const resetBtn = page.locator('#reset-filters-btn');
    await expect(resetBtn).toBeVisible();

    // 2. Verify #share-view-btn exists on internal.html
    const shareBtn = page.locator('#share-view-btn');
    await expect(shareBtn).toBeVisible();

    // 3. Verify export buttons exist in DOM on internal.html
    const exportIds = ['export-csv-btn', 'export-pdf-btn', 'open-data-export-btn', 'embed-open-btn', 'generate-report-btn'];
    for (const id of exportIds) {
        const count = await page.locator(`#${id}`).count();
        expect(count).toBeGreaterThan(0);
    }

    // 4. Verify external portal links exist on internal.html
    const extPortalCount = await page.locator('.external-portal-link').count();
    expect(extPortalCount).toBeGreaterThan(0);

    // 5. Verify system-health-badge position does not overlap reset button
    const healthBadge = page.locator('#system-health-badge');
    if (await healthBadge.count() > 0) {
        const badgeBox = await healthBadge.boundingBox();
        const resetBox = await resetBtn.boundingBox();
        if (badgeBox && resetBox) {
            const overlap = !(badgeBox.x + badgeBox.width < resetBox.x ||
                              resetBox.x + resetBox.width < badgeBox.x ||
                              badgeBox.y + badgeBox.height < resetBox.y ||
                              resetBox.y + resetBox.height < badgeBox.y);
            expect(overlap).toBe(false);
        }
    }

    console.log('✓ Batch 2 Verification Passed: internal.html toolbar and buttons fully synchronized!');
});
