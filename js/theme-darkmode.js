/**
 * js/theme-darkmode.js
 * AquaRevier High-Contrast Dark Mode & Night-Vision Theme Switcher
 * Swaps basemap tiles to Carto DarkMatter and adjusts UI CSS variables for control centers & night field work.
 */

(function() {
    window.isDarkMode = false;
    window.lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    window.darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    /**
     * Toggles between Dark Mode and Light Mode consistently across UI and Leaflet basemaps.
     */
    window.toggleDarkMode = function() {
        window.isDarkMode = !window.isDarkMode;
        const body = document.body;

        if (window.isDarkMode) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            window.StorageModule.setItem('theme', 'dark');
            window.StorageModule.setItem('aquarevier_theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            window.StorageModule.setItem('theme', 'light');
            window.StorageModule.setItem('aquarevier_theme', 'light');
        }

        // Update all theme toggle buttons on the page
        const btnToggleTheme = document.getElementById('btn-toggle-theme');
        if (btnToggleTheme) btnToggleTheme.innerText = window.isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.innerText = window.isDarkMode ? '☀️' : '🌙';

        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) themeToggleBtn.innerText = window.isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';

        // Swap Leaflet basemaps if available
        const targetMap = window.map || (typeof map !== 'undefined' ? map : null);
        if (targetMap) {
            if (window.baseDark && window.baseLight) {
                if (window.isDarkMode) {
                    if (targetMap.hasLayer(window.baseLight)) targetMap.removeLayer(window.baseLight);
                    window.baseDark.addTo(targetMap);
                } else {
                    if (targetMap.hasLayer(window.baseDark)) targetMap.removeLayer(window.baseDark);
                    window.baseLight.addTo(targetMap);
                }
            } else {
                targetMap.eachLayer(layer => {
                    if (layer instanceof L.TileLayer && layer._url && (layer._url.includes('cartocdn.com') || layer._url.includes('openstreetmap.org'))) {
                        layer.setUrl(window.isDarkMode ? window.darkTileUrl : window.lightTileUrl);
                    }
                });
            }
        }
    };

    // Restore user theme preference on load
    function initTheme() {
        const savedTheme = window.StorageModule.getItem('theme') || window.StorageModule.getItem('aquarevier_theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (shouldBeDark) {
            window.isDarkMode = false; // set false so toggleDarkMode flips to true
            window.toggleDarkMode();
        } else {
            window.isDarkMode = true; // set true so toggleDarkMode flips to false
            window.toggleDarkMode();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initTheme, 100));
    } else {
        setTimeout(initTheme, 100);
    }
})();

// CONTRAST AUDIT:
// The WCAG AA standard requires a contrast ratio of at least 4.5:1 for normal text.
// The dark mode primary background (--bg-surface) resolves to roughly #111827.
// The dimmed text color (--text-secondary) is set to #9ca3af in the style block.
// Luminance of #111827: ~0.00918
// Luminance of #9ca3af: ~0.3635
// Contrast Ratio = (0.3635 + 0.05) / (0.00918 + 0.05) = 6.98:1.
// 6.98:1 > 4.5:1, therefore the contrast mathematically meets and exceeds WCAG AA standards.
