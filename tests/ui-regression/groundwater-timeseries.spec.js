'use strict';

/**
 * Automated test suite for the Groundwater Time-Series Slider (Historischer Grundwasser-Zeitraffer).
 */

const { test, expect, gotoPage, assertNoJsErrors } = require('./fixtures');
const { PAGES } = require('./layer-data');

for (const filename of PAGES) {
  test.describe(`${filename} - Groundwater Time Series`, () => {

    test('time series UI controls are present', async ({ page }) => {
      await gotoPage(page, filename);

      const slider = page.locator('#timeseries-slider');
      const yearDisplay = page.locator('#timeseries-year-display');
      const playBtn = page.locator('#btn-timeseries-play');

      await expect(slider).toBeVisible();
      await expect(yearDisplay).toBeVisible();
      await expect(playBtn).toBeVisible();

      await expect(yearDisplay).toHaveText('2025');

      assertNoJsErrors(page);
    });

    test('slider interaction updates year and visualization', async ({ page }) => {
      await gotoPage(page, filename);

      // Programmatically set year index to 0 (Year 2000)
      await page.evaluate(() => {
        window.setTimeSeriesYearIndex(0);
      });

      const yearDisplay = page.locator('#timeseries-year-display');
      await expect(yearDisplay).toHaveText('2000');

      // Programmatically set year index to 6 (Year 2030)
      await page.evaluate(() => {
        window.setTimeSeriesYearIndex(6);
      });

      await expect(yearDisplay).toHaveText('2030');

      assertNoJsErrors(page);
    });

    test('play and pause toggle animation state', async ({ page }) => {
      await gotoPage(page, filename);

      const playBtn = page.locator('#btn-timeseries-play');

      // Click play
      await page.evaluate(() => {
        window.toggleTimeSeriesPlay();
      });

      await expect(playBtn).toContainText('Pause');

      // Click pause
      await page.evaluate(() => {
        window.pauseTimeSeries();
      });

      await expect(playBtn).toContainText('Play');

      assertNoJsErrors(page);
    });

  });
}
