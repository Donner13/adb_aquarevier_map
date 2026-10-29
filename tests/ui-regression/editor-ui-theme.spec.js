const { test, expect } = require('@playwright/test');

test('Editor UI Theme Customizer', async ({ page }) => {
    // Force a desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to the internal editor page
    await page.goto('/internal.html');

    // Bypass any onboarding modal
    await page.evaluate(() => {
        const onboarding = document.getElementById('onboarding-role-modal');
        if (onboarding) onboarding.style.display = 'none';

        const infoModal = document.getElementById('infoModal');
        if (infoModal) infoModal.style.display = 'none';
    });

    // Wait a bit to ensure setup completes and rendering happens
    await page.waitForTimeout(1000);

    // Open Customizer Panel if it's not visible
    const customizerPanel = page.locator('#customizer-panel');
    const isVisible = await customizerPanel.isVisible();
    if (!isVisible) {
        await page.evaluate(() => {
            if (typeof toggleCustomizerPanel === 'function') toggleCustomizerPanel();
        });
    }

    // Check if new inputs are present
    const bgBaseInput = page.locator('#cfg-theme-bgBase');
    const borderColorInput = page.locator('#cfg-theme-borderColor');

    await bgBaseInput.waitFor({ state: 'attached', timeout: 5000 });
    await expect(bgBaseInput).toBeAttached();

    // Verify it created properly
    expect(await bgBaseInput.count()).toBe(1);
});
