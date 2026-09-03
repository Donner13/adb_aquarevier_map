const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `<div class="contacts-meta" id="contacts-count">0 von 0 Kontakten angezeigt</div>`;

const resetBtnStr = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div class="contacts-meta" id="contacts-count" style="margin-bottom: 0;">0 von 0 Kontakten angezeigt</div>
                        <button id="reset-filters-btn" class="filter-btn" style="padding: 4px 8px; font-size: 0.625rem;">Filter zurücksetzen</button>
                    </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, resetBtnStr);
    fs.writeFileSync('index.html', html);
    console.log("Reset button added successfully.");
} else {
    console.log("Could not find the target string to insert reset button.");
}
