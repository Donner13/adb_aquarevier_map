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
// Is there a #475569 in dark theme?
// Wait, in index.html:
// :root {
//    --text-secondary: #475569;
// }
// body.dark-theme {
//    --text-secondary: #9ca3af;
// }
//
// What if we change `--text-secondary` in dark theme from `#9ca3af` to something brighter, like `#d1d5db`?
console.log(contrast("#111827", "#d1d5db")); // 12.0
// Or maybe `--text-secondary` is already fine.
// What about the task description exactly:
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."

// Let's look for `#595959` (which is `--color-sonstige`). It's 2.53
console.log("sonstige", contrast("#111827", "#595959"));
// What if "gedimmte Texte" means `--color-sonstige` and maybe `--text-secondary`?
