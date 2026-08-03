const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
const PORT = 8011;

test.beforeAll(async () => {
    server = http.createServer((req, res) => {
        let filePath = path.join(__dirname, '../..', req.url.split('?')[0]);
        if (filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.geojson' || ext === '.json') contentType = 'application/json';
            if (ext === '.png') contentType = 'image/png';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
    await new Promise(r => server.listen(PORT, r));
});

test.afterAll(() => {
    if (server) server.close();
});

test('Batch 11: Export GeoJSON Serialization Format Validity', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForTimeout(2000); // Wait for layers to load

    // Wait for data to populate
    await page.waitForFunction(() => window.layerDataStore && Object.keys(window.layerDataStore).length > 0);

    // Setup listener before interaction
    const downloadPromise = page.waitForEvent('download');

    // Make sure at least one layer is active to trigger the export properly
    // The default might have active layers, but just in case:
    await page.evaluate(() => {
        if (typeof window.exportActiveLayersData === 'function') {
            window.exportActiveLayersData('geojson');
        } else {
            const btn = document.getElementById('open-data-export-btn');
            if (btn) btn.click();
        }
    });

    const download = await downloadPromise;
    const downloadPath = await download.path();

    const content = fs.readFileSync(downloadPath, 'utf8');
    let geojsonData;
    try {
        geojsonData = JSON.parse(content);
    } catch(e) {
        throw new Error('Exported file is not valid JSON: ' + e.message);
    }

    // Assertions for GeoJSON format validity
    expect(geojsonData.type).toBe('FeatureCollection');
    expect(Array.isArray(geojsonData.features)).toBeTruthy();

    // Check metadata presence (ELWAS specific extension)
    expect(geojsonData._metadata).toBeDefined();
    expect(geojsonData._metadata.license).toBeDefined();
    expect(geojsonData._metadata.feature_count).toBe(geojsonData.features.length);

    // Verify features structure
    if (geojsonData.features.length > 0) {
        const firstFeature = geojsonData.features[0];
        expect(firstFeature.type).toBe('Feature');
        expect(firstFeature.geometry).toBeDefined();
        expect(['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].includes(firstFeature.geometry.type)).toBeTruthy();
        expect(Array.isArray(firstFeature.geometry.coordinates)).toBeTruthy();
        expect(firstFeature.properties).toBeDefined();
    }

    console.log('✓ Batch 11 Verification Passed: Exported GeoJSON is strictly valid and properly formatted!');
});
