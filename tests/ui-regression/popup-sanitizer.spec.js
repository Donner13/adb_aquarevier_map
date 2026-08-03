const { test, expect, gotoPage } = require('./fixtures');

test.describe('Popup Content Sanitizer', () => {
  // Use test.fail to mark it as known failure.
  test('Popup generation sanitizes HTML in properties to prevent XSS', async ({ page }) => {
    test.fail(true, 'Popup sanitization is currently missing');

    await page.route('**/contacts_anonymized.geojson', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [6.1, 50.8] },
              properties: {
                id: 'xss-1',
                name: '<img src=x onerror="window.xssFired=true">Malicious Name',
                group: 'Forschung',
                organisation: '<script>window.xssFired=true</script>Malicious Org',
                institution: '<b onmouseover="window.xssFired=true">HoverMe</b>',
                bereich: '<svg onload="window.xssFired=true">',
                email: 'test@example.com"></a><script>window.xssFired=true</script>',
                phone: '<iframe src="javascript:alert(1)"></iframe>'
              }
            }
          ]
        })
      });
    });

    // Go to the public map (index.html)
    await gotoPage(page, 'index.html');

    // Wait for markers to be rendered
    await page.waitForFunction(() => {
      return typeof markersLayer !== 'undefined' && markersLayer.getLayers().length > 0;
    });

    // Programmatically open the popup for the malicious marker
    await page.evaluate(() => {
      window.xssFired = false;
      const markers = markersLayer.getLayers();
      if (markers.length > 0) {
        markers[0].fire('click'); // Click is handled to pan and open popup
        markers[0].openPopup();
      }
    });

    // Wait for the popup to open
    await page.waitForSelector('.leaflet-popup-content');

    // Give it a moment to let any async XSS (like image error) run
    await page.waitForTimeout(500);

    // Verify that the XSS payload did not execute
    const xssFired = await page.evaluate(() => window.xssFired);
    expect(xssFired).toBe(false); // If it executed, it would be true

    // Also verify the DOM does not contain raw HTML tags from the payload
    const popupHtml = await page.$eval('.leaflet-popup-content', el => el.innerHTML);
    expect(popupHtml).not.toContain('<img src="x"');
    expect(popupHtml).not.toContain('<script>');
    expect(popupHtml).not.toContain('<svg');
    expect(popupHtml).not.toContain('<iframe');

    // The escaped payload should ideally be present as text
    expect(popupHtml).toContain('&lt;script&gt;window.xssFired=true&lt;/script&gt;');
  });
});
