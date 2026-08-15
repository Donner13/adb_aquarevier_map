const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test('index.html and internal.html load successfully under 10s', async ({ page }) => {
    test.setTimeout(10000); // Enforce strictly under 10 seconds for BOTH pages combined

    // 1. Check index.html
    await gotoPage(page, 'index.html');
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();

    // Verify basemap (TileLayer) is present in the global map object
    let hasBasemap = await page.evaluate(() => {
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
    expect(hasBasemap).toBe(true);

    // 2. Check internal.html
    await gotoPage(page, 'internal.html');
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();

    // Verify basemap (TileLayer) is present in the global map object
    hasBasemap = await page.evaluate(() => {
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
    expect(hasBasemap).toBe(true);
  });
});
