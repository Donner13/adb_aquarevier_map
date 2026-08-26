const { test, expect } = require('@playwright/test');

test.describe('CAT-13 Theme Audit Output Tests', () => {
    test('should ensure proposals/cat13_theme_audit.json is generated', async ({ page }) => {
        const fs = require('fs');
        const path = require('path');
        const proposalPath = path.join(__dirname, '../../proposals/cat13_theme_audit.json');

        expect(fs.existsSync(proposalPath)).toBeTruthy();

        const data = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
        expect(data).toHaveProperty('audit');
        expect(data.audit).toHaveProperty('theme_switching');
        expect(data.audit).toHaveProperty('carto_tile_replacement');
        expect(data.audit).toHaveProperty('leaflet_overlay_text_contrast');
        expect(data.audit).toHaveProperty('button_states');
        expect(data).toHaveProperty('recommendations');
    });
});
