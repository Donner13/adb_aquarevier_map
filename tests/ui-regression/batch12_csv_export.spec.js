const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8017;

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

test.describe('Batch 12: Editor CSV Export', () => {
    test('internal.html can export full PII contacts to CSV', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());

        await page.goto(`http://localhost:${PORT}/internal.html`);
        await page.waitForTimeout(1000);

        const btn = page.locator('#btn-export-csv');
        await expect(btn).toBeVisible();

        const exported = await page.evaluate(() => {
            window.geojsonData = {
                features: [{
                    properties: { name: 'Test User', email: 'test@example.com', phone: '+49123456' },
                    geometry: { type: 'Point', coordinates: [6.5, 51.5] }
                }]
            };
            return typeof window.exportFullPIIToCSV === 'function';
        });

        expect(exported).toBe(true);

        const [ download ] = await Promise.all([
            page.waitForEvent('download'),
            page.evaluate(() => window.exportFullPIIToCSV())
        ]);

        const downPath = await download.path();
        const content = fs.readFileSync(downPath, 'utf8');

        expect(content).toContain('Exportdatum');
        expect(content).toContain('Breitengrad');
        expect(content).toContain('Längengrad');
        expect(content).toContain('test@example.com');
    });
});
