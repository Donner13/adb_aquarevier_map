const fs = require('fs');

const data = JSON.parse(fs.readFileSync('contacts_anonymized.geojson', 'utf8'));

const mainPartners = [
    'wver',
    'schoellershammer',
    'smurfit',
    'tillmann',
    'rlv',
    'eschweiler',
    'fiw',
    'isa',
    'iww'
];

const isMainPartner = (name) => {
    const nameLower = name.toLowerCase();
    return mainPartners.some(p => nameLower.includes(p));
};

function createLogoCalloutMarker(lat, lng, name) {
    const nameLower = name.toLowerCase();
    let logoHtml = '';
    let svgContent = '';
    let dx = 0, dy = 0;
    let sizeX = 350, sizeY = 250;
    let ax = 175, ay = 125;

    if (nameLower.includes('wver') || nameLower.includes('eifel-rur')) {
        dx = -90; dy = -60;
        logoHtml = `
            <div class="logo-box logo-wver-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 4px 8px; background: #ffffff; border: 1.5px solid #0067b1; display: flex; align-items: center; justify-content: center; width: 110px; height: 38px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,103,177,0.15); border-radius: 4px;">
                <img src="https://wver.de/wp-content/uploads/2025/08/wver-logo.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="WVER">
            </div>
        `;
        const targetX = ax + dx + 55;
        const targetY = ay + dy + 19;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#0067b1" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#0067b1" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#0067b1" />
        `;
    } else if (nameLower.includes('schoellershammer')) {
        dx = 30; dy = -60;
        logoHtml = `
            <div class="logo-box logo-schoellershammer-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 4px 8px; background: #ffffff; border: 1.5px solid #000000; display: flex; align-items: center; justify-content: center; width: 150px; height: 38px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border-radius: 4px;">
                <img src="https://www.schoellershammer.de/wp-content/themes/schoellershammer/assets/images/logo.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="SCHOELLERSHAMMER">
            </div>
        `;
        const targetX = ax + dx + 10;
        const targetY = ay + dy + 19;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#000000" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#000000" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#000000" />
        `;
    } else if (nameLower.includes('smurfit')) {
        dx = 30; dy = -25;
        logoHtml = `
            <div class="logo-box logo-smurfit-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 4px 8px; background: #ffffff; border: 1.5px solid #005a9c; display: flex; align-items: center; justify-content: center; width: 140px; height: 38px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(0,90,156,0.1); border-radius: 4px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/Smurfit_Westrock_%28logo%29.svg" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Smurfit Westrock">
            </div>
        `;
        const targetX = ax + dx + 10;
        const targetY = ay + dy + 19;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#005a9c" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#005a9c" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#005a9c" />
        `;
    } else if (nameLower.includes('tillmann') || nameLower.includes('tillman')) {
        dx = 20; dy = 20;
        logoHtml = `
            <div class="logo-box logo-tillmann-box" style="left: ${ax + dx}px; top: ${ay + dy}px; border: 1.5px solid #1d4ed8; display: flex; flex-direction: column; align-items: center; padding: 4px 10px; background: #ffffff; border-radius: 4px; box-shadow: 0 2px 6px rgba(29,78,216,0.1);">
                <div style="font-family:'Outfit',sans-serif; font-weight:900; font-size:8px; letter-spacing:0.1em; color:#1d4ed8; text-transform:uppercase; border-bottom: 2px solid #1d4ed8; padding-bottom: 1px; margin-bottom: 1px;">PAPIERFABRIK</div>
                <div style="font-family:'Outfit',sans-serif; font-weight:900; font-size:14px; letter-spacing:0.05em; color:#1d4ed8; text-transform:uppercase; line-height: 1.1;">TILLMANN</div>
            </div>
        `;
        const targetX = ax + dx + 10;
        const targetY = ay + dy + 10;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#1d4ed8" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#1d4ed8" />
        `;
    } else if (nameLower.includes('rlv') || nameLower.includes('landwirtschafts-verband')) {
        dx = -80; dy = -85;
        logoHtml = `
            <div class="logo-box logo-rlv-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 4px 8px; background: #ffffff; border: 1.5px solid #15803d; display: flex; align-items: center; justify-content: center; width: 100px; height: 38px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(21,128,61,0.15); border-radius: 4px;">
                <img src="https://www.rlv.de/wp-content/themes/rlv_template_final/assets/img/logo_rlv.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="RLV">
            </div>
        `;
        const targetX = ax + dx + 50;
        const targetY = ay + dy + 19;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#15803d" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#15803d" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#15803d" />
        `;
    } else if (nameLower.includes('eschweiler')) {
        dx = -170; dy = -30;
        logoHtml = `
            <div class="logo-box logo-eschweiler-box" style="left: ${ax + dx}px; top: ${ay + dy}px; padding: 4px 8px; background: #ffffff; border: 1.5px solid #1d4ed8; display: flex; align-items: center; justify-content: center; width: 165px; height: 42px; box-sizing: border-box; box-shadow: 0 2px 6px rgba(29,78,216,0.15); border-radius: 4px; gap: 6px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/DEU_Eschweiler_COA.svg" style="max-width: 25px; max-height: 100%; object-fit: contain;" alt="Stadt Eschweiler">
                <span style="font-family:'Outfit',sans-serif; font-weight:800; font-size:11px; color:#1d4ed8; letter-spacing:0.03em; line-height: 1.1;">STADT<br>ESCHWEILER</span>
            </div>
        `;
        const targetX = ax + dx + 135;
        const targetY = ay + dy + 21;
        svgContent = `
            <line x1="${ax}" y1="${ay}" x2="${targetX}" y2="${targetY}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${ax}" y1="${ay}" x2="${ax + (targetX - ax)*0.2}" y2="${ay + (targetY - ay)*0.2}" stroke="#1d4ed8" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax + (targetX-ax)*0.08 - (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 + (targetX-ax)*0.04} ${ax + (targetX-ax)*0.08 + (targetY-ay)*0.04},${ay + (targetY-ay)*0.08 - (targetX-ax)*0.04}" fill="#1d4ed8" />
        `;
    } else if (nameLower.includes('fiw') || nameLower.includes('isa') || nameLower.includes('iww')) {
        dx = -160; dy = 20;
        logoHtml = `
            <div class="logo-box logo-combined-box" style="left: ${ax + dx}px; top: ${ay + dy}px;">
                <div class="logo-combined-row" style="color: #1d4ed8; display: flex; align-items: center;">
                    <span style="border-right: 1.5px solid #cbd5e1; padding-right: 6px;">ISA</span>
                    <span style="color: #0891b2; border-right: 1.5px solid #cbd5e1; padding-right: 6px; padding-left: 6px;">IWW</span>
                    <span style="color: #16a34a; padding-left: 6px;">FiW</span>
                </div>
                <div style="font-size: 8px; color: var(--text-secondary); font-weight: 600; text-align: center; border-top: 1px solid #e2e8f0; margin-top: 4px; padding-top: 2px; letter-spacing: 0.02em;">
                    Aachener Wasserforschung
                </div>
            </div>
        `;
        const startX = ax + dx + 120;
        const startY = ay + dy + 15;
        const t2x = ax + 35;
        const t2y = ay - 25;
        svgContent = `
            <line x1="${startX}" y1="${startY}" x2="${ax}" y2="${ay}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${startX}" y1="${startY}" x2="${startX + (ax - startX)*0.25}" y2="${startY + (ay - startY)*0.25}" stroke="#1d4ed8" stroke-width="2" />
            <circle cx="${ax}" cy="${ay}" r="4" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${ax},${ay} ${ax - 8},${ay + 4} ${ax - 4},${ay + 8}" fill="#1d4ed8" />

            <line x1="${startX}" y1="${startY}" x2="${t2x}" y2="${t2y}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="${startX}" y1="${startY}" x2="${startX + (t2x - startX)*0.25}" y2="${startY + (t2y - startY)*0.25}" stroke="#16a34a" stroke-width="2" />
            <circle cx="${t2x}" cy="${t2y}" r="4" fill="#16a34a" stroke="#ffffff" stroke-width="1.5" />
            <polygon points="${t2x},${t2y} ${t2x - 8},${t2y + 4} ${t2x - 4},${t2y + 8}" fill="#16a34a" />
        `;
    } else {
        return null;
    }

    return { dx, dy, logoHtml, svgContent };
}

data.features.forEach((feature, index) => {
    const props = feature.properties;
    if (isMainPartner(props.name)) {
        const res = createLogoCalloutMarker(0, 0, props.name);
        if (!res) {
            console.error(`ERROR: Succeeded in isMainPartner but failed inside createLogoCalloutMarker for name: "${props.name}"`);
            process.exit(1);
        } else {
            console.log(`OK: "${props.name}" matches correctly.`);
        }
    }
});

console.log("All main partner logo matches tested successfully in JS environment!");
