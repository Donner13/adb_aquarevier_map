// the task says: "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// There are no CSS-variables inside js/theme-darkmode.js, but maybe there is some other style-block, e.g. in index.html, internal.html.

// Wait, let's look at index.html and internal.html
const fs = require('fs');

function checkFile(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    const styleBlocks = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (!styleBlocks) return;

    // We want to find colors used in body.dark-theme or in inline styles that are applied dynamically.
    // In dark-theme we have:
    // --bg-base: #0b0f19;
    // --bg-surface: rgba(17, 24, 39, 0.95); => basically #111827
    // --text-secondary: #9ca3af;

    // So the problem might be `--color-sonstige` (#595959)
    // Or maybe something else. Let's look at `js/theme-darkmode.js`. Wait, maybe I should read `js/theme-darkmode.js` again very carefully.
}
checkFile('index.html');
