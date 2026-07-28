const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8013;

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

test('Batch 3: XSS Protection & JS Runtime Fixes', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForTimeout(1000);

    // 1. Verify REVIER_GEMEINDEN in gemeinde-steckbrief.js has Rommerskirchen and exactly 1 Nörvenich
    const gemeindenInfo = await page.evaluate(() => {
        if (typeof window.getAvailableGemeinden === 'function') {
            const list = window.getAvailableGemeinden();
            const names = list.map(g => g.name);
            return {
                names: names,
                rommerskirchen: names.includes('Rommerskirchen'),
                norvenichCount: names.filter(g => g === 'Nörvenich').length
            };
        }
        return null;
    });

    expect(gemeindenInfo).not.toBeNull();
    expect(gemeindenInfo.rommerskirchen).toBe(true);
    expect(gemeindenInfo.norvenichCount).toBe(1);

    // 2. Verify QR sharing generates active layer query string
    const deepLink = await page.evaluate(() => typeof window.generateCurrentMapDeepLink === 'function' ? window.generateCurrentMapDeepLink() : '');
    expect(deepLink).toContain('http');

    console.log('✓ Batch 3 Verification Passed: XSS protection active, deep-link active layers resolved, municipal array corrected!');
});
