const { test, expect } = require('@playwright/test');

test('Rur Watershed Catchment boundary styles can be updated', async ({ page }) => {
  // Bypass onboarding modal
  await page.addInitScript(() => {
    localStorage.setItem('aquarevier_onboarding_completed_v1', '1');
    localStorage.setItem('platschi_fact_date', new Date().toDateString());
  });

  await page.goto('/internal.html');

  // Wait for the customizer container to be in DOM
  await page.waitForSelector('#cfg-ca-color', { state: 'attached' });

  // Expose leafletCA if we can intercept it, but for now we'll just evaluate the function presence
  const isLoaded = await page.evaluate(() => typeof window.updateRurWatershedStyle === 'function');
  expect(isLoaded).toBe(true);

  // Set values through Playwright first so the actual elements get the values
  await page.fill('#cfg-ca-color', '#111111', { force: true });
  await page.fill('#cfg-ca-fill', '#222222', { force: true });

  await page.evaluate(() => {
    // range is step=0.5, 4.2 might get rounded, let's use 4.5
    document.getElementById('cfg-ca-weight').value = 4.5;
    // range is step=0.05, 0.7 is fine
    document.getElementById('cfg-ca-opacity').value = 0.7;
  });

  // Test the standalone logic (Node/Browser JS context)
  const result = await page.evaluate(() => {
    const mockSettings = { boundaries: {} };
    const mockLayer = {
      setStyle: function(opts) {
        this.options = opts;
      }
    };

    window.updateRurWatershedStyle(mockSettings, mockLayer);

    return {
      settings: mockSettings.boundaries,
      layerOpts: mockLayer.options
    };
  });

  expect(result.settings.caColor).toBe('#111111');
  expect(result.settings.caFill).toBe('#222222');
  expect(result.settings.caWeight).toBe(4.5);
  expect(result.settings.caOpacity).toBe(0.7);

  expect(result.layerOpts.color).toBe('#111111');
  expect(result.layerOpts.fillColor).toBe('#222222');
  expect(result.layerOpts.weight).toBe(4.5);
  expect(result.layerOpts.fillOpacity).toBe(0.7);
});
