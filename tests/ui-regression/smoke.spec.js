const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test('index.html and internal.html load successfully under 10s', async ({ page }) => {
    test.setTimeout(10000); // Enforce strictly under 10 seconds for BOTH pages combined

    // 1. Check index.html
    const tileResponse1 = page.waitForResponse(res =>
      res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')
    );
    await gotoPage(page, 'index.html');
    const res1 = await tileResponse1;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res1.ok()).toBe(true);

    // Verify basemap configuration via global map object
    // Note: While Leaflet's `_url` is private, WMS layers also do not have public URL getters.
    // However, the `waitForResponse` check above independently guarantees standard tile delivery.
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


    // 2. Check internal.html
    const tileResponse2 = page.waitForResponse(res =>
      res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')
    );
    await gotoPage(page, 'internal.html');
    const res2 = await tileResponse2;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res2.ok()).toBe(true);

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
  });
});
