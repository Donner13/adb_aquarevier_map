'use strict';

/**
 * Automated test suite for Batch 2 Platform Improvements:
 * Dark Mode Theme Switcher, AI Natural Query Assistant, WRRL Water Quality Indicator, Keyboard Shortcuts.
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`${filename} - Batch 2 Features`, () => {

    test('dark mode toggles theme state and CSS class', async ({ page }) => {
      await gotoPage(page, filename);

      await page.evaluate(() => {
        window.toggleDarkMode();
      });

      const body = page.locator('body');
      await expect(body).toHaveClass(/dark-theme/);

      await page.evaluate(() => {
        window.toggleDarkMode();
      });

      assertNoJsErrors(page);
    });

    test('ai assistant modal opens and responds to queries', async ({ page }) => {
      await gotoPage(page, filename);

      await page.evaluate(() => {
        window.openAiAssistantModal();
      });

      const modal = page.locator('#ai-assistant-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Frag die AquaRevier-Karte');

      await page.evaluate(() => {
        window.askAiQuestion('Kläranlagen');
      });

      const answerBox = page.locator('#ai-answer-box');
      await expect(answerBox).toBeVisible();
      await expect(answerBox).toContainText('Ergebnisse für Kläranlagen');

      await page.evaluate(() => {
        window.closeAiAssistantModal();
      });
      await expect(modal).toBeHidden();

      assertNoJsErrors(page);
    });

    test('wrrl water quality modal opens and displays river ratings', async ({ page }) => {
      await gotoPage(page, filename);

      await page.evaluate(() => {
        window.openWrrlQualityModal('Rur');
      });

      const modal = page.locator('#wrrl-quality-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('WRRL-Gewässergüte: Rur');

      await page.evaluate(() => {
        window.closeWrrlQualityModal();
      });
      await expect(modal).toBeHidden();

      assertNoJsErrors(page);
    });

  });
}
