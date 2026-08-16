const bg1 = "#0b0f19";
const bg2 = "#111827"; // rgb(17, 24, 39)
const bg3 = "#1f2937"; // rgba(31, 41, 55, 0.95)

function hexToRgb(hex) {
    if(hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
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

console.log("text-secondary vs bg-surface-hover:", contrast(bg3, "#9ca3af")); // 5.78 -> Wait, 5.78 > 4.5.
// So #9ca3af really passes everywhere.

// Maybe they mean `#64748b` that is scattered around? But the prompt explicitly limits scope:
// "STRICT SCOPE: touch only the files named/implied by YOUR TASK above. Do not inspect or modify unrelated modules."
// Files named: `js/theme-darkmode.js` und `style-Block`.
// `style-Block` implies the `<style>` tag in `index.html` (and `internal.html`).

// What if I just change `--text-secondary` in dark mode to something like `#d1d5db` which has 12.0 contrast, to be completely safe?
// And maybe change `--color-sonstige` in dark mode?
// Wait, is `--text-secondary: #9ca3af` already 6.9? Yes! But maybe they want it strictly higher?
// Let's change `--text-secondary` in `body.dark-theme` to `#cbd5e1` (contrast 10.8) or `#d1d5db`.

// Wait, I see there's an error in my luminance calculation or they calculated it differently.
// Let's use a very standard WCAG formula just to be double sure. Yes, it's correct.
