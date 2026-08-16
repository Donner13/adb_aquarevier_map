'use strict';
/**
 * Smoke test to verify index.html and internal.html load properly
 * and basic map initialization succeeds within the required 10s timeframe.
 */

const { test, expect, gotoPage } = require('./fixtures');

test.describe('CI Smoke-Test', () => {
  test('index.html loads map', async ({ page }) => {
    await gotoPage(page, 'index.html');
    await expect(page).toHaveTitle(/Akteurskarte/);
    const map = page.locator('#map');
    await expect(map).toBeAttached();
    await expect(page.locator('.leaflet-tile-pane')).toBeAttached({ timeout: 10000 });
  });

  test('internal.html loads map', async ({ page }) => {
    await gotoPage(page, 'internal.html');
    await expect(page).toHaveTitle(/Akteurskarte Editor/);
    const map = page.locator('#map');
    await expect(map).toBeAttached();
    await expect(page.locator('.leaflet-tile-pane')).toBeAttached({ timeout: 10000 });
  });
});
