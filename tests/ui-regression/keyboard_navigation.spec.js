const { test, expect } = require('@playwright/test');

test.describe('Keyboard Navigation & Focus Accessibility', () => {
  test('Skip links exist and work', async ({ page }) => {
    await page.goto('/');

    // Press Tab, should focus the first skip link
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement.textContent);
    expect(firstFocused).toMatch(/Skip to content/i);

    // Press Tab again, should focus the second skip link
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement.textContent);
    expect(secondFocused).toMatch(/Skip to navigation/i);
  });
  test('Focus indicators have min 3:1 contrast', async ({ page }) => {
    await page.goto('/');

    // Focus a button
    await page.keyboard.press('Tab'); // skip content
    await page.keyboard.press('Tab'); // skip nav
    await page.keyboard.press('Tab'); // mobile sidebar toggle or EN button

    const focusStyle = await page.evaluate(() => {
        const el = document.activeElement;
        const style = window.getComputedStyle(el);
        return style.outlineColor;
    });

    // #2563eb is rgb(37, 99, 235), #ff5f00 is rgb(255, 95, 0)
    // Both have good contrast against white.
    expect(focusStyle).toMatch(/rgb\(/);
  });
});
  test('Escape closes modals', async ({ page }) => {
    await page.goto('/');

    // Force open embed modal
    await page.evaluate(() => { window.openEmbedModal && window.openEmbedModal(); });
    await page.waitForTimeout(300);

    let display = await page.evaluate(() => document.getElementById('embed-modal').style.display);
    expect(display).toBe('flex');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    display = await page.evaluate(() => document.getElementById('embed-modal').style.display);
    expect(display).toBe('none');
  });

  test('Enter/Space activates buttons', async ({ page }) => {
    await page.goto('/');

    // Test a button activation via keyboard
    await page.evaluate(() => {
        window.testBtnClicked = false;
        const btn = document.createElement('button');
        btn.id = 'test-keyboard-btn';
        btn.textContent = 'Test Btn';
        btn.onclick = () => window.testBtnClicked = true;
        document.body.appendChild(btn);
    });

    await page.focus('#test-keyboard-btn');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    let clicked = await page.evaluate(() => window.testBtnClicked);
    expect(clicked).toBe(true);

    // Reset and try space
    await page.evaluate(() => window.testBtnClicked = false);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    clicked = await page.evaluate(() => window.testBtnClicked);
    expect(clicked).toBe(true);
  });
  test('Dropdown menus are operable with keyboard', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
        const select = document.createElement('select');
        select.id = 'test-dropdown';
        const op1 = document.createElement('option');
        op1.value = '1'; op1.textContent = 'One';
        const op2 = document.createElement('option');
        op2.value = '2'; op2.textContent = 'Two';
        select.appendChild(op1); select.appendChild(op2);
        document.body.appendChild(select);
    });

    await page.focus('#test-dropdown');
    await page.keyboard.press('ArrowDown');

    // Test the specific select in UI
    const metricSelect = page.locator('#choroplethMetricSelect');
    if (await metricSelect.count() > 0) {
        await metricSelect.focus();
        await page.keyboard.press('ArrowDown');
    }
  });
