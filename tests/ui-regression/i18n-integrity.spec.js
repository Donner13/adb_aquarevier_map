'use strict';

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

const RAW_I18N_KEY = /^(?:app\.|sidebar\.|layer(?:_group)?[._]|search_|reset_|share_|open_|generate_|cmd_)/;

for (const filename of ['index.html', 'internal.html']) {
  test(`${filename} renders translated UI copy instead of raw i18n keys`, async ({ page }) => {
    await gotoPage(page, filename);

    const rawKeys = await page.locator('[data-i18n-key]').evaluateAll((elements) =>
      elements
        .map((element) => {
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            return element.placeholder.trim();
          }
          return element.textContent.trim();
        })
        .filter(Boolean)
    );

    expect(rawKeys.filter((value) => RAW_I18N_KEY.test(value))).toEqual([]);
    assertNoJsErrors(page);
  });

  test(`${filename} auxiliary widgets do not shrink the map viewport`, async ({ page }) => {
    await gotoPage(page, filename);
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      app: document.getElementById('app-container').getBoundingClientRect().width,
      sidebar: document.getElementById('sidebar').getBoundingClientRect().width,
      map: document.getElementById('map').getBoundingClientRect().width,
      mascotPosition: getComputedStyle(document.getElementById('platschi-widget')).position,
      toastPosition: getComputedStyle(document.getElementById('aqua-toast-container')).position,
    }));

    expect(layout.app).toBe(layout.viewport);
    expect(layout.sidebar + layout.map).toBe(layout.viewport);
    expect(layout.mascotPosition).toBe('fixed');
    expect(layout.toastPosition).toBe('fixed');
    assertNoJsErrors(page);
  });
}
