const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const internalHtml = fs.readFileSync('internal.html', 'utf8');

function extractStyles(html) {
    const regex = /body\.dark-theme\s*\{[^}]+\}/g;
    return html.match(regex);
}

console.log("Index styles:");
console.log(extractStyles(indexHtml));
console.log("\nInternal styles:");
console.log(extractStyles(internalHtml));
