const chroma = require('chroma-js');

const vars = {
    "--bg-base": "#f8fafc",
    "--bg-surface": "#ffffff",
    "--bg-surface-hover": "#f1f5f9",
    "--border-color": "#cbd5e1",
    "--text-primary": "#0f172a",
    "--text-secondary": "#475569",
    "--accent-primary": "#2563eb",
    "--color-behorde": "#D55E00",
    "--color-forschung": "#0072B2",
    "--color-gebietskorperschaft": "#E69F00",
    "--color-gewerbe": "#CC79A7",
    "--color-landwirtschaft": "#009E73",
    "--color-netzwerk": "#56B4E9",
    "--color-entsorger": "#F0E442",
    "--color-sonstige": "#595959",

    // Dark mode vars
    "--dark-bg-base": "#0b0f19",
    "--dark-bg-surface": "rgba(17, 24, 39, 0.95)",
    "--dark-bg-surface-hover": "rgba(31, 41, 55, 0.95)",
    "--dark-border-color": "rgba(255, 255, 255, 0.12)",
    "--dark-text-primary": "#f3f4f6",
    "--dark-text-secondary": "#9ca3af",
};

function contrast(hex1, hex2) {
    if (hex1.startsWith('rgba')) {
        hex1 = chroma(hex1).hex();
    }
    if (hex2.startsWith('rgba')) {
        hex2 = chroma(hex2).hex();
    }
    return chroma.contrast(hex1, hex2);
}

console.log("=== LIGHT MODE CONTRAST ===");
console.log("Text Primary vs Surface:", contrast(vars["--text-primary"], vars["--bg-surface"]));
console.log("Text Secondary vs Surface:", contrast(vars["--text-secondary"], vars["--bg-surface"]));
console.log("Accent Primary vs Surface (AA normal req 4.5):", contrast(vars["--accent-primary"], vars["--bg-surface"]));

console.log("Group Colors vs Surface (should be readable if used as text, or 3:1 if UI components)");
['--color-behorde', '--color-forschung', '--color-gebietskorperschaft', '--color-gewerbe', '--color-landwirtschaft', '--color-netzwerk', '--color-entsorger', '--color-sonstige'].forEach(c => {
    console.log(`${c} vs Surface:`, contrast(vars[c], vars["--bg-surface"]));
});

console.log("\n=== DARK MODE CONTRAST ===");
console.log("Text Primary vs Surface:", contrast(vars["--dark-text-primary"], "#111827")); // roughly dark-bg-surface over black
console.log("Text Secondary vs Surface:", contrast(vars["--dark-text-secondary"], "#111827"));
console.log("Accent Primary vs Surface:", contrast(vars["--accent-primary"], "#111827"));

['--color-behorde', '--color-forschung', '--color-gebietskorperschaft', '--color-gewerbe', '--color-landwirtschaft', '--color-netzwerk', '--color-entsorger', '--color-sonstige'].forEach(c => {
    console.log(`${c} vs Dark Surface:`, contrast(vars[c], "#111827"));
});
