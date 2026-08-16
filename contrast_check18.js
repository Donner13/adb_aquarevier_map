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
// What else could it be? What about `--text-secondary` in Light mode overriding Dark mode? No, they use class overrides correctly.
// Let's reconsider `--text-secondary: #9ca3af;` inside `.dark-theme`. Is #9ca3af enough?
// What if we just change `#9ca3af` to a brighter gray?
console.log("Contrast for #9ca3af vs bg #0b0f19:", contrast("#0b0f19", "#9ca3af")); // 7.5
console.log("Contrast for #9ca3af vs bg #111827:", contrast("#111827", "#9ca3af")); // 6.98

// What if the prompt implies we should find `#64748b` usages and fix them where they explicitly set gedimmte texte?
// "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// And what if the contrast isn't the problem with `--text-secondary`, but the problem is with the contrast between something else?
