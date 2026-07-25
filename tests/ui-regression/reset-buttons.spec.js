'use strict';
/**
 * Bulk-action reset buttons (#btn-layers-all / #btn-layers-none). The
 * previous Python suite only ever simulated "all layers on/off" by
 * clicking each button individually in a loop - it never actually
 * exercised these two dedicated bulk-action buttons, which is a real
 * coverage gap the backlog #8 scope-correction (section 4, point 2)
 * calls out explicitly. Kept as a separate spec file per the backlog's
 * suggested tests/ui-regression/ layout.
 */

const { test, expect, gotoPage, assertNoJsErrors, layerButton, isButtonActive, mapHasLayer } = require('./fixtures');
const { PAGES, ALL_LAYERS, BULK_TOGGLE_LAYERS } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(filename, () => {
    test('"Alle an" activates every layer', async ({ page }) => {
      await gotoPage(page, filename);
      await page.locator('#btn-layers-all').click();
      await page.waitForLoadState('networkidle');

      for (const name of Object.keys(BULK_TOGGLE_LAYERS)) {
        expect(await isButtonActive(page, name), `${name}: not active after #btn-layers-all`).toBe(true);
        expect(await mapHasLayer(page, name), `${name}: map layer missing after #btn-layers-all`).toBe(true);
      }
      // #hazard-layer-group is deliberately excluded from the bulk toggle
      // (see layer-data.js HAZARD_LAYERS) - must stay untouched.
      for (const name of Object.keys(ALL_LAYERS)) {
        if (name in BULK_TOGGLE_LAYERS) continue;
        expect(await isButtonActive(page, name), `${name}: hazard layer wrongly activated by #btn-layers-all`).toBe(false);
      }
      assertNoJsErrors(page);
    });

    test('"Alle aus" deactivates every layer', async ({ page }) => {
      await gotoPage(page, filename);
      await page.locator('#btn-layers-all').click();
      await page.waitForLoadState('networkidle');
      await page.locator('#btn-layers-none').click();
      await page.waitForLoadState('networkidle');

      for (const name of Object.keys(ALL_LAYERS)) {
        expect(await isButtonActive(page, name), `${name}: still active after #btn-layers-none`).toBe(false);
        expect(await mapHasLayer(page, name), `${name}: map layer still present after #btn-layers-none`).toBe(false);
      }
      assertNoJsErrors(page);
    });

    test('reset buttons do not disturb the actor/branche filter groups', async ({ page }) => {
      // Regression guard from backlog #8 section 5.4: a new sidebar
      // section must not break the pre-existing filter buttons.
      await gotoPage(page, filename);
      const actorBtn = page.locator('.filter-btn[data-group]').first();
      const beforeClass = await actorBtn.getAttribute('class');

      await page.locator('#btn-layers-all').click();
      await page.waitForLoadState('networkidle');
      await page.locator('#btn-layers-none').click();
      await page.waitForLoadState('networkidle');

      const afterClass = await actorBtn.getAttribute('class');
      expect(afterClass).toBe(beforeClass);
      assertNoJsErrors(page);
    });
  });
}
