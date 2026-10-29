const { test, expect } = require('@playwright/test');

test.describe('Editor: Export Styles (TASK-16)', () => {
    test('should expose exportStyleSettings function', async ({ page }) => {
        await page.goto('http://127.0.0.1:8000/internal.html');

        // Wait for the button to be visible
        const exportBtn = page.locator('#btn-export-styles');
        await expect(exportBtn).toBeVisible();

        // Also verify the script was loaded properly by checking for the function existence
        const funcExists = await page.evaluate(() => {
            return typeof window.exportStyleSettings === 'function';
        });
        expect(funcExists).toBeTruthy();
    });
});
