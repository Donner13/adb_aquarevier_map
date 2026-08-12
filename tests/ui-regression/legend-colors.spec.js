const { test, expect, gotoPage, assertNoJsErrors } = require("./fixtures.js");

function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

test.describe("Legend Color Mapping", () => {
    test("embed-mini-legend colors match configured group colors in public map", async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem("aquarevier_onboarding_completed_v1", "1");
            localStorage.setItem("platschi_fact_date", new Date().toDateString());
        });
        await page.goto("/index.html?embed=1", { waitUntil: "domcontentloaded" });
        await page.waitForSelector("#embed-mini-legend");
        await page.waitForFunction(() =>
            window.map && typeof window.map.hasLayer === "function" && window.aquarevierCoreReady === true
        );

        const groupColors = await page.evaluate(() => groupColors);
        const expectedGroups = Object.keys(groupColors).filter(g => g !== "Konsortium");

        for (const group of expectedGroups) {
            const locator = page.locator(`.embed-mini-legend-item:has-text("${group}")`);
            await expect(locator).toBeVisible();

            const expectedColorHex = groupColors[group];
            const expectedColorRgb = hexToRgb(expectedColorHex);
            const colorSpan = locator.locator(".embed-mini-legend-color");

            // Playwright computes styles in RGB format
            const backgroundColor = await colorSpan.evaluate((el) => window.getComputedStyle(el).backgroundColor);
            expect(backgroundColor).toBe(expectedColorRgb);
        }

        assertNoJsErrors(page);
    });
});
