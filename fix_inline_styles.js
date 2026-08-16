const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // First, remove the problematic CSS block we added to the style tag.
    let regexCss = /body\.dark-theme \[style\*=" color: #475569"\],[\s\S]*?body\.dark-theme \[style\^="color:#595959"\] \{\s*color: var\(--text-secondary\) !important;\s*\}/;
    content = content.replace(regexCss, '');

    // Next, replace hardcoded colors in inline styles with var(--text-secondary, fallback)
    // Looking for `color: #475569` -> `color: var(--text-secondary, #475569)`
    // and `color:#475569` -> `color: var(--text-secondary, #475569)`
    // and `color: #64748b` -> `color: var(--text-secondary, #64748b)`
    // and `color:#64748b` -> `color: var(--text-secondary, #64748b)`
    // and `color: #595959` -> `color: var(--text-secondary, #595959)`

    content = content.replace(/color:\s*#475569/gi, 'color: var(--text-secondary, #475569)');
    content = content.replace(/color:\s*#64748b/gi, 'color: var(--text-secondary, #64748b)');
    content = content.replace(/color:\s*#595959/gi, 'color: var(--text-secondary, #595959)');

    // Also, some SVGs use `stroke="#475569"`. We should replace that with `stroke="var(--text-secondary, #475569)"`
    content = content.replace(/stroke="#475569"/gi, 'stroke="var(--text-secondary, #475569)"');
    content = content.replace(/stroke="#64748b"/gi, 'stroke="var(--text-secondary, #64748b)"');
    content = content.replace(/stroke="#595959"/gi, 'stroke="var(--text-secondary, #595959)"');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
}

fixFile('index.html');
fixFile('internal.html');
