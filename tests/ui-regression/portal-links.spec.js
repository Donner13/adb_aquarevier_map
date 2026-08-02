'use strict';

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');

const EXPECTED_PORTALS = [
  ['aachen', 'https://geoportal.staedteregion-aachen.de/'],
  ['dueren', 'https://gis.kreis-dueren.de/inkasportal/'],
  ['heinsberg', 'https://geodienste.kreis-heinsberg.de/Portal/index.shtml'],
  ['rhein-erft', 'https://geo.rhein-erft-kreis.de/ASmobile/rekportal.html'],
  ['neuss', 'https://maps.rhein-kreis-neuss.de/geoportal/'],
  ['moenchengladbach', 'https://mapview.hydrotec.de/models/Starkregen-Simulation-MG-aussergewoehnliches-Ereignis/'],
];

for (const filename of ['index.html', 'internal.html']) {
  test(`${filename} uses the current official municipal portal links`, async ({ page }) => {
    await gotoPage(page, filename);

    const portals = await page.locator('a.external-portal-link').evaluateAll((links) =>
      links.map((link) => ({
        key: link.dataset.portalKey,
        href: link.href,
        target: link.target,
        rel: link.rel.split(/\s+/).sort(),
        role: link.getAttribute('role'),
      }))
    );

    expect(portals).toEqual(EXPECTED_PORTALS.map(([key, href]) => ({
      key,
      href,
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
      role: null,
    })));
    expect(await page.locator('button.external-portal-link').count()).toBe(0);
    assertNoJsErrors(page);
  });
}
