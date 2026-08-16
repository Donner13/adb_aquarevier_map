const fs = require('fs');

function fixGemeinde(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // We already know js/gemeinde-steckbrief.js uses:
    // centerLat: g.count !== 0 ? g.latSum / g.count : null
    // dossier.centerLat = lats.length !== 0 ? lats.reduce((a, b) => a + b, 0) / lats.length : null;

    // Nothing more to fix there.
}

fixGemeinde('js/gemeinde-steckbrief.js');
