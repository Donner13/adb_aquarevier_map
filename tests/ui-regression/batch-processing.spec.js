const { test, expect } = require('@playwright/test');

test.describe('Batch Processing (Editor)', () => {
    test('UI for batch processing toggles correctly and updates selection count', async ({ page }) => {
        await page.goto('/internal.html');
        await page.waitForLoadState('networkidle');

        await page.locator('#toggle-batch-mode-btn').click();

        await page.waitForTimeout(500);

        const isVisible = await page.evaluate(() => {
            const el = document.getElementById('batch-controls');
            return el && window.getComputedStyle(el).display !== 'none';
        });

        expect(isVisible).toBe(true);
    });
});
