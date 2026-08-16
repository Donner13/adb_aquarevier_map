const bg = [17, 24, 39]; // rgba(17, 24, 39, 0.95)
const fg = [156, 163, 175]; // #9ca3af

function l(rgb) {
    const a = rgb.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

const lum1 = l(bg);
const lum2 = l(fg);

const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
console.log("ratio:", ratio); // Yes, 6.98.

// Could it be that `--text-secondary` SHOULD BE #d1d5db or something to be even more readable, but 6.98 already passes AA?
// The prompt says: "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Maybe the prompt is talking about `--color-sonstige: #595959`?
