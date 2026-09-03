const chroma = require('chroma-js');

// Current dark mode vars
const vars = {
    "--dark-text-primary": "#f3f4f6", // Contrast vs #111827 is 16.1
    "--dark-text-secondary": "#9ca3af", // Contrast vs #111827 is 6.9
    "--dark-accent-primary": "#3b82f6" // Wait, I didn't see dark accent primary in the vars, but it's used?
};

// Error: #ef4444 (3.7 light, 4.7 dark) -> need to tweak light.
// Danger: #dc2626 (4.8 light, 3.6 dark) -> good for light text, good for dark interactive.
console.log(chroma.contrast('#cc0000', '#ffffff')); // Error Light Text 7.4
console.log(chroma.contrast('#ff6666', '#111827')); // Error Dark Text 8.6
