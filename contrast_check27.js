const { hexToRgb, luminance, contrast } = {
  hexToRgb: (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  },
  luminance: ({ r, g, b }) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  },
  contrast: function(hex1, hex2) {
    const lum1 = this.luminance(this.hexToRgb(hex1));
    const lum2 = this.luminance(this.hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }
};

console.log("6366f1 vs 111827", contrast("#111827", "#6366f1")); // 4.19. (accent-primary)
console.log("818cf8 vs 111827", contrast("#111827", "#818cf8")); // 6.36. (lighter accent-primary)

// What about text-secondary? If the issue reporter thought 6.98 was too dim...
// Or maybe I am supposed to change `color: var(--text-secondary, #64748b)` usages in index.html to not use `#64748b`? No, `#64748b` is fallback.
