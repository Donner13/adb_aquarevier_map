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

// Background is #111827 (var(--bg-surface)) or #0b0f19 (var(--bg-base)).
// Let's test a few grays:
const grays = ["#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6", "#c0c6d1", "#cbd5e1"];

for (const gray of grays) {
    const bg = "#111827"; // worst case background? Or maybe we have a lighter element.
    const c = contrast(bg, gray);
    console.log(`Contrast against ${bg} for ${gray} is ${c}`);
}

for (const gray of grays) {
    const bg = "#1f2937"; // bg-surface-hover
    const c = contrast(bg, gray);
    console.log(`Contrast against ${bg} for ${gray} is ${c}`);
}
