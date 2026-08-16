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

// Let's assume "--text-secondary: #9ca3af" was not the issue, but maybe another gray.
// For example, #64748b is often used as a fallback inline. If the variable is NOT defined somewhere, it becomes #64748b.
// But we saw #9ca3af has contrast 6.98.
// Is there another muted text color?
// How about --text-secondary in body.light-theme when used in dark theme? Oh, it's scoped properly.
// The task: "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Let's check `#9ca3af` again:
console.log("9ca3af vs bg-surface (rgba 17,24,39,0.95)", contrast("#111827", "#9ca3af")); // 6.98

// What about #9ca3af vs #f3f4f6 (primary text)?
// Wait, is #9ca3af considered a failure? Maybe there's a misunderstanding. Wait, #9ca3af has 6.98 which is > 4.5.
// Let's check `#64748b` against `#111827`.
console.log("64748b vs bg-surface", contrast("#111827", "#64748b")); // 3.72 !! < 4.5
// #64748b is used in inline styles with var(--text-secondary, #64748b).
// Wait! If they use var(--text-secondary, #64748b), the fallback #64748b is only used if --text-secondary is NOT defined.
// But it IS defined in .dark-theme. So it uses #9ca3af.
// BUT what if there are elements explicitly styled `color: #64748b;` instead of `var(--text-secondary)`?
