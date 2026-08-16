const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  // Test requirement: "Erstelle ein ... Smoke-Test Script, das in unter 10 Sekunden das Laden von index.html, internal.html und der Basiskarte bestaetigt."
  // Run sequentially, but aggressively prune any unnecessary awaits or external delays to stay inside 10 seconds.
  test('index.html and internal.html load successfully total under 10s', async ({ page }) => {
    test.setTimeout(10000);

    const waitOpts = { timeout: 4500 }; // Fail fast to stay inside budget
    // Match only carto or osm, aligning strictly with the global map check below
    const tileMatcher = res => /basemaps\.cartocdn\.com|tile\.openstreetmap\.org/.test(res.url());

    // 1. Check index.html
    let tilePromise = page.waitForResponse(tileMatcher, waitOpts);
    await gotoPage(page, 'index.html');
    let res = await tilePromise;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res.ok()).toBe(true);

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
    // Fixtures.js accumulates errors array on the page object across navigations;
    // reset it to ensure assertNoJsErrors evaluates correctly for the second page load.
    page.consoleErrors = [];
    page.pageErrors = [];

    tilePromise = page.waitForResponse(tileMatcher, waitOpts);
    await gotoPage(page, 'internal.html');
    res = await tilePromise;

    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
    expect(res.ok()).toBe(true);

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
