function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function luminance({ r, g, b }) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
    const lum1 = luminance(hexToRgb(hex1));
    const lum2 = luminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

console.log("64748b vs dark background", contrast("#111827", "#64748b"));
// It seems #64748b is very frequently used in inline styles and gives low contrast!
// The memory says: "When modifying global CSS variables for theming (like `--text-secondary`), take care not to override explicitly hardcoded map legend colors (e.g., `#64748b` for Fluvial/Pluvial) that are generated via inline JS string templates in index.html and internal.html, as replacing them can cause legibility regressions."
//
// But wait, the task explicitly asks:
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// And it specifically restricts the scope:
// "STRICT SCOPE: touch only the files named/implied by YOUR TASK above. Do not inspect or modify unrelated modules."
// Files named: `js/theme-darkmode.js` und "style-Block". "style-Block" implies the `<style>` block in `index.html` (and perhaps `internal.html`).

// Let's re-read the CSS variables in index.html and internal.html.
// We checked `--text-secondary` which is `#9ca3af`. Wait, what about `text-secondary`? Is it `#9ca3af`?
// Yes, `#9ca3af` is 6.98.
// Is there any other variable? What about `--color-sonstige: #595959`?
// Contrast #595959 vs #0b0f19: 2.73
// Contrast #595959 vs #111827: 2.53
//
// If we change `--color-sonstige` to something like `#828282` or `#9ca3af` in `body.dark-theme` (it's not defined there yet, it's defined in `:root`), we might fix it.
//
// But the prompt says "passe gedimmte Texte auf mindestens 4.5:1 Kontrast an".
// Wait, is there a gedimmter Text in `js/theme-darkmode.js`?
// Let's grep for #64748b or "color:" in js/theme-darkmode.js again.
