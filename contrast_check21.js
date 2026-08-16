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

// Check #475569 against #111827
console.log("contrast #475569 vs #111827:", contrast("#111827", "#475569")); // 2.34
console.log("contrast #9ca3af vs #111827:", contrast("#111827", "#9ca3af")); // 6.98
console.log("contrast #6b7280 vs #111827:", contrast("#111827", "#6b7280")); // 4.54
console.log("contrast #595959 vs #111827:", contrast("#111827", "#595959")); // 2.53

// The task says:
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Maybe the prompt implies I need to change `--text-secondary` to `#9ca3af` because it was `#475569` initially? But wait! In dark theme it IS `#9ca3af`!
// Wait! Let me look at the FIRST line of my grep output!
//
// 26:            --text-secondary: #475569;
// 49:            --text-secondary: #9ca3af;
//
// If `--text-secondary` is `#9ca3af` in `body.dark-theme`, it's 6.98.
//
// Is there another text-muted or gedimmte texte?
// What about the "color" property applied directly?
// In `body.dark-theme .leaflet-bar a` we have `color: var(--text-primary);`
// In `body.dark-theme .search-box input` we have `color: #f8fafc;`
//
// Maybe the author of the issue calculated contrast against `#ffffff` instead of `#111827`?
// No, it says "im Dark Mode".

// Wait! Look at `var(--text-secondary, #64748b)`. Does it evaluate to `#64748b` somewhere?
