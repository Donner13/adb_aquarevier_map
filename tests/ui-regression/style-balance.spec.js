'use strict';
/**
 * Regression test for commit 527cc3e ("fix: stray closing </style> tag
 * broke ALL page styling on production"). A single unbalanced </style> in
 * either page silently breaks every subsequent CSS rule in the browser
 * with zero console errors - this check catches it before it ever reaches
 * a browser. Pure string counting, no server/browser needed. Ported from
 * tests/test_style_balance.py.
 */

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { PAGES, REPO_ROOT } = require('./layer-data');

for (const filename of PAGES) {
  test(`style tags are balanced: ${filename}`, () => {
    const html = fs.readFileSync(path.join(REPO_ROOT, filename), 'utf8');
    const openCount = (html.match(/<style/g) || []).length;
    const closeCount = (html.match(/<\/style/g) || []).length;
    expect(openCount, `${filename}: ${openCount} <style vs ${closeCount} </style - see commit 527cc3e`).toBe(closeCount);
    expect(openCount, `${filename}: expected at least one <style> block`).toBeGreaterThanOrEqual(1);
  });
}
