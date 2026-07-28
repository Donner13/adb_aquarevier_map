'use strict';

/**
 * Automated test suite for the Gemeinde-Steckbrief (Municipal Dossier Tool).
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`${filename} - Gemeinde Steckbrief`, () => {

    test('gemeinde selector control is present', async ({ page }) => {
      await gotoPage(page, filename);

      const select = page.locator('.gemeinde-dossier-select');
      await expect(select).toBeVisible();

      // Wait for options to be populated
      await page.waitForFunction(() => {
        const sel = document.querySelector('.gemeinde-dossier-select');
        return sel && sel.options.length > 1;
      }, { timeout: 10000 });

      const count = await select.locator('option').count();
      expect(count).toBeGreaterThan(1);

      assertNoJsErrors(page);
    });

    test('selecting a municipality opens the dossier modal', async ({ page }) => {
      await gotoPage(page, filename);

      await page.waitForFunction(() => {
        const sel = document.querySelector('.gemeinde-dossier-select');
        return sel && sel.options.length > 1;
      }, { timeout: 10000 });

      // Programmatically trigger dossier for Aachen or Eschweiler
      await page.evaluate(() => {
        window.openGemeindeDossier('Aachen');
      });

      const modal = page.locator('#gemeinde-dossier-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Gemeinde-Steckbrief: Aachen');

      // Test closing modal
      await page.evaluate(() => {
        window.closeGemeindeDossier();
      });
      await expect(modal).toBeHidden();

      assertNoJsErrors(page);
    });

  });
}
