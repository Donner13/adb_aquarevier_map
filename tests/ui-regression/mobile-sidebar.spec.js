/**
 * Playwright UI regression suite for the responsive sidebar collapse behavior.
 * Addresses [Batch-60 Task 15/60] Unit Test Layer 15: Responsive Sidebar Collapse.
 */
const { test, expect, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`Responsive Sidebar Collapse on ${filename}`, () => {

    // Simulate a narrow viewport (e.g. mobile device)
    test.use({ viewport: { width: 500, height: 800 } });

    test('sidebar collapses and toggles on narrow viewport', async ({ page }) => {
      // Because the sidebar is initially hidden on narrow viewports, we cannot
      // use the default `gotoPage` fixture directly, as it waits for
      // `.filter-btn[data-layer-name]` to be visible (which fails when sidebar is hidden).
      // We replicate the necessary initialization and readiness checks here.
      await page.addInitScript(() => {
        localStorage.setItem('aquarevier_onboarding_completed_v1', '1');
        localStorage.setItem('aquarevier_platschi_fact_date', new Date().toDateString());
      });
      await page.goto(`/${filename}`, { waitUntil: 'domcontentloaded' });

      // Wait for the Leaflet map and core functionality to be ready
      await page.waitForFunction(() =>
        window.map &&
        typeof window.map.hasLayer === 'function' &&
        window.aquarevierCoreReady === true
      );

      const sidebar = page.locator('#sidebar');
      const mobileToggle = page.locator('#mobile-sidebar-toggle');

      // Verify that the mobile toggle button is visible on narrow viewports
      await expect(mobileToggle).toBeVisible();

      // Verify that the body does NOT have the 'mobile-sidebar-open' class initially
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass || '').not.toContain('mobile-sidebar-open');

      // Verify the sidebar itself is hidden initially
      await expect(sidebar).not.toBeVisible();

      // Open the sidebar by clicking the toggle
      await mobileToggle.click();

      // Verify the sidebar becomes visible and the body receives the correct class
      const bodyClassAfter = await page.locator('body').getAttribute('class');
      expect(bodyClassAfter || '').toContain('mobile-sidebar-open');
      await expect(sidebar).toBeVisible();

      // Close the sidebar by clicking the toggle again
      await mobileToggle.click();

      // Verify the sidebar hides again and the body class is removed
      const bodyClassClosed = await page.locator('body').getAttribute('class');
      expect(bodyClassClosed || '').not.toContain('mobile-sidebar-open');
      await expect(sidebar).not.toBeVisible();

      assertNoJsErrors(page);
    });
  });
}
