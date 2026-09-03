const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://adb-aquarevier-secure.surge.sh/internal.html');
  await page.waitForLoadState('networkidle');

  // We could use playwright-axe or just inject axe-core
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });

  const results = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['color-contrast']
      }
    });
  });

  fs.writeFileSync('axe-results-internal.json', JSON.stringify(results.violations, null, 2));
  console.log('Violations found in internal.html:', results.violations.length);
  if (results.violations.length > 0) {
      console.log('First violation:', results.violations[0].help);
  }
  await browser.close();
})();
