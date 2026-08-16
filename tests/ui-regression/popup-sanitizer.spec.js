const { test, expect, gotoPage } = require('./fixtures');

test.describe('Popup Content Sanitizer', () => {
  test('Popup generation sanitizes HTML in properties to prevent XSS', async ({ page }) => {

    await page.route('**/klaeranlagen.geojson', route => {
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
                zustaendigkeit_behoerde: '<script>window.xssFired=true</script>Behoerde',
                zustaendigkeit_amt: '<b onmouseover="window.xssFired=true">Amt</b>',
                zustaendigkeit_email: 'test@example.com"></a><script>window.xssFired=true</script>',
                zustaendigkeit_telefon: '<iframe src="javascript:alert(1)"></iframe>'
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
      return typeof window.klaeranlagenLayer !== 'undefined' && window.klaeranlagenLayer.getLayers().length > 0;
    });

    // Programmatically open the popup for the malicious marker
    await page.evaluate(async () => {
      window.xssFired = false;
      let targetMarker = null;
      if (window.klaeranlagenLayer && window.klaeranlagenLayer.eachLayer) {
          window.klaeranlagenLayer.eachLayer(l => {
              if (l.feature && l.feature.properties && l.feature.properties.id === 'xss-1') {
                  targetMarker = l;
              }
          });
      }

      if (!targetMarker && window.map) {
          window.map.eachLayer(l => {
              if (l.feature && l.feature.properties && l.feature.properties.id === 'xss-1') targetMarker = l;
          });
      }

      if (targetMarker) {
          targetMarker.fire('click');
          if (targetMarker.openPopup) targetMarker.openPopup();
      } else {
          const div = document.createElement('div');
          div.className = 'leaflet-popup-content';
          div.innerHTML = 'NOT FOUND';
          document.body.appendChild(div);
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
    expect(popupHtml).toContain('&lt;script&gt;window.xssFired=true&lt;/script&gt;Behoerde');
  });
});
