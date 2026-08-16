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

console.log("text-secondary vs bg-surface:", contrast("#111827", "#9ca3af"));
console.log("text-secondary vs bg-base:", contrast("#0b0f19", "#9ca3af"));
console.log("fallback vs bg-surface:", contrast("#111827", "#64748b"));
console.log("fallback vs bg-base:", contrast("#0b0f19", "#64748b"));

// Wait, "#9ca3af" gives contrast of 6.98 > 4.5.
// Does the prompt mean the light-theme text-secondary (#475569) is somehow used in dark mode?
// Ah! Check how text-secondary is defined in index.html!
