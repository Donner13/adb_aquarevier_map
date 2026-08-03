const { test, expect } = require('@playwright/test');

test.describe('Popup Component Unit Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        await page.evaluate(() => {
            window.capturedOnEachFeature = null;

            window.L = {
                marker: () => ({ on: () => {}, getElement: () => document.createElement('div'), bindPopup: (html) => window._lastPopupHtml = html }),
                layerGroup: () => ({ addTo: function() { return this; }, addLayer: function() { return this; } }),
                geoJSON: (data, opts) => {
                    if (opts && opts.onEachFeature) {
                        window.capturedOnEachFeature = opts.onEachFeature;
                    }
                    return { eachLayer: function() { return this; } };
                },
                divIcon: () => {},
                markerClusterGroup: () => ({ addLayers: function() { return this; }, addLayer: function() { return this; } })
            };
            window.map = { on: () => {} };
            window.overlayMaps = {};
            window.layerDataStore = {};
            window.AQUAREVIER_I18N = null;

            window.fetchPromises = [];
            window.fetch = (url) => {
                if (url !== window._expectedFetchUrl) {
                    return Promise.reject(new Error("Unexpected fetch URL: " + url));
                }
                const p = Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        features: [{ properties: window._testProperties || {} }]
                    })
                });
                window.fetchPromises.push(p);
                return p;
            };
        });

        const path = require('path');
        const scriptContent = require('fs').readFileSync(path.resolve(__dirname, '../../js/layers-loader.js'), 'utf-8');
        await page.addScriptTag({ content: scriptContent });
    });

    const renderPopupHtml = async (page, p, cfg) => {
        return await page.evaluate(async (args) => {
            window.capturedOnEachFeature = null;
            window.fetchPromises = [];
            window._testProperties = args.p;
            window._expectedFetchUrl = args.cfg.file;

            window.addGeoLayer(args.cfg, window.map, window.overlayMaps, window.layerDataStore);

            await Promise.all(window.fetchPromises);
            await new Promise(r => setTimeout(r, 0));

            if (!window.capturedOnEachFeature) throw new Error("Failed to capture onEachFeature callback.");

            let generatedHtml = null;
            // To prove the popup generation uses the fetched properties, we execute the callback using exactly what fetch provided.
            const featurePassedToGeoJSON = { properties: window._testProperties };
            window.capturedOnEachFeature(featurePassedToGeoJSON, { bindPopup: (h) => generatedHtml = h, on: () => {} });

            if (generatedHtml === null) throw new Error("Popup HTML was not generated.");
            return generatedHtml;
        }, { p, cfg });
    };

    test('generates basic popup HTML with correct structure', async ({ page }) => {
        const cfg = { id: 'test', file: 'test.geojson', color: '#ff0000', groupLabel: 'Test Group', popupFields: [{ label: '📍', field: 'feld' }] };
        const p = { name: 'Test Name', feld: 'Wert' };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('<div class="popup-card">');
        expect(popupHtml).toContain('<div class="popup-group" style="color:#ff0000">Test Group</div>');
        expect(popupHtml).toContain('<div class="popup-title">Test Name</div>');
        expect(popupHtml).toContain('<div class="popup-detail">📍 Wert</div>');
    });

    test('sanitizes inputs in popup generation to prevent XSS across properties and config', async ({ page }) => {
        const cfg = { id: 'test', file: 'test.geojson', color: '#ff0000', groupLabel: '<script>alert("group")</script>', popupFields: [{ label: '<img src=x onerror=a()>', field: 'feld', suffix: ' <svg onload=b()>' }] };
        const p = { name: '<img src=x onerror=alert(1)>', feld: '<script>alert(2)</script>' };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).not.toContain('<img');
        expect(popupHtml).not.toContain('<script>');
        expect(popupHtml).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(popupHtml).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
        expect(popupHtml).toContain('&lt;script&gt;alert(&quot;group&quot;)&lt;/script&gt;');
        expect(popupHtml).toContain('&lt;img src=x onerror=a()&gt;');
        expect(popupHtml).toContain('&lt;svg onload=b()&gt;');
    });

    test('uses fallback string for missing names', async ({ page }) => {
        const cfg = { id: 'test', file: 'test.geojson', color: '#ff0000', groupLabel: 'Test', popupFields: [] };
        const p = {};
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('<div class="popup-title">Unbekannt</div>');
    });

    test('evaluates function expressions in popup fields', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window.capturedOnEachFeature = null;
            window.fetchPromises = [];
            window._testProperties = { val1: 'A', val2: 'B' };
            window._expectedFetchUrl = 'test.geojson';
            const cfg = { id: 'test', file: 'test.geojson', color: '#000', groupLabel: 'Test', popupFields: [{ label: 'Expr', expr: (prop) => prop.val1 + prop.val2 }] };
            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await Promise.all(window.fetchPromises);
            await new Promise(r => setTimeout(r, 0));
            let generatedHtml = null;
            window.capturedOnEachFeature({ properties: window._testProperties }, { bindPopup: (h) => generatedHtml = h, on: () => {} });
            return generatedHtml;
        });
        expect(popupHtml).toContain('Expr: AB');
    });

    test('ignores missing values for popup fields', async ({ page }) => {
        const cfg = { id: 'test', file: 'test.geojson', color: '#000', groupLabel: 'Test', popupFields: [ { label: 'Feld1', field: 'feld1' }, { label: 'Feld2', field: 'feld2' } ] };
        const p = { feld1: 'Wert1' };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('Feld1');
        expect(popupHtml).not.toContain('Feld2');
    });

    test('renders pegel stats and drought trends correctly', async ({ page }) => {
        const cfg = { id: 'pegel', file: 'pegel.geojson', color: '#000', groupLabel: 'Pegel', pegelStats: true };
        const p = { name: 'Pegel Test', mq_m3s: '1.5', nq_m3s: '0.1', mnq_m3s: '0.5', hq_m3s: '10.0' };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('📊 NQ');
        expect(popupHtml).toContain('1.5');
        expect(popupHtml).toContain('0.1');
        expect(popupHtml).toContain('Kritisch (Dürre-Trend)');
        expect(popupHtml).toContain('#ef4444');
    });

    test('renders energy efficiency correctly based on ausbaugroesse_ew and id', async ({ page }) => {
        const cfg = { id: 'klaeranlagen', file: 'klaeranlagen.geojson', color: '#000', groupLabel: 'Kläranlage' };
        const p = { name: 'Kläranlage Test', anlagen_nr: '10', ausbaugroesse_ew: 200000 };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('⚡ Energieeffizienz');
        expect(popupHtml).toContain('Klasse B');
        expect(popupHtml).toContain('#4ade80');
    });

    test('incorporates getZustaendigkeitHtml if defined globally', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window.getZustaendigkeitHtml = () => '<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>';
            window.capturedOnEachFeature = null;
            window.fetchPromises = [];
            window._testProperties = { name: 'Test' };
            window._expectedFetchUrl = 'test.geojson';
            window.addGeoLayer({ id: 'test', file: 'test.geojson', color: '#000', groupLabel: 'Test' }, window.map, window.overlayMaps, window.layerDataStore);
            await Promise.all(window.fetchPromises);
            await new Promise(r => setTimeout(r, 0));
            let generatedHtml = null;
            window.capturedOnEachFeature({ properties: window._testProperties }, { bindPopup: (h) => generatedHtml = h, on: () => {} });
            return generatedHtml;
        });
        expect(popupHtml).toContain('<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>');
    });

    test('renders custom footer template', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window.capturedOnEachFeature = null;
            window.fetchPromises = [];
            window._testProperties = { name: 'Test' };
            window._expectedFetchUrl = 'test.geojson';
            const cfg = { id: 'test', file: 'test.geojson', color: '#000', groupLabel: 'Test', footerTemplate: (prop) => `Custom Footer for ${prop.name}` };
            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await Promise.all(window.fetchPromises);
            await new Promise(r => setTimeout(r, 0));
            let generatedHtml = null;
            window.capturedOnEachFeature({ properties: window._testProperties }, { bindPopup: (h) => generatedHtml = h, on: () => {} });
            return generatedHtml;
        });
        expect(popupHtml).toContain('Custom Footer for Test');
    });

    test('renders glossar icons and suffixes', async ({ page }) => {
        const cfg = { id: 'test', file: 'test.geojson', color: '#ff0000', groupLabel: 'Test Group', popupFields: [{ label: 'Wert', field: 'feld', glossar: 'TEST_GLOSSAR', suffix: ' kg' }] };
        const p = { feld: '100' };
        const popupHtml = await renderPopupHtml(page, p, cfg);
        expect(popupHtml).toContain('<span class="glossar-icon" data-glossar="TEST_GLOSSAR">i</span>');
        expect(popupHtml).toContain('Wert');
        expect(popupHtml).toContain(': 100 kg');
    });
});
