const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  // Test requirement: "Erstelle ein ... Smoke-Test Script, das in unter 10 Sekunden das Laden von index.html, internal.html und der Basiskarte bestaetigt."
  // Run sequentially on the built-in `{ page }` fixture, which automatically handles the custom
  // setup/teardown (like `consoleErrors` attachments) from `fixtures.js`.
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
    // The `page` fixture is reused within a single `test` block.
    // Ensure `page.consoleErrors` is cleared so errors from `index.html` don't bleed over.
    // If it's somehow undefined, fall back to initializing an empty array.
    page.consoleErrors = page.consoleErrors || [];
    page.pageErrors = page.pageErrors || [];
    page.consoleErrors.length = 0;
    page.pageErrors.length = 0;

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
