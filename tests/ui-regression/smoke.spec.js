const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test.describe.configure({ timeout: 10000 }); // Enforce under 10 seconds constraint

  test('index.html loads successfully with basemap', async ({ page }) => {
    await gotoPage(page, 'index.html');
    assertNoJsErrors(page);

    // Verify map container exists
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();

    // Verify basemap (TileLayer) is present
    const hasBasemap = await page.evaluate(() => {
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

  test('internal.html loads successfully with basemap', async ({ page }) => {
    await gotoPage(page, 'internal.html');
    assertNoJsErrors(page);

    // Verify map container exists
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();

    // Verify basemap (TileLayer) is present
    const hasBasemap = await page.evaluate(() => {
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
