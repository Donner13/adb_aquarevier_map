// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// See G:\Meine Ablage\Antigravity\10_Projects\Aquarevier_Map_Backlog.md item #8
// ("Playwright-basierte UI-Regressionssuite") section 3 for the full
// architecture rationale (Node @playwright/test over Python-Playwright).
module.exports = defineConfig({
  testDir: './tests/ui-regression',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // server.py uses a plain (non-threading) socketserver.TCPServer - one
  // connection at a time. Parallel workers hammering it concurrently causes
  // spurious ERR_CONNECTION_REFUSED under load (observed locally). Run
  // serially against it rather than reinventing/patching the dev server,
  // which the backlog explicitly says not to do.
  workers: 1,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  expect: {
    // Moderate tolerance for font/antialiasing noise across OS/CI runs
    // (backlog #8 section 3/4: ~0.02, looser than the Python suite's 0.5%
    // full-page threshold because we now diff a much smaller #map-only
    // region - see layer-toggles.spec.js for the scope rationale).
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL: 'http://localhost:8000',
    viewport: { width: 1600, height: 1200 }, // matches elwas_client.py's scraper viewport
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python server.py',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
