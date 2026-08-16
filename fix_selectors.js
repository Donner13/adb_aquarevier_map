const fs = require('fs');

function applyFix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Original CSS block to replace
    // body.dark-theme [style*="color: #475569"],
    // body.dark-theme [style*="color:#475569"],
    // body.dark-theme [style*="color: #64748b"],
    // body.dark-theme [style*="color:#64748b"],
    // body.dark-theme [style*="color: #595959"],
    // body.dark-theme [style*="color:#595959"] {
    //     color: var(--text-secondary) !important;
    // }

    let regex = /body\.dark-theme \[style\*="color: #475569"\],[\s\S]*?body\.dark-theme \[style\*="color:#595959"\] \{\s*color: var\(--text-secondary\) !important;\s*\}/;

    let newBlock = `body.dark-theme [style*="color: #475569;"],
        body.dark-theme [style*="color:#475569;"],
        body.dark-theme [style*="color: #475569\""],
        body.dark-theme [style*="color:#475569\""],
        body.dark-theme [style*="color: #64748b;"],
        body.dark-theme [style*="color:#64748b;"],
        body.dark-theme [style*="color: #64748b\""],
        body.dark-theme [style*="color:#64748b\""],
        body.dark-theme [style*="color: #595959;"],
        body.dark-theme [style*="color:#595959;"],
        body.dark-theme [style*="color: #595959\""],
        body.dark-theme [style*="color:#595959\""] {
            color: var(--text-secondary) !important;
        }`;

    let newContent = content.replace(regex, newBlock);
    if(newContent === content) {
        console.log(`Failed to apply fix to ${filePath}`);
    } else {
        fs.writeFileSync(filePath, newContent);
        console.log(`Successfully applied fix to ${filePath}`);
    }
}

applyFix('index.html');
applyFix('internal.html');
