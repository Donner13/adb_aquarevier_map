const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/unit',
  testMatch: /.*\.js/,
  fullyParallel: true,
  use: {
    trace: 'on-first-retry',
  },
});
