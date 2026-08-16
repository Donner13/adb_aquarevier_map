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
    console.log(hex1, "on", hex2, ":", ratio);
}

console.log("--text-secondary vs dark modes:")
contrast('#d1d5db', '#0b0f19'); // bg-base
contrast('#d1d5db', '#111827'); // bg-surface (approximate rgb for rgba)
contrast('#d1d5db', '#1f2937'); // bg-surface-hover

console.log("Checking what contrast d1d5db has...");

// wait, the task is: "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."

console.log("Let's check where gedimmte Texte has poor contrast in dark mode:");
// What about #64748b? (which is used explicitly and not replaced with var(--text-secondary) everywhere?)
contrast('#64748b', '#0b0f19'); // 4.02 < 4.5
contrast('#64748b', '#111827'); // 3.73 < 4.5

// The memory says: "To support Dark Mode theming correctly, replace hardcoded light-mode hex colors (e.g., `#475569`, `#64748b`) in standard HTML sidebars or blocks with theme variables like `var(--text-secondary)`. However, dynamically generated Leaflet map controls/legends are explicitly styled for light mode (e.g., white backgrounds with `#1e293b` text) even when the dark theme is active; do NOT replace their hardcoded text colors with CSS variables, as this breaks contrast (e.g., light-gray text on white). Any dimmed text or category colors in Dark Mode must maintain a minimum WCAG AA contrast ratio of 4.5:1 against dark backgrounds."

// So I need to:
// 1. Check if --text-secondary provides 4.5:1. Yes, #d1d5db gives ~12-13.
// 2. See if there are other dimmed texts explicitly set to #64748b that need to be replaced with var(--text-secondary).
// 3. Or maybe the prompt means I should check `body.dark-theme` definitions.
