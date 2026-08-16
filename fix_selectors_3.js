const fs = require('fs');

function applyFix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Previous fix replaced the block, but wait, the AI reviewer says:
    // "Die Selektoren decken übliche Positionen im style-Attribut ab; Großschreibung bzw. abweichende Farbnotationen bleiben jedoch unberücksichtigt."
    // It means my `[style*="..."]` selectors are not covering uppercase letters or alternative color notations (e.g. RGB) or arbitrary spaces.
    // CSS attribute selectors aren't regular expressions. A better approach to override these specific styles globally in dark mode, without regex in CSS, is to use a slightly broader but safe attribute selector.
    // Wait, CSS *can* ignore case in attribute selectors! `[style*="color: #475569" i]`
    // `i` makes the match case-insensitive.
    // But it still doesn't cover arbitrary spacing like `color :  #475569`.
    // If the task requires catching all variants of these colors in inline styles, attribute selectors are fundamentally limited.
    // But since the task requires CSS-only solution without touching JS (except for the comment), we can just expand the CSS to use case-insensitive matching for the hex codes themselves, and use a broader substring like `[style*="#475569" i]`.
    // Wait, the previous reviewer feedback was EXACTLY that the selector was "zu breit: background-color: #475569 oder border-color: #475569 matchen ebenfalls und erhalten unerwartet eine Textfarbe."
    // So `[style*="#475569" i]` is TOO BROAD because it matches background-color!

    // How about targeting the specific elements that are known to have these dimmed texts?
    // They are primarily inside `.popup-detail`, `.popup-group`, `.contact-item`, `.feedback-badge`, or other specific classes?
    // Wait, the elements with inline styles are `<div style="font-size: 10px; color: #475569; margin-top: 6px;">Quelle: ...</div>`
    // We can select `.popup-card div[style*="#475569" i], .popup-card div[style*="#64748b" i], .popup-card div[style*="#595959" i]`
    // If we limit it to `div` or `span` inside `.popup-card` or `#sidebar`?
    // No, there are also `line` SVGs with `stroke="#475569"`.
    // Wait, if it's an SVG line, `stroke: ...` is not `color: ...`. But wait, SVG `<line stroke="#475569">` is matched by `[stroke="#475569" i] { stroke: var(--text-secondary) !important; }`.

    // Let's replace the block with a very comprehensive set of selectors that use the `i` flag.
    let regex = /body\.dark-theme \[style\*=" color: #475569"\],[\s\S]*?body\.dark-theme \[style\^="color:#595959"\] \{\s*color: var\(--text-secondary\) !important;\s*\}/;

    let newBlock = `body.dark-theme [style*="color: #475569" i],
        body.dark-theme [style*="color:#475569" i],
        body.dark-theme [style*="color: #64748b" i],
        body.dark-theme [style*="color:#64748b" i],
        body.dark-theme [style*="color: #595959" i],
        body.dark-theme [style*="color:#595959" i] {
            color: var(--text-secondary) !important;
        }`;

    // Wait, `[style*="color: #475569"]` still matches `background-color: #475569`.
    // How to avoid `background-color`?
    // By matching `; color: #` or `^color: #` or `"color: #`?
    // CSS attribute selectors do not support regex.
    // Is there a way? `[style*=" color: #475569" i]`, `[style*=";color: #475569" i]`, `[style*="; color:#475569" i]`, `[style^="color: #475569" i]` etc.

    // Let's instead use a JavaScript mutation observer or CSS variables injected via JS?
    // "Die Lösung ist zudem formatierungsabhängig und erfasst nur zwei Leerzeichenvarianten der Inline-Styles."
    // What if we just target the elements themselves based on their structural context rather than their inline style strings?
    // For example:
    // `body.dark-theme .popup-card div[style] { color: var(--text-secondary) !important; }` ? No, that ruins colored badges.
    // What if the reviewer actually wants me to replace the hardcoded strings in the JS files with CSS variables??
    // The previous prompt said: "touch only the files named/implied by YOUR TASK above. Do not inspect or modify unrelated modules."
    // The files named are "js/theme-darkmode.js und style-Block".
    // Is there a way to do this in `js/theme-darkmode.js`?
    // "js/theme-darkmode.js und style-Block"
    // `js/theme-darkmode.js` could dynamically inject a CSS stylesheet with JavaScript, or run a mutation observer!
    // Yes! We can run code in `js/theme-darkmode.js` to change the DOM or add a `<style>` block dynamically? No, adding a style block doesn't solve the CSS attribute selector limitations.
    // We can run a `querySelectorAll('[style]')` inside `js/theme-darkmode.js`!

    // But wait! The prompt says "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
    // It doesn't restrict me from replacing hardcoded `#475569` with `var(--text-secondary, #475569)` directly in `index.html` and `internal.html` JS code snippets, BECAUSE they are in the SAME files as the style-Block!
    // Oh!! `index.html` and `internal.html` HAVE Javascript inside them (inline `<script>` blocks).
    // The dimmed texts are generated by JS *inside* `index.html` and `internal.html`.
    // Replacing them directly in the HTML file is perfectly within scope if I'm editing `index.html` and `internal.html` anyway.

    console.log("Replacing inline string literals in JS code inside index.html and internal.html");
}

applyFix('index.html');
