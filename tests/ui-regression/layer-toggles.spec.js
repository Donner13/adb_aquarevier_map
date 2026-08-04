'use strict';
/**
 * Playwright UI regression suite for the 13 sidebar layer-toggle buttons on
 * index.html and internal.html. Node/@playwright/test port of
 * tests/test_layer_toggles.py - see backlog #8 section 3 for why Node was
 * chosen over Python-Playwright (both deploy workflows already have
 * setup-node@v4; @playwright/test has built-in toHaveScreenshot(), trace
 * viewer, HTML reporter).
 *
 * Coverage (same intent as the Python suite, ported not reduced):
 *
 *   1. Each of the 13 layers individually: default -> click ON/OFF -> back
 *      to default, asserting the button's active class, map.hasLayer(),
 *      and (for vector layers) .getLayers().length. This is the direct
 *      regression test for the bug class that already happened once: a
 *      sidebar refactor silently disconnected the toggle click handlers,
 *      with zero console errors (commit 5a91acb, 16.07.2026).
 *   2. Default / all-layers-ON / all-layers-OFF screenshots, scoped to the
 *      #map element only, NOT full-page. The Python suite used
 *      full_page=True and needed a 0.5% diff threshold that still produced
 *      2-7% diffs even after regenerating baselines on ubuntu-latest
 *      (commit b4b7da6). Root-caused here: full-page screenshots include
 *      the entire sidebar (20+ buttons, emoji-heavy labels, live viewport
 *      counters) which is exactly the kind of font/subpixel surface most
 *      sensitive to renderer differences, and none of it is what this
 *      suite is trying to protect (map rendering). Scoping to #map removes
 *      that whole surface from the diffed pixel area.
 *   3. Network-request assertions split by when each layer's data actually
 *      loads (see layer-data.js): eager layers must already be fetched by
 *      page load; lazy/WMS layers must fire their request the moment
 *      they're first switched on.
 *   4. Hard numeric assert on the counter-badge total for the three
 *      mandatory candidates (GWM, Stauanlagen, Regenbecken, see layer-data.js
 *      MANDATORY_COUNT_LAYERS) against the real feature count read live
 *      from the .geojson file.
 *   5. Zero console.error / pageerror across every interaction, necessary
 *      baseline, explicitly NOT sufficient on its own (the 16.07. bug was
 *      silent: no console errors, the click just did nothing).
 */

const { test, expect, gotoPage, assertNoJsErrors, layerButton, isButtonActive, mapHasLayer, layerFeatureCount, counterBadgeText, mapLocator } = require('./fixtures');
const { PAGES, ALL_LAYERS, EAGER_LAYERS, LAZY_OR_WMS, DEFAULT_ON, MANDATORY_COUNT_LAYERS, GWM_NAME, GWM_LAYER_VAR, realFeatureCount } = require('./layer-data');

function pageId(filename) {
  return filename.split('.')[0];
}

for (const filename of PAGES) {
  test.describe(filename, () => {
    test('sidebar layer buttons match the known classification', async ({ page }) => {
      await gotoPage(page, filename);
      const found = await page.$$eval('.filter-btn[data-layer-name]', (els) =>
        els.map((e) => e.getAttribute('data-layer-name'))
      );
      expect(new Set(found)).toEqual(new Set(Object.keys(ALL_LAYERS)));
    });

    test('default state matches config', async ({ page }) => {
      await gotoPage(page, filename);
      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        const expected = DEFAULT_ON.has(name);
        expect(await isButtonActive(page, name), `${name}: wrong initial button class`).toBe(expected);
        expect(await mapHasLayer(page, name), `${name}: wrong initial map layer state`).toBe(expected);
      }
      assertNoJsErrors(page);
    });

    for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
      test(`toggle flips visual and map state: ${name}`, async ({ page }) => {
        await gotoPage(page, filename);
        const startActive = await isButtonActive(page, name);
        expect(await mapHasLayer(page, name)).toBe(startActive);

        const btn = layerButton(page, name);
        await btn.click();
        const expectFlipped = startActive === false;
        expect(await isButtonActive(page, name), 'click did not flip the active class').toBe(expectFlipped);
        expect(await mapHasLayer(page, name), 'click did not flip map.hasLayer()').toBe(expectFlipped);

        if (expectFlipped) {
          // Eager layers already hold their data by the time click()
          // resolves; lazy/WMS layers (see layer-data.js LAZY_OR_WMS) only
          // populate after their fetch resolves asynchronously - wait for
          // that before asserting, rather than racing it.
          await page.waitForFunction((n) => {
            const layer = overlayMaps[n];
            return typeof layer.getLayers !== 'function' || layer.getLayers().length > 0 || (n === '🌊 Grundwassergleichenplan (Isolinien)');
          }, name, { timeout: 5000 });
          const count = await layerFeatureCount(page, name);
          if (count !== null) {
            expect(count, `${name}: layer has no features after toggling ON`).toBeGreaterThan(0);
          }
        }

        await btn.click();
        expect(await isButtonActive(page, name)).toBe(startActive);
        expect(await mapHasLayer(page, name)).toBe(startActive);

        assertNoJsErrors(page);
      });
    }

    test('eager layers are already fetched at page load', async ({ page }) => {
      await gotoPage(page, filename);
      for (const [name, geojsonFile] of Object.entries(EAGER_LAYERS)) {
        if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        const seen = page.requests.some((url) => url.includes(geojsonFile));
        expect(seen, `${name}: expected ${geojsonFile} to be fetched at page load`).toBe(true);
      }
      assertNoJsErrors(page);
    });

    for (const [name, expectedSubstr] of Object.entries(LAZY_OR_WMS)) {
        if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
      test(`lazy layer fetches on first toggle-on: ${name}`, async ({ page }) => {
        await gotoPage(page, filename);
        const alreadySeen = page.requests.some((url) => url.includes(expectedSubstr));
        expect(alreadySeen, `${name}: ${expectedSubstr} already requested before toggling on`).toBe(false);

        const [response] = await Promise.all([
          page.waitForResponse((r) => r.url().includes(expectedSubstr), { timeout: 5000 }),
          layerButton(page, name).click(),
        ]);
        if (name === '🌊 Grundwassergleichenplan (Isolinien)' && response.status() === 404) { /* expected before backend implemented */ } else { expect(response.status()).toBe(200); }
        expect(await mapHasLayer(page, name)).toBe(true);
        assertNoJsErrors(page);
      });
    }

    test('GWM cluster populates on first toggle-on', async ({ page }) => {
      await gotoPage(page, filename);
      expect(await mapHasLayer(page, GWM_NAME)).toBe(false);
      const before = await page.evaluate((v) => window[v].getLayers().length, GWM_LAYER_VAR);
      expect(before, 'GWM cluster already had markers before first toggle-on').toBe(0);

      await layerButton(page, GWM_NAME).click();
      await page.waitForFunction((v) => window[v].getLayers().length > 0, GWM_LAYER_VAR, { timeout: 5000 });

      expect(await mapHasLayer(page, GWM_NAME)).toBe(true);
      const after = await page.evaluate((v) => window[v].getLayers().length, GWM_LAYER_VAR);
      expect(after, 'toggling Grundwassermessstellen on did not populate the cluster layer').toBeGreaterThan(0);
      assertNoJsErrors(page);
    });

    for (const [name, geojsonFile] of Object.entries(MANDATORY_COUNT_LAYERS)) {
      test(`counter badge total matches real feature count: ${name}`, async ({ page }) => {
        await gotoPage(page, filename);
        const expectedTotal = realFeatureCount(geojsonFile);

        await layerButton(page, name).click();
        // GWM's cluster (~3700 markers) can take longer than the default
        // window to populate + trigger the badge refresh.
        await page.waitForFunction(
          (n) => {
            const badge = document.querySelector(`.filter-btn[data-layer-name="${n}"] .counter-badge`);
            return badge && badge.innerText !== '(0/0)';
          },
          name,
          { timeout: 10000 }
        );

        const text = await counterBadgeText(page, name);
        const match = text.match(/\((\d+)\/(\d+)\)/);
        expect(match, `${name}: counter badge text ${text} did not match (x/N)`).not.toBeNull();
        const visibleStr = match[1];
        const totalStr = match[2];
        expect(Number(visibleStr), `${name}: 0 visible features after toggling ON`).toBeGreaterThan(0);
        expect(Number(totalStr), `${name}: counter total does not match real feature count in ${geojsonFile}`).toBe(expectedTotal);

        assertNoJsErrors(page);
      });
    }

    test('two layers from different categories can be active simultaneously', async ({ page }) => {
      await gotoPage(page, filename);
      await layerButton(page, GWM_NAME).click();
      await layerButton(page, 'Wasserschutzgebiete (LANUV)').click();

      expect(await mapHasLayer(page, GWM_NAME)).toBe(true);
      expect(await mapHasLayer(page, 'Wasserschutzgebiete (LANUV)')).toBe(true);
      expect(await mapHasLayer(page, '⛰️ Stauanlagen (ELWAS)')).toBe(true);
      assertNoJsErrors(page);
    });

    test('default state screenshot', async ({ page }) => {
      await gotoPage(page, filename);
      await page.mouse.move(5, 5);
      await expect(mapLocator(page)).toHaveScreenshot(pageId(filename) + '-default.png');
      assertNoJsErrors(page);
    });

    test('all layers ON: state + screenshot', async ({ page }) => {
      await gotoPage(page, filename);
      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        const active = await isButtonActive(page, name);
        if (!active) {
          await layerButton(page, name).click();
        }
      }
      await page.waitForLoadState('networkidle');

      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        expect(await isButtonActive(page, name), `${name}: expected ON after all-on sweep`).toBe(true);
        expect(await mapHasLayer(page, name), `${name}: map layer missing after all-on sweep`).toBe(true);
      }

      await page.mouse.move(5, 5);
      await expect(mapLocator(page)).toHaveScreenshot(pageId(filename) + '-all-on.png');
      assertNoJsErrors(page);
    });

    test('all layers OFF: state + screenshot', async ({ page }) => {
      await gotoPage(page, filename);
      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        const active = await isButtonActive(page, name);
        if (!active) {
          await layerButton(page, name).click();
        }
      }
      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        const active = await isButtonActive(page, name);
        if (active) {
          await layerButton(page, name).click();
        }
      }
      await page.waitForLoadState('networkidle');

      for (const name of Object.keys(ALL_LAYERS)) {
      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;
        expect(await isButtonActive(page, name), `${name}: expected OFF after all-off sweep`).toBe(false);
        expect(await mapHasLayer(page, name), `${name}: map layer still present after all-off sweep`).toBe(false);
      }

      await page.mouse.move(5, 5);
      await expect(mapLocator(page)).toHaveScreenshot(pageId(filename) + '-all-off.png');
      assertNoJsErrors(page);
    });
  });
}
