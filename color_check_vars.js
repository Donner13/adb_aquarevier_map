const fs = require('fs');
const css = fs.readFileSync('index.html', 'utf8');

// Find color definitions
const rootRegex = /:root\s*{([^}]+)}/g;
let match;
while ((match = rootRegex.exec(css)) !== null) {
  console.log("Root definitions:", match[1]);
}

const darkRegex = /\[data-theme="dark"\]\s*{([^}]+)}/g;
while ((match = darkRegex.exec(css)) !== null) {
  console.log("Dark definitions:", match[1]);
}
