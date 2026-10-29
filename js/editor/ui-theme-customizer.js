/**
 * UI Theme Customizer for internal.html
 * Handles the configuration of Sidebar UI colors (Light / Dark Mode).
 */

function renderThemeCustomizer() {
    const container = document.getElementById('theme-customizer-container');
    if (!container) return;

    // Define the color variables we want to expose
    const themeVars = [
        { key: 'bgBase', label: 'Hintergrund', type: 'color' },
        { key: 'bgSurface', label: 'Panel-Hintergrund', type: 'text' }, // RGBA support via text
        { key: 'borderColor', label: 'Rahmenfarbe', type: 'text' }, // RGBA support via text
        { key: 'textPrimary', label: 'Schriftfarbe', type: 'color' },
        { key: 'accentPrimary', label: 'Akzentfarbe', type: 'color' }
    ];

    // Check if the inputs already exist so we just update values instead of overwriting innerHTML
    // which avoids losing focus if called while a user is typing.
    const hasInputs = !!document.getElementById('cfg-theme-bgBase');

    if (!hasInputs) {
        let html = '';
        themeVars.forEach(v => {
            const val = (window.styleSettings && window.styleSettings.theme && window.styleSettings.theme[v.key]) ? window.styleSettings.theme[v.key] : '';
            html += `
                <div class="form-row" style="margin-bottom: 6px; display: flex; justify-content: space-between; gap: 4px; font-size:10px; align-items:center;">
                    <span>${v.label}</span>
                    <input type="${v.type}" id="cfg-theme-${v.key}" value="${val}" onchange="updateTheme('${v.key}', this.value)" style="width: ${v.type === 'color' ? '30px' : '80px'}; height: 20px; font-size: 10px;">
                </div>
            `;
        });
        container.innerHTML = html;
    } else {
        themeVars.forEach(v => {
            const el = document.getElementById(`cfg-theme-${v.key}`);
            if (el) {
                const val = (window.styleSettings && window.styleSettings.theme && window.styleSettings.theme[v.key]) ? window.styleSettings.theme[v.key] : '';
                if (el.value !== val) {
                    el.value = val;
                }
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to ensure styleSettings is loaded from local storage or defaults
    setTimeout(renderThemeCustomizer, 100);
});

// Expose render method to be called from applyStyleSettingsToUI in internal.html if needed
window.renderThemeCustomizer = renderThemeCustomizer;
