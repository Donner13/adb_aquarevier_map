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

  test('Onboarding Modal contains translation keys', async ({ page }) => {
    // Ensure modal is visible
    const modal = page.locator('#onboarding-role-modal');
    await expect(modal).toBeVisible();

    // Check for translation keys (assuming they were implemented as proposed)
    const title = modal.locator('h2');
    await expect(title).toHaveAttribute('data-i18n-key', 'onboarding.role_modal_title');

    const politics = modal.locator('h3', { hasText: 'Politik' });
    await expect(politics).toHaveAttribute('data-i18n-key', 'onboarding.role_politics');

    const admin = modal.locator('h3', { hasText: 'Verwaltung' });
    await expect(admin).toHaveAttribute('data-i18n-key', 'onboarding.role_administration');

    const industry = modal.locator('h3', { hasText: 'Industrie' });
    await expect(industry).toHaveAttribute('data-i18n-key', 'onboarding.role_industry');

    const citizens = modal.locator('h3', { hasText: 'Bürger' });
    await expect(citizens).toHaveAttribute('data-i18n-key', 'onboarding.role_citizen');
  });

  test('Coachmark Tour string references logic', async ({ page }) => {
    // Start tour
    await page.evaluate(() => {
        window.closeRoleModal();
        window.startCoachmarkTour(1);
    });

    const overlay = page.locator('#coachmark-overlay');
    await expect(overlay).toBeVisible();

    const title = page.locator('#coachmark-title');
    // We expect it to have either a data-i18n-key OR be translated programmatically
    await expect(title).toBeVisible();

    const nextBtn = page.locator('#coachmark-next-btn');
    await expect(nextBtn).toBeVisible();
  });
});
