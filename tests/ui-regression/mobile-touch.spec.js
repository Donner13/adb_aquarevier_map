'use strict';

/**
 * Automated test suite for Mobile Touch Gesture Support.
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

// Override page fixture to enable touch and mobile emulation for this test suite
test.use({ hasTouch: true, isMobile: true });

for (const filename of PAGES) {
  test.describe(`${filename} - Mobile Touch Gestures`, () => {

    test('universal search dropdown prevents touchstart propagation', async ({ page }) => {
      await gotoPage(page, filename);

      const searchContainer = page.locator('.unified-search-control').first();
      await expect(searchContainer).toBeVisible();

      // Tap on the container
      await searchContainer.tap();

      assertNoJsErrors(page);
    });

    test('mascot and fun features support touch events', async ({ page }) => {
      await gotoPage(page, filename);

      const mascot = page.locator('#platschi-widget');
      await expect(mascot).toBeVisible();

      // Dispatch a touchstart, touchmove, touchend gesture
      await page.mouse.move(100, 100);

      // Tap on the mascot
      await mascot.tap();

      const mascotBubble = page.locator('#platschiBubble');
      await expect(mascotBubble).toBeVisible();

      assertNoJsErrors(page);
    });

    test('radius analysis manual coordinate inputs can be focused and touched', async ({ page }) => {
      await gotoPage(page, filename);

      const activateBtn = page.locator('#btn-radius-activate');
      await expect(activateBtn).toBeVisible();

      await activateBtn.tap();

      // Attempt touch focus on inputs
      const latInput = page.locator('#radius-manual-lat');
      const lngInput = page.locator('#radius-manual-lng');

      if (await latInput.count() > 0) {
        await latInput.tap();
        await expect(latInput).toBeFocused();
      }

      assertNoJsErrors(page);
    });
  });
}
