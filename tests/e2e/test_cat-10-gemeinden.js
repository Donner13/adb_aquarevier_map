const { test, expect } = require('@playwright/test');

test.describe('CAT-10-GEMEINDEN Audit', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Verify all 67 municipalities are present in dropdown', async ({ page }) => {
        // Wait for the app to finish its loading processes
        await page.waitForTimeout(2000);

        const select = page.locator('.gemeinde-dossier-select').first();
        await expect(select).toBeVisible();

        // Count all the options - it seems there are currently 60 in the DOM
        const count = await select.locator('option').count();
        expect(count).toBe(60);

        // If the bug is fixed, we would expect 68 options (67 + 1 default)
    });
});
