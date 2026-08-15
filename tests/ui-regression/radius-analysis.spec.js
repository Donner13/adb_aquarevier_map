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
      const select = page.locator('#radius-slider');
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


  test('debounce prevents extra runs and clears properly', async ({ page }) => {
    await gotoPage(page, 'internal.html');

    // Close modal if present
    await page.evaluate(() => {
      const m = document.getElementById('onboarding-role-modal');
      if(m) m.style.display = 'none';
    });

    await page.click('#btn-radius-activate');

    await page.evaluate(() => {
        window.runRadiusAnalysis(50, 6, 1000);
    });
    await page.waitForFunction(() => window.lastRadiusResults && window.lastRadiusResults.center);


    // Evaluate to mock the run function and track calls
    await page.evaluate(() => {
        window.analysisCallCount = 0;
        const originalRun = window.runRadiusAnalysis;
        window.runRadiusAnalysis = function(lat, lng, radius) {
            window.analysisCallCount++;
            originalRun(lat, lng, radius);
        };
    });

    const slider = page.locator('#radius-slider');

    // trigger input multiple times fast instantly
    await page.evaluate(() => {
        const sl = document.getElementById('radius-slider');
        sl.value = '3';
        sl.dispatchEvent(new Event('input', { bubbles: true }));
        sl.value = '4';
        sl.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Verify count before debounce triggers
    let countBefore = await page.evaluate(() => window.analysisCallCount);
    expect(countBefore).toBe(0);

    // Wait for debounce
    await page.waitForTimeout(200);

    // Verify count is 1 (debounced)
    let countAfter = await page.evaluate(() => window.analysisCallCount);
    expect(countAfter).toBe(1);

    // Now test clear
    await page.evaluate(() => {
        const sl = document.getElementById('radius-slider');
        sl.value = '1';
        sl.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Click clear immediately
    await page.evaluate(() => document.getElementById('btn-radius-clear').click());

    await page.waitForTimeout(200);

    // Should still be 1 (because the timer was cleared)
    let countFinal = await page.evaluate(() => window.analysisCallCount);
    expect(countFinal).toBe(1);
  });
});
}
