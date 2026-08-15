const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test('index.html and internal.html load successfully under 10s', async ({ page }) => {
    test.setTimeout(10000); // Enforce strictly under 10 seconds for BOTH pages combined

    // 1. Check index.html
    let tileResponsePromise = page.waitForResponse(res =>
      res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')
    );
    await gotoPage(page, 'index.html');
    await tileResponsePromise;
    assertNoJsErrors(page);

    await expect(page.locator('#map')).toBeVisible();

    // 2. Check internal.html
    tileResponsePromise = page.waitForResponse(res =>
      res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')
    );
    await gotoPage(page, 'internal.html');
    await tileResponsePromise;
    assertNoJsErrors(page);

    await expect(page.locator('#map')).toBeVisible();
  });
});
