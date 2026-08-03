const { test, expect } = require('@playwright/test');

test.describe('Popup Component Unit Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        // We will read layers-loader.js and extract JUST buildPopupHtml and escapeHtml
        // to test pure template rendering without mocked Leaflet/fetch!
        const scriptContent = require('fs').readFileSync('./js/layers-loader.js', 'utf-8');

        await page.evaluate((scriptStr) => {
            // Extract escapeHtml natively from the script string
            const escapeMatch = scriptStr.match(/function escapeHtml\([\s\S]*?\n\}/);

            // Extract buildPopupHtml natively from the script string
            let buildPopupStr = scriptStr.substring(
                scriptStr.indexOf('function buildPopupHtml(p) {'),
                scriptStr.indexOf('// --- GWM special case')
            );

            // Rewrite the function signature to accept cfg as a parameter instead of closing over it
            buildPopupStr = buildPopupStr.replace('function buildPopupHtml(p) {', 'function buildPopupHtml(p, cfg) {');

            // Create the isolated execution environment
            const executableStr = `
                ${escapeMatch[0]}
                ${buildPopupStr}
                window.renderPopup = buildPopupHtml;
                window.AQUAREVIER_I18N = null;
                window.getZustaendigkeitHtml = undefined;
            `;

            const scriptEl = document.createElement('script');
            scriptEl.textContent = executableStr;
            document.head.appendChild(scriptEl);
        }, scriptContent);
    });

    test('generates basic popup HTML with correct structure', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: '📍', field: 'feld' }]
            };
            const p = { name: 'Test Name', feld: 'Wert' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('<div class="popup-card">');
        expect(popupHtml).toContain('<div class="popup-group" style="color:#ff0000">Test Group</div>');
        expect(popupHtml).toContain('<div class="popup-title">Test Name</div>');
        expect(popupHtml).toContain('<div class="popup-detail">📍 Wert</div>');
    });

    test('sanitizes inputs in popup generation to prevent XSS across properties and config', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#ff0000',
                groupLabel: '<script>alert("group")</script>',
                popupFields: [{ label: '<img src=x onerror=a()>', field: 'feld', suffix: ' <svg onload=b()>' }]
            };
            const p = {
                name: '<img src=x onerror=alert(1)>',
                feld: '<script>alert(2)</script>'
            };
            return window.renderPopup(p, cfg);
        });

        // Assert properties sanitized
        expect(popupHtml).not.toContain('<img');
        expect(popupHtml).not.toContain('<script>');
        expect(popupHtml).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(popupHtml).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');

        // Assert config values sanitized
        expect(popupHtml).toContain('&lt;script&gt;alert(&quot;group&quot;)&lt;/script&gt;');
        expect(popupHtml).toContain('&lt;img src=x onerror=a()&gt;');
        expect(popupHtml).toContain('&lt;svg onload=b()&gt;');
    });

    test('uses fallback string for missing names', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: '📍', field: 'feld' }]
            };
            const p = { feld: 'Wert' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('<div class="popup-title">Unbekannt</div>');
    });

    test('evaluates function expressions in popup fields', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#000000',
                groupLabel: 'Test',
                popupFields: [{
                    label: 'Expr',
                    expr: (p) => p.val1 + p.val2
                }]
            };
            const p = { val1: 'A', val2: 'B' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('Expr: AB');
    });

    test('ignores missing values for popup fields', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#000000',
                groupLabel: 'Test',
                popupFields: [
                    { label: 'Feld1', field: 'feld1' },
                    { label: 'Feld2', field: 'feld2' }
                ]
            };
            const p = { feld1: 'Wert1' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('Feld1');
        expect(popupHtml).not.toContain('Feld2');
    });

    test('renders pegel stats and drought trends correctly', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'pegel',
                color: '#000000',
                groupLabel: 'Pegel',
                pegelStats: true
            };
            const p = {
                name: 'Pegel Test',
                mq_m3s: '1.5',
                nq_m3s: '0.1',
                mnq_m3s: '0.5',
                hq_m3s: '10.0'
            };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('📊 NQ');
        expect(popupHtml).toContain('1.5');
        expect(popupHtml).toContain('0.1');
        expect(popupHtml).toContain('10.0');
        expect(popupHtml).toContain('Kritisch (Dürre-Trend)');
        expect(popupHtml).toContain('#ef4444');
    });

    test('renders energy efficiency correctly based on ausbaugroesse_ew and id', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'klaeranlagen',
                color: '#000000',
                groupLabel: 'Kläranlage'
            };
            const p = {
                name: 'Kläranlage Test',
                anlagen_nr: '10',
                ausbaugroesse_ew: 200000
            };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('⚡ Energieeffizienz');
        expect(popupHtml).toContain('Klasse B');
        expect(popupHtml).toContain('#4ade80'); // green
    });

    test('incorporates getZustaendigkeitHtml if defined globally', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            window.getZustaendigkeitHtml = () => '<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>';
            const cfg = { id: 'test', color: '#000', groupLabel: 'Test' };
            const p = { name: 'Test' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('<div class="zustaendigkeit-mock">Mocked Zustaendigkeit</div>');
    });

    test('renders custom footer template', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#000',
                groupLabel: 'Test',
                footerTemplate: (p) => `Custom Footer for ${p.name}`
            };
            const p = { name: 'Test' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('Custom Footer for Test');
    });

    test('renders glossar icons and suffixes', async ({ page }) => {
        const popupHtml = await page.evaluate(() => {
            const cfg = {
                id: 'test',
                color: '#ff0000',
                groupLabel: 'Test Group',
                popupFields: [{ label: 'Wert', field: 'feld', glossar: 'TEST_GLOSSAR', suffix: ' kg' }]
            };
            const p = { feld: '100' };
            return window.renderPopup(p, cfg);
        });

        expect(popupHtml).toContain('<span class="glossar-icon" data-glossar="TEST_GLOSSAR">i</span>');
        expect(popupHtml).toContain('Wert');
        expect(popupHtml).toContain(': 100 kg');
    });
});
