'use strict';

/**
 * Automated test suite for Batch 1 Platform Improvements:
 * Universal Search, QR-Code Sharing, Bookmarks/Favorites, Network Status Indicator.
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`${filename} - Batch 1 Features`, () => {

    test('bookmarks and QR share UI controls are present', async ({ page }) => {
      await gotoPage(page, filename);

      const statusBadge = page.locator('#network-status-badge');
      const bookmarksContainer = page.locator('#bookmarks-list-container');

      await expect(statusBadge).toBeVisible();
      await expect(bookmarksContainer).toBeVisible();
      await expect(statusBadge).toContainText('Online');

      assertNoJsErrors(page);
    });

    test('programmatic bookmark creation and retrieval works', async ({ page }) => {
      await gotoPage(page, filename);

      await page.evaluate(() => {
        window.saveBookmark('Test Revier Favorit');
      });

      const bookmarksContainer = page.locator('#bookmarks-list-container');
      await expect(bookmarksContainer).toContainText('Test Revier Favorit');

      assertNoJsErrors(page);
    });

    test('QR share modal opens and displays deep-link input', async ({ page }) => {
      await gotoPage(page, filename);

      await page.evaluate(() => {
        window.openQrShareModal();
      });

      const modal = page.locator('#qr-share-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('QR-Code & Deep-Link Teilen');

      const deepLinkInput = page.locator('#qr-deeplink-input');
      await expect(deepLinkInput).toBeVisible();
      const val = await deepLinkInput.inputValue();
      expect(val).toContain('lat=');

      await page.evaluate(() => {
        window.closeQrShareModal();
      });
      await expect(modal).toBeHidden();

      assertNoJsErrors(page);
    });

    test('universal search query returns valid matches', async ({ page }) => {
      await gotoPage(page, filename);

      const results = await page.evaluate(() => {
        return window.queryUniversalSearch('Aachen');
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Aachen');

      assertNoJsErrors(page);
    });

  });
}
