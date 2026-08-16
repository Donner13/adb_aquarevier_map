const fs = require('fs');
let content = fs.readFileSync('js/layers-loader.js', 'utf8');
content = content.replace(/text\.replace\(\/\^\\uFEFF\//g, 'text.replace(/^\\uFEFF\\uFEFF/');
content = content.replace(/text\.replace\(\/\^\\\\uFEFF\//g, 'text.replace(/^\\\\uFEFF\\\\uFEFF/');
fs.writeFileSync('js/layers-loader.js', content);
