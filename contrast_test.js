function luminance(r, g, b) {
    let a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function contrast(hex1, hex2) {
    let rgb1 = hexToRgb(hex1);
    let rgb2 = hexToRgb(hex2);
    let l1 = luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05;
    let l2 = luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05;
    let ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    return ratio;
}
console.log("var(--text-secondary) is #d1d5db in dark mode");
console.log("Contrast on --bg-base (#0b0f19):", contrast('#d1d5db', '#0b0f19'));
console.log("Contrast on --bg-surface (#111827):", contrast('#d1d5db', '#111827'));
console.log("Contrast on white (#ffffff):", contrast('#d1d5db', '#ffffff')); // Not used in dark mode but just to see
console.log("");
console.log("What about #64748b which is often used directly for color?");
console.log("Contrast on --bg-base (#0b0f19):", contrast('#64748b', '#0b0f19')); // ~4.02 < 4.5
console.log("Contrast on --bg-surface (#111827):", contrast('#64748b', '#111827')); // ~3.72 < 4.5
console.log("");
console.log("If we replace #64748b with #94a3b8 in dark mode:");
console.log("Contrast on --bg-base (#0b0f19):", contrast('#94a3b8', '#0b0f19')); // ~7.46
console.log("Contrast on --bg-surface (#111827):", contrast('#94a3b8', '#111827')); // ~6.91
console.log("");
console.log("Memory says: 'To support Dark Mode theming correctly, replace hardcoded light-mode hex colors (e.g., `#475569`, `#64748b`) in standard HTML sidebars or blocks with theme variables like `var(--text-secondary)`.'");
console.log("Ah, memory also says: 'In `index.html` and `internal.html`, Light Mode does not define `--text-secondary` in `:root`. Therefore, using variable fallbacks like `var(--text-secondary, #64748b)` directly in inline `style` attributes or specific classes safely applies the Dark Mode color when `.dark-theme` is active while preserving the exact fallback hex color in Light Mode.'");
