const chroma = require('chroma-js');

// We need to keep the Okabe-Ito theme but make them accessible >= 3.0 for background, and ideally >= 4.5 if used for text.
// We will only modify the base hex values slightly.
const okabe = {
    "behorde": "#D55E00",
    "forschung": "#0072B2",
    "gebietskorperschaft": "#E69F00",
    "gewerbe": "#CC79A7",
    "landwirtschaft": "#009E73",
    "netzwerk": "#56B4E9",
    "entsorger": "#F0E442",
    "sonstige": "#595959",
    "einzelakteure": "#A8A8A8",
    "konsortium": "#000000"
};

const bgLight = "#ffffff";
const bgDark = "#111827"; // approximation for rgba(17, 24, 39, 0.95)

for (let key in okabe) {
    let color = chroma(okabe[key]);

    // For markers (interactive/UI components) against map (mix of white/gray), we need 3:1.
    // For text in legend against surface (white), we need 4.5:1.
    // Let's create a text variant and a bg variant if possible, or just adjust to 4.5:1.
    // Let's adjust to 4.5:1 against light surface.

    let adjusted = color;
    let step = 0;
    while (chroma.contrast(adjusted, bgLight) < 4.5 && step < 100) {
        adjusted = adjusted.darken(0.05);
        step++;
    }

    console.log(`${key}: original ${okabe[key]} (${chroma.contrast(color, bgLight).toFixed(2)}) -> adjusted ${adjusted.hex()} (${chroma.contrast(adjusted, bgLight).toFixed(2)})`);
}
