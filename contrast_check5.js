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

const map = {
  bgBase: "#0b0f19",
  bgSurface: "#111827",
  textSecondary: "#9ca3af", // old
  colorSonstige: "#595959",
  colorEinzelakteure: "#A8A8A8"
}

// Find a good replacement for textSecondary that is >= 4.5
const cTextSecondary = contrast(map.bgSurface, "#9ca3af");
// wait, #9ca3af is 6.98 > 4.5.

// Is there a light theme text-secondary that is used as fallback in dark theme or something?
// The problem statement says:
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."

console.log("textSecondary vs bgSurface:", contrast(map.bgSurface, "#9ca3af"));
console.log("colorSonstige vs bgBase:", contrast(map.bgBase, map.colorSonstige));
console.log("colorSonstige vs bgSurface:", contrast(map.bgSurface, map.colorSonstige));
console.log("colorEinzelakteure vs bgSurface:", contrast(map.bgSurface, map.colorEinzelakteure));

// We need to fix color-sonstige #595959 which has a contrast of ~2.5-2.7.
// What color provides >= 4.5 contrast against #111827 and #0b0f19? Let's find one.
function findColorForTargetContrast(bgHex, startHex, targetContrast) {
    let lum = luminance(hexToRgb(startHex));
    let color = startHex;
    // Just simple manual test:
    const grays = ["#6b7280", "#71717a", "#737373", "#828282", "#8b8b8b", "#909090", "#9ca3af"];
    for(let g of grays) {
        if(contrast(bgHex, g) >= targetContrast) {
            return g;
        }
    }
    return "#ffffff";
}

console.log("Replacement for colorSonstige (>4.5):", findColorForTargetContrast(map.bgSurface, map.colorSonstige, 4.5));

// What about #475569? That's the light-theme text-secondary!
// Wait! Wait! Wait! Look at line 207 in index.html (from previous grep) or maybe some inline styles.
// And `js/theme-darkmode.js` -- wait, js/theme-darkmode.js doesn't contain CSS variables directly.
// But it says: "js/theme-darkmode.js und style-Block". Let me check if there is an issue with js/theme-darkmode.js setting inline styles or classes.
