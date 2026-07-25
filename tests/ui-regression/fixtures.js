'use strict';
/**
 * Shared Playwright fixtures for the UI regression suite. Ported from
 * tests/conftest.py (the Python suite this replaces) - same design notes
 * apply:
 *
 * - Cross-origin map tile / WMS requests (basemaps.cartocdn.com,
 *   tile.openstreetmap.org, wms.nrw.de, cismet.de) are intercepted and fulfilled with
 *   a fixed 1x1 placeholder PNG. Two reasons: (1) screenshot diffing needs
 *   deterministic pixels - real CDN tile content/rendering is not
 *   guaranteed stable run-to-run; (2) CI shouldn't depend on those
 *   third-party services being reachable/fast. Playwright still emits a
 *   'response' event for fulfilled routes, so waitForResponse()-based
 *   network assertions (see layer-toggles.spec.js) are unaffected - we're
 *   only replacing the response body, not suppressing the request/response.
 *
 * - Same-origin *.geojson requests are NOT intercepted; they hit the real
 *   local `python server.py`, which is what makes the network-request
 *   assertions meaningful.
 */

const base = require('@playwright/test');

const EXTERNAL_TILE_HOST_RE = /basemaps\.cartocdn\.com|tile\.openstreetmap\.org|wms\.nrw\.de|cismet\.de/;

// Smallest-possible valid PNG (1x1, black pixel) - deterministic placeholder,
// no image-generation dependency needed.
const PLACEHOLDER_TILE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route(EXTERNAL_TILE_HOST_RE, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_TILE_PNG })
    );

    const consoleErrors = [];
    const pageErrors = [];
    const requests = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('request', (req) => requests.push(req.url()));

    page.consoleErrors = consoleErrors;
    page.pageErrors = pageErrors;
    page.requests = requests;

    await use(page);
  },
});

const expect = base.expect;

/** Navigate to a page and wait for the sidebar + initial fetch burst to settle. */
async function gotoPage(page, filename) {
  await page.goto(`/${filename}`);
  await page.waitForSelector('.filter-btn[data-layer-name]');
  await page.waitForLoadState('networkidle');
}

function assertNoJsErrors(page) {
  expect(page.consoleErrors, `console.error fired: ${page.consoleErrors.join(' | ')}`).toEqual([]);
  expect(page.pageErrors, `uncaught JS exception: ${page.pageErrors.join(' | ')}`).toEqual([]);
}

function layerButton(page, name) {
  return page.locator(`.filter-btn[data-layer-name="${name}"]`);
}

async function isButtonActive(page, name) {
  const classAttr = (await layerButton(page, name).getAttribute('class')) || '';
  return classAttr.split(/\s+/).includes('active');
}

// NOTE: `map` / `overlayMaps` are top-level `const` bindings inside a
// classic (non-module) <script> tag in index.html/internal.html - they do
// NOT become `window.map`/`window.overlayMaps` properties, but they DO
// remain reachable as bare identifiers from page.evaluate() because it
// runs in the same JS realm/global lexical scope as the page's scripts.
async function mapHasLayer(page, name) {
  return page.evaluate((n) => map.hasLayer(overlayMaps[n]), name);
}

/** Vector layers (L.geoJSON/markerClusterGroup) have .getLayers(); WMS/tile layers don't. */
async function layerFeatureCount(page, name) {
  return page.evaluate((n) => {
    const layer = overlayMaps[n];
    return typeof layer.getLayers === 'function' ? layer.getLayers().length : null;
  }, name);
}

async function counterBadgeText(page, name) {
  return layerButton(page, name).locator('.counter-badge').innerText();
}

/** Screenshot scope is deliberately #map only, never full-page - see
 * layer-toggles.spec.js module docstring for why. */
function mapLocator(page) {
  return page.locator('#map');
}

module.exports = {
  test,
  expect,
  gotoPage,
  assertNoJsErrors,
  layerButton,
  isButtonActive,
  mapHasLayer,
  layerFeatureCount,
  counterBadgeText,
  mapLocator,
};
