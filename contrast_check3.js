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

// "text-secondary" is currently #9ca3af.
// What about other elements that are dimmed or secondary?
console.log(contrast("#111827", "#9ca3af"));
console.log(contrast("#0b0f19", "#9ca3af"));

// Are there other colors defined in the Dark Theme that fail WCAG AA?
// Let's check `var(--color-sonstige)` which is `#595959`
console.log("sonstige vs surface:", contrast("#111827", "#595959"));
console.log("sonstige vs base:", contrast("#0b0f19", "#595959"));
console.log("einzelakteure vs base:", contrast("#0b0f19", "#A8A8A8"));

// What about #64748b which is hardcoded in index.html in a bunch of places (`color: var(--text-secondary, #64748b)`)?
// In dark theme, this resolves to #9ca3af which is 6.98
// If it didn't resolve to #9ca3af, then #64748b:
console.log("fallback vs surface:", contrast("#111827", "#64748b"));
console.log("fallback vs base:", contrast("#0b0f19", "#64748b"));

// Wait, the task says: "und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// And it specifically mentions "js/theme-darkmode.js und style-Block".
// Let's read js/theme-darkmode.js again.
