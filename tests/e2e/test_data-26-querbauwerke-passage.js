const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Audit: Querbauwerke should have ecological passability and drop height data', async () => {
    const geojsonPath = path.resolve(__dirname, '../../querbauwerke.geojson');
    const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

    const rurFeatures = data.features.filter(f => f.properties.gewaesser === 'Rur');

    // In strict audit tasks, we assert the *desired* future state.
    for (const feature of rurFeatures) {
        // We expect these properties to exist in the future, even if they fail now.
        expect(feature.properties, `Feature ${feature.properties.anlagen_nr} missing oekologische_durchgaengigkeit`).toHaveProperty('oekologische_durchgaengigkeit');
        expect(feature.properties, `Feature ${feature.properties.anlagen_nr} missing fallhoehe`).toHaveProperty('fallhoehe');
    }
});
