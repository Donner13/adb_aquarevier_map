'use strict';

/**
 * Automated test suite for the Umkreis- & Radius-Analyse (Spatial Query Tool).
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`${filename} - Radius Analysis`, () => {

    test('radius UI controls are present', async ({ page }) => {
      await gotoPage(page, filename);

      const activateBtn = page.locator('#btn-radius-activate');
      const clearBtn = page.locator('#btn-radius-clear');
      const select = page.locator('#radius-select');
      const statusInfo = page.locator('#radius-status-info');

      await expect(activateBtn).toBeVisible();
      await expect(clearBtn).toBeVisible();
      await expect(clearBtn).toBeDisabled();
      await expect(select).toBeVisible();
      await expect(statusInfo).toBeVisible();

      assertNoJsErrors(page);
    });

    test('activating mode changes UI state', async ({ page }) => {
      await gotoPage(page, filename);

      const activateBtn = page.locator('#btn-radius-activate');
      const statusInfo = page.locator('#radius-status-info');

      await activateBtn.click();
      await expect(activateBtn).toContainText('Klicke auf Karte...');
      await expect(statusInfo).toContainText('Aktiv');

      assertNoJsErrors(page);
    });

    test('running radius analysis programmatically renders results', async ({ page }) => {
      await gotoPage(page, filename);

      // Run radius analysis centered on Eschweiler / Rur region (50.8, 6.26)
      await page.evaluate(() => {
        window.runRadiusAnalysis(50.81, 6.26, 5000);
      });

      const resultsContainer = page.locator('#radius-results-container');
      await expect(resultsContainer).toBeVisible();

      const statusInfo = page.locator('#radius-status-info');
      await expect(statusInfo).toContainText('Treffer');

      const clearBtn = page.locator('#btn-radius-clear');
      await expect(clearBtn).toBeEnabled();

      // Test clearing
      await clearBtn.click();
      await expect(resultsContainer).toBeHidden();
      await expect(clearBtn).toBeDisabled();

      assertNoJsErrors(page);
    });

  });
}
