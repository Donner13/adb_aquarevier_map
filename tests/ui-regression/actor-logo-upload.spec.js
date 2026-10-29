const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Actor Logo Upload', () => {
    let testImagePath;

    test.beforeEach(async ({ page }) => {
        await page.goto('/internal.html');

        // Bypass onboarding modal if it exists
        try {
            await page.evaluate(() => {
                const onboarding = document.getElementById('onboarding-role-modal');
                if (onboarding) onboarding.style.display = 'none';
                const infoModal = document.getElementById('infoModal');
                if (infoModal) infoModal.style.display = 'none';
            });
        } catch (e) {
            // ignore
        }

        testImagePath = path.join(__dirname, 'test-logo.png');
        // Simple 1x1 transparent PNG base64
        const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        fs.writeFileSync(testImagePath, Buffer.from(transparentPngBase64, 'base64'));
    });

    test.afterEach(() => {
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    });

    test('should allow uploading an image file and set base64 string to logo input', async ({ page }) => {
        // Wait for the UI to load
        await page.waitForSelector('#contact-logo', { state: 'visible' });

        // Ensure the upload container and button were injected by the script
        const uploadBtn = await page.waitForSelector('button:has-text("Datei hochladen")');
        expect(uploadBtn).not.toBeNull();

        // Check file input exists
        const fileInput = await page.locator('#contact-logo-upload');
        await expect(fileInput).toHaveCount(1);

        // Upload the file
        await fileInput.setInputFiles(testImagePath);

        // Check if the logo input has been updated with a base64 string
        const logoInput = page.locator('#contact-logo');
        await expect(logoInput).toHaveValue(/^data:image\/png;base64,/);
    });
});
