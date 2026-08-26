const { test, expect } = require('@playwright/test');

test.describe('CAT-19-GLOSSAR-I18N Audit Tests', () => {
  test('Verify glossary translation structure in proposal', async () => {
    const fs = require('fs');
    const path = require('path');
    const proposalPath = path.join(__dirname, '../../proposals/cat-19-glossar-i18n_audit.json');

    expect(fs.existsSync(proposalPath)).toBeTruthy();
    const proposalData = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));

    expect(proposalData.description).toBe('CAT-19-GLOSSAR-I18N Audit Report and Translation Proposal');
    expect(proposalData.missingTranslations).toBeDefined();

    const translations = proposalData.missingTranslations;
    expect(translations.NQ.en).toContain('Low water discharge');
    expect(translations.MNQ.en).toContain('Mean low water discharge');
  });

  test('Verify glossary tooltips correctly switch language in the UI (Future Implementation)', async ({ page }) => {
    // Audit task: write the test to assert the *desired* future state, even if they currently fail.
    // Do not intentionally write tests asserting the *incorrect* current state just to force them to pass.

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Bypass onboarding modal to ensure interactions are unblocked
    await page.evaluate(() => {
        window.localStorage.setItem('onboardingComplete', 'true');
        window.localStorage.setItem('userRole', 'expert');
    });
    // Force reload with settings applied
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Enable layman mode to show glossary icons
    await page.evaluate(() => {
        localStorage.setItem('laien-mode-active', 'true');
        document.body.classList.add('laien-mode');
    });

    // Wait for the layout to apply
    await page.waitForTimeout(500);

    // Open the left sidebar layers accordion if needed to see some icons
    const layersBtn = page.locator('#btn-layers-accordion');
    if (await layersBtn.isVisible()) {
        await layersBtn.click();
    }
    await page.waitForTimeout(500);

    // Assert that glossar icons exist and are visible
    const glossaryIcon = page.locator('.glossar-icon').first();
    await expect(glossaryIcon).toBeVisible({ timeout: 5000 });

    // Assert the data-glossar attribute matches a known key (e.g. GRUNDWASSERMESSSTELLE)
    const key = await glossaryIcon.getAttribute('data-glossar');
    expect(key).toBeTruthy();

    // Evaluate the global GLOSSAR_BEGRIFFE to ensure it has the expected future i18n structure
    // e.g. { NQ: { de: "...", en: "..." } }
    const hasI18nStructure = await page.evaluate((k) => {
        // Assert the desired future state (it currently fails as it is a string)
        if (typeof window.GLOSSAR_BEGRIFFE === 'undefined') return false;
        const entry = window.GLOSSAR_BEGRIFFE[k];
        return typeof entry === 'object' && entry !== null && 'de' in entry && 'en' in entry;
    }, key);

    // This will fail in the current implementation, which is correct for an audit.
    expect(hasI18nStructure).toBeTruthy();
  });
});
