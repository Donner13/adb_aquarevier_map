const { test, expect } = require('@playwright/test');

test.describe('Batch 6: A11y High Contrast Map Controls', () => {
  test('Map control icons are high contrast in dark mode', async ({ page }) => {
    await page.goto('/');

    // Enable dark mode
    await page.evaluate(() => {
      if (typeof window.isDarkMode !== 'undefined') {
        window.isDarkMode = false;
        if (window.toggleDarkMode) window.toggleDarkMode();
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      }
    });

    await page.waitForTimeout(300);

    // Verify zoom in button background and color in dark mode
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomInStyle = await zoomIn.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
            backgroundColor: style.backgroundColor,
            color: style.color
        };
    });

    // Dark mode bg color is usually rgba(17, 24, 39, 0.95) for --bg-surface
    expect(zoomInStyle.backgroundColor).not.toBe('rgb(255, 255, 255)');
    expect(zoomInStyle.color).not.toBe('rgb(0, 0, 0)');

    // Check layer toggle
    const layerToggle = page.locator('.leaflet-control-layers-toggle');
    const toggleFilter = await layerToggle.evaluate(el => window.getComputedStyle(el).filter);
    expect(toggleFilter).toContain('invert(1)'); // should invert the black icon to white
  });

  test('Map control icons are extreme high contrast in high-contrast mode', async ({ page }) => {
    await page.goto('/');

    // Enable dark mode + high contrast
    await page.evaluate(() => {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.body.classList.add('high-contrast');
    });

    await page.waitForTimeout(300);

    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomInStyle = await zoomIn.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            borderTopWidth: style.borderTopWidth
        };
    });

    // High contrast mode uses #000000 for bg and 2px border
    expect(zoomInStyle.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(zoomInStyle.borderTopWidth).toBe('2px');

    const layerToggle = page.locator('.leaflet-control-layers-toggle');
    const toggleFilter = await layerToggle.evaluate(el => window.getComputedStyle(el).filter);
    expect(toggleFilter).toContain('invert(1)');
    expect(toggleFilter).toContain('drop-shadow');
  });
});
