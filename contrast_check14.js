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

// In index.html, we have:
// --text-secondary: #9ca3af;
// Are there any OTHER dark-mode CSS rules?
// Like `body.dark-theme .leaflet-bar a { color: var(--text-primary); }`
// "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Maybe `var(--text-secondary)` IS the problem?
// Wait, is it? Contrast is 6.98. That's > 4.5.
// Ah, what about `#64748b` used in inline styles, as fallback?
console.log("Contrast of #64748b vs #111827 is", contrast("#111827", "#64748b"));
// Wait, if it's fallback, it's NOT used because --text-secondary is defined!
// BUT if we have `<div style="color: #64748b;">` explicitly, that would be an issue!
// Is there a #64748b explicitly without var()?
// Yes, I saw in my grep:
// ./index.html:            color: #64748b;
// ./internal.html:            color: #64748b;
// Let's check those specific lines in index.html and internal.html.
