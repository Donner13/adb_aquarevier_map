const { test, expect } = require('@playwright/test');

test.describe('CAT-18-TOUR-I18N Audit Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure onboarding modal shows up
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    // Reload to trigger modal
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('Onboarding Modal elements should contain proposed i18n keys', async ({ page }) => {
    // Ensure modal is visible
    const modal = page.locator('#onboarding-role-modal');
    await expect(modal).toBeVisible();

    // Check that the title exists, and assert the PROPOSED state (verifying the audit proposal)
    const title = modal.locator('h2');
    await expect(title, 'Audit Finding: role modal title is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_modal_title');

    const subtitle = modal.locator('p', { hasText: 'Wähle deine Rolle' });
    await expect(subtitle, 'Audit Finding: role modal subtitle is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_modal_subtitle');

    const politics = modal.locator('h3', { hasText: 'Politik' });
    await expect(politics, 'Audit Finding: politics role is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_politics');

    const politicsDesc = modal.locator('.onboarding-role-card').filter({ hasText: 'Politik' }).locator('p');
    await expect(politicsDesc, 'Audit Finding: politics role desc is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_politics_desc');

    const admin = modal.locator('h3', { hasText: 'Verwaltung' });
    await expect(admin, 'Audit Finding: admin role is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_administration');

    const adminDesc = modal.locator('.onboarding-role-card').filter({ hasText: 'Verwaltung' }).locator('p');
    await expect(adminDesc, 'Audit Finding: admin role desc is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_administration_desc');

    const industry = modal.locator('h3', { hasText: 'Industrie' });
    await expect(industry, 'Audit Finding: industry role is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_industry');

    const industryDesc = modal.locator('.onboarding-role-card').filter({ hasText: 'Industrie' }).locator('p');
    await expect(industryDesc, 'Audit Finding: industry role desc is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_industry_desc');

    const citizens = modal.locator('h3', { hasText: 'Bürger' });
    await expect(citizens, 'Audit Finding: citizen role is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_citizen');

    const citizensDesc = modal.locator('.onboarding-role-card').filter({ hasText: 'Bürger' }).locator('p');
    await expect(citizensDesc, 'Audit Finding: citizen role desc is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.role_citizen_desc');

    const skipBtn = modal.locator('a', { hasText: 'Überspringen' });
    await expect(skipBtn, 'Audit Finding: skip button is missing data-i18n-key').toHaveAttribute('data-i18n-key', 'onboarding.skip_role');
  });

  test('Coachmark Tour strings should be i18n integrated', async ({ page }) => {
    // Start tour bypass
    const modal = page.locator('#onboarding-role-modal');
    await expect(modal).toBeVisible();
    await page.locator('.onboarding-role-card').filter({ hasText: 'Politik' }).click();

    const overlay = page.locator('#coachmark-overlay');
    await expect(overlay).toBeVisible();

    // Verify translated contents based on current language or check for key integration
    // Since this is a test against the proposed future state, we verify it doesn't fail
    const title = page.locator('#coachmark-title');
    await expect(title).toBeVisible();

    // We expect the text to be dynamically translated. For the audit, we assert the
    // expected translated strings are present when language changes.
    // Or assert that it's no longer the exact hardcoded default text if we mock a lang change.
    // In strict audit, we can assert on a data attribute if implemented that way, or verify the text is from the translation map.
    await expect(title, 'Audit Finding: Coachmark title is missing data-i18n-key or programmatic translation').toHaveAttribute('data-i18n-key');

    const text = page.locator('#coachmark-text');
    await expect(text, 'Audit Finding: Coachmark text is missing data-i18n-key').toHaveAttribute('data-i18n-key');

    const nextBtn = page.locator('#coachmark-next-btn');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn, 'Audit Finding: Coachmark next button is missing data-i18n-key').toHaveAttribute('data-i18n-key');

    const skipBtn = page.locator('.coachmark-skip');
    await expect(skipBtn, 'Audit Finding: Coachmark skip button is missing data-i18n-key').toHaveAttribute('data-i18n-key');

    const progress = page.locator('#coachmark-progress');
    await expect(progress, 'Audit Finding: Coachmark progress is missing data-i18n-key').toHaveAttribute('data-i18n-key');
  });
});
