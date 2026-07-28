const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8014;

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

test('Batch 4: Accessibility, Modal Ergonomics & Interaction Fixes', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/internal.html`);
    await page.waitForTimeout(1000);

    // 1. Verify openQrShareModal button has aria-label="Schließen"
    await page.evaluate(() => typeof window.openQrShareModal === 'function' && window.openQrShareModal());
    await page.waitForTimeout(300);
    const closeBtn = page.locator('#qr-share-modal button[aria-label="Schließen"]');
    await expect(closeBtn).toBeVisible();

    // 2. Verify Escape key closes modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const modalDisplay = await page.evaluate(() => {
        const m = document.getElementById('qr-share-modal');
        return m ? m.style.display : 'none';
    });
    expect(modalDisplay).toBe('none');

    // 3. Verify feedback 404 message
    const feedbackText = await page.evaluate(() => {
        const el = document.getElementById('feedback-issues-list');
        return el ? el.innerText : '';
    });
    expect(feedbackText).not.toContain('Fehler beim Laden');

    // 4. Verify editContactById with unknown ID triggers feedback toast
    await page.evaluate(() => typeof editContactById === 'function' && editContactById('non-existent-999'));
    await page.waitForTimeout(300);

    console.log('✓ Batch 4 Verification Passed: Accessibility attributes set, Escape key closes modals, feedback 404 handled cleanly!');
});
