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

console.log("contrast #9ca3af vs #111827:", contrast("#111827", "#9ca3af")); // 6.98
console.log("contrast #6b7280 vs #111827:", contrast("#111827", "#6b7280")); // 4.54
console.log("contrast #475569 vs #111827:", contrast("#111827", "#475569")); // 2.34
console.log("contrast #595959 vs #111827:", contrast("#111827", "#595959")); // 2.53
