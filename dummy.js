const fs = require('fs');

let content = fs.readFileSync('js/layers-loader.js', 'utf-8');
console.log(content.includes("dummyLogoStr"));
