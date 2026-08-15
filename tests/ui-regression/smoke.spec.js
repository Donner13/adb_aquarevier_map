const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

test.describe('CI Smoke Test', () => {
  test('index.html and internal.html load successfully under 10s', async ({ page }) => {
    test.setTimeout(10000); // Enforce strictly under 10 seconds for BOTH pages combined

    // 1. Check index.html
    await Promise.all([
      page.waitForResponse(res => res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')),
      gotoPage(page, 'index.html')
    ]);
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();

    // 2. Check internal.html
    await Promise.all([
      page.waitForResponse(res => res.url().includes('basemaps.cartocdn.com') || res.url().includes('openstreetmap')),
      gotoPage(page, 'internal.html')
    ]);
    assertNoJsErrors(page);
    await expect(page.locator('#map')).toBeVisible();
  });
});
