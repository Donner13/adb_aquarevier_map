const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test('index.html and internal.html load successfully under 10s', async ({ page }) => {
    test.setTimeout(10000); // Enforce strictly under 10 seconds for BOTH pages combined

    // Network tracking for basemap tiles
    let basemapTilesLoaded = 0;
    let basemapTilesFailed = 0;
    const tileHostRe = /basemaps\.cartocdn\.com|tile\.openstreetmap\.org/;

    page.on('response', (response) => {
      if (tileHostRe.test(response.url())) {
        if (response.ok()) {
          basemapTilesLoaded++;
        } else {
          basemapTilesFailed++;
        }
      }
    });

    // 1. Check index.html
    await gotoPage(page, 'index.html');
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();

    // Verify basemap configuration via global map object
    let hasBasemapConfig = await page.evaluate(() => {
      let found = false;
      if (typeof map !== 'undefined') {
        map.eachLayer((layer) => {
          if (layer && layer._url && (layer._url.includes('basemaps.cartocdn.com') || layer._url.includes('openstreetmap'))) {
            found = true;
          }
        });
      }
      return found;
    });
    expect(hasBasemapConfig).toBe(true);
    expect(basemapTilesLoaded).toBeGreaterThan(0);
    expect(basemapTilesFailed).toBe(0);

    // Reset counters for the second page
    basemapTilesLoaded = 0;
    basemapTilesFailed = 0;

    // 2. Check internal.html
    await gotoPage(page, 'internal.html');
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();

    // Verify basemap configuration via global map object
    hasBasemapConfig = await page.evaluate(() => {
      let found = false;
      if (typeof map !== 'undefined') {
        map.eachLayer((layer) => {
          if (layer && layer._url && (layer._url.includes('basemaps.cartocdn.com') || layer._url.includes('openstreetmap'))) {
            found = true;
          }
        });
      }
      return found;
    });
    expect(hasBasemapConfig).toBe(true);
    expect(basemapTilesLoaded).toBeGreaterThan(0);
    expect(basemapTilesFailed).toBe(0);
  });
});
