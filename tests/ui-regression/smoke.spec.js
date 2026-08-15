const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  // Since both pages test similar behaviors sequentially, run them as separate tests
  // to give each its own 10-second timeout budget rather than stacking them and flaking on slow CI nodes.
  test.describe.configure({ timeout: 10000 });

  test('index.html loads successfully under 10s', async ({ page }) => {
    // 1. Check index.html
    // Use the exact regex that fixtures.js intercepts to guarantee we only catch local mocked responses
    const tileResponsePromise = page.waitForResponse(
      res => /basemaps\.cartocdn\.com|tile\.openstreetmap\.org|wms\.nrw\.de|cismet\.de/.test(res.url()),
      { timeout: 5000 }
    );

    await gotoPage(page, 'index.html');
    const res1 = await tileResponsePromise;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res1.ok()).toBe(true);

    // Verify basemap configuration via global map object.
    // In this legacy application architecture (see memory/backlog context), Leaflet `map` is explicitly
    // initialized as a global, non-module variable.
    const hasBasemapConfig = await page.evaluate(() => {
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

  test('internal.html loads successfully under 10s', async ({ page }) => {
    // 2. Check internal.html
    const tileResponsePromise = page.waitForResponse(
      res => /basemaps\.cartocdn\.com|tile\.openstreetmap\.org|wms\.nrw\.de|cismet\.de/.test(res.url()),
      { timeout: 5000 }
    );

    await gotoPage(page, 'internal.html');
    const res2 = await tileResponsePromise;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res2.ok()).toBe(true);

    // Verify basemap configuration via global map object
    const hasBasemapConfig = await page.evaluate(() => {
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
