const { test, expect } = require('@playwright/test');

test.describe('Popup Component Unit Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        await page.evaluate(() => {
            window.escapeHtml = function(str) {
                if (str === null || str === undefined) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            window.L = {
                marker: () => ({ on: () => {}, getElement: () => document.createElement('div'), bindPopup: (html) => window._lastPopupHtml = html }),
                layerGroup: () => ({ addTo: () => ({}), addLayer: () => {} }),
                geoJSON: (data, opts) => {
                    if (data.features) {
                        data.features.forEach(f => {
                           if (opts.onEachFeature) {
                               const layer = { bindPopup: (html) => window._lastPopupHtml = html, on: () => {} };
                               opts.onEachFeature(f, layer);
                           }
                        });
                    }
                    return { eachLayer: () => {} };
                },
                divIcon: () => {},
                markerClusterGroup: () => ({ addLayers: () => {} })
            };
            window.map = { on: () => {} };
            window.overlayMaps = {};
            window.layerDataStore = {};
            window._lastPopupHtml = null;

            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({
                features: [{ properties: window._testProperties || {} }]
            })});

            window.AQUAREVIER_I18N = null;
        });

        const scriptContent = require('fs').readFileSync('./js/layers-loader.js', 'utf-8');
        await page.addScriptTag({ content: scriptContent });
    });

    test('generates basic popup HTML with correct structure', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = { name: 'Test Name', feld: 'Wert' };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: '📍', field: 'feld' }]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100)); // wait for mocked fetch
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('<div class="popup-card">');
        expect(popupHtml).toContain('<div class="popup-group" style="color:#ff0000">Test Group</div>');
        expect(popupHtml).toContain('<div class="popup-title">Test Name</div>');
        expect(popupHtml).toContain('<div class="popup-detail">📍 Wert</div>');
    });

    test('sanitizes inputs in popup generation to prevent XSS', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = {
                name: '<img src=x onerror=alert(1)>',
                feld: '<script>alert(2)</script>'
            };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: '📍', field: 'feld' }]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).not.toContain('<img');
        expect(popupHtml).not.toContain('<script>');
        expect(popupHtml).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(popupHtml).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    });

    test('uses fallback string for missing names', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = { feld: 'Wert' };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: '📍', field: 'feld' }]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('<div class="popup-title">Unbekannt</div>');
    });

    test('evaluates function expressions in popup fields', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = {
                val1: 'A',
                val2: 'B'
            };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#000000',
                groupLabel: 'Test',
                popupFields: [{
                    label: 'Expr',
                    expr: (p) => p.val1 + p.val2
                }]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('Expr: AB');
    });

    test('ignores missing values for popup fields', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = {
                feld1: 'Wert1'
            };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#000000',
                groupLabel: 'Test',
                popupFields: [
                    { label: 'Feld1', field: 'feld1' },
                    { label: 'Feld2', field: 'feld2' }
                ]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('Feld1');
        expect(popupHtml).not.toContain('Feld2');
    });

    test('renders pegel stats and drought trends correctly', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = {
                name: 'Pegel Test',
                mq_m3s: '1.5',
                nq_m3s: '0.1',
                mnq_m3s: '0.5',
                hq_m3s: '10.0'
            };
            const cfg = {
                id: 'pegel',
                file: 'pegel.geojson',
                color: '#000000',
                groupLabel: 'Pegel',
                pegelStats: true
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('📊 NQ');
        expect(popupHtml).toContain('1.5');
        expect(popupHtml).toContain('0.1');
        expect(popupHtml).toContain('10.0');
        expect(popupHtml).toContain('Kritisch (Dürre-Trend)');
        expect(popupHtml).toContain('#ef4444');
    });

    test('renders energy efficiency correctly based on ausbaugroesse_ew and id', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = {
                name: 'Kläranlage Test',
                anlagen_nr: '10',
                ausbaugroesse_ew: 200000
            };
            const cfg = {
                id: 'klaeranlagen',
                file: 'klaeranlagen.geojson',
                color: '#000000',
                groupLabel: 'Kläranlage'
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('⚡ Energieeffizienz');
        expect(popupHtml).toContain('Klasse B');
        expect(popupHtml).toContain('#4ade80'); // green
    });

    test('incorporates getZustaendigkeitHtml if defined globally', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = { name: 'Test' };
            window.getZustaendigkeitHtml = () => '<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>';

            const cfg = { id: 'test', file: 'test.geojson', color: '#000', groupLabel: 'Test' };
            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>');
    });

    test('renders custom footer template', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = { name: 'Test' };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#000',
                groupLabel: 'Test',
                footerTemplate: (p) => `Custom Footer for ${p.name}`
            };
            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('Custom Footer for Test');
    });

    test('renders glossar icons and suffixes', async ({ page }) => {
        const popupHtml = await page.evaluate(async () => {
            window._testProperties = { feld: '100' };
            const cfg = {
                id: 'test',
                file: 'test.geojson',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: 'Wert', field: 'feld', glossar: 'TEST_GLOSSAR', suffix: ' kg' }]
            };

            window.addGeoLayer(cfg, window.map, window.overlayMaps, window.layerDataStore);
            await new Promise(r => setTimeout(r, 100));
            return window._lastPopupHtml;
        });

        expect(popupHtml).toContain('<span class="glossar-icon" data-glossar="TEST_GLOSSAR">i</span>');
        expect(popupHtml).toContain('Wert');
        expect(popupHtml).toContain(': 100 kg');
    });
});
