const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldPopup = `                const popupContent = \`
                    <div class="popup-card">
                        <div class="popup-group" style="color: \${color}">\${props.group}</div>
                        <div class="popup-title">\${props.name}</div>
                        <div class="popup-detail" style="font-family: monospace; font-size: 0.625rem; margin-top: 6px;">
                            📍 \${lat.toFixed(6)}, \${lng.toFixed(6)}
                        </div>
                    </div>
                \`;
                marker.bindPopup(popupContent);`;

const newPopup = `                let popupContent = \`
                    <div class="popup-card extended-popup">
                        <div class="popup-group" style="color: \${color}">\${props.group || ''}</div>
                        <div class="popup-title">\${props.name || ''}</div>
                        <div class="popup-body">
                \`;

                if (props.organisation) popupContent += \`<div class="popup-detail"><strong>Organisation:</strong> \${props.organisation}</div>\`;
                if (props.institution) popupContent += \`<div class="popup-detail"><strong>Institution:</strong> \${props.institution}</div>\`;
                if (props.bereich) popupContent += \`<div class="popup-detail"><strong>Bereich:</strong> \${props.bereich}</div>\`;
                if (props.email) popupContent += \`<div class="popup-detail"><strong>E-Mail:</strong> <a href="mailto:\${props.email}">\${props.email}</a></div>\`;
                if (props.phone || props.telefon) popupContent += \`<div class="popup-detail"><strong>Telefon:</strong> \${props.phone || props.telefon}</div>\`;

                popupContent += \`
                            <div class="popup-detail coords-detail">
                                📍 \${lat.toFixed(6)}, \${lng.toFixed(6)}
                            </div>
                        </div>
                \`;

                const websiteUrl = props.website || props.url;
                if (websiteUrl) {
                    popupContent += \`
                        <div class="popup-footer">
                            <a href="\${websiteUrl.startsWith('http') ? websiteUrl : 'http://' + websiteUrl}" target="_blank" class="website-btn">Zur Website</a>
                        </div>
                    \`;
                }

                popupContent += \`</div>\`;

                marker.bindPopup(popupContent);

                // Optional: Karte bleibt zentriert auf dem Marker beim Öffnen
                marker.on('click', function(e) {
                    map.setView(e.target.getLatLng());
                });`;

if (html.includes(oldPopup)) {
    html = html.replace(oldPopup, newPopup);
    fs.writeFileSync('index.html', html);
    console.log("Popup updated successfully.");
} else {
    console.log("Could not find the target code to replace.");
}
