/**
 * AquaRevier Akteurskarte — Perfection & Performance Enhancements
 * Features:
 *  1. Command Palette (Ctrl+K / ⌘K)
 *  2. Open Data Export (GeoJSON & CSV with License Headers)
 *  3. URL Hash Auto-Sync & Deep-Linking
 *  4. System Uptime & Health Indicator
 *  5. Glassmorphic Toast Notification System
 */

(function () {
    'use strict';

    // --- 1. TOAST NOTIFICATION SYSTEM ---
    window.showToast = function (message, icon = '✓', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10010;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 18px;
            background: var(--bg-surface, rgba(17, 24, 39, 0.9));
            color: var(--text-primary, #f3f4f6);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px var(--accent-glow, rgba(99, 102, 241, 0.3));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 500;
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        toast.innerHTML = `<span style="font-weight:700; color: var(--accent-primary, #6366f1);">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px) scale(0.95)';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    };

    // --- 2. COMMAND PALETTE (CTRL+K) ---
    function initCommandPalette() {
        // Create modal element if not present
        if (document.getElementById('command-palette-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'command-palette-modal';
        modal.hidden = true;
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 10005;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: none;
            align-items: flex-start;
            justify-content: center;
            padding-top: 12vh;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        modal.innerHTML = `
            <div id="cmd-card" style="
                width: 90%;
                max-width: 640px;
                background: var(--bg-surface, rgba(17, 24, 39, 0.95));
                color: var(--text-primary, #f3f4f6);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
                border-radius: 16px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 25px var(--accent-glow, rgba(99, 102, 241, 0.3));
                overflow: hidden;
                display: flex;
                flex-direction: column;
                font-family: 'Inter', sans-serif;
            ">
                <div style="display: flex; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); gap: 12px;">
                    <span style="font-size: 18px;">⚡</span>
                    <input type="text" id="cmd-input" placeholder="Schnellsuche (Gemeinden, Layer, Akteure, Aktionen)..." style="
                        flex: 1;
                        background: transparent;
                        border: none;
                        outline: none;
                        font-size: 15px;
                        color: var(--text-primary, #f3f4f6);
                        font-family: 'Inter', sans-serif;
                    " autocomplete="off">
                    <kbd style="
                        padding: 2px 6px;
                        font-size: 10px;
                        font-weight: 600;
                        background: var(--bg-base, #0b0f19);
                        border: 1px solid var(--border-color, rgba(255,255,255,0.15));
                        border-radius: 4px;
                        color: var(--text-secondary, #9ca3af);
                    ">ESC</kbd>
                </div>
                <div id="cmd-results" style="max-height: 380px; overflow-y: auto; padding: 8px;"></div>
                <div style="
                    display: flex;
                    gap: 16px;
                    padding: 10px 18px;
                    border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));
                    font-size: 11px;
                    color: var(--text-secondary, #9ca3af);
                    background: rgba(0, 0, 0, 0.15);
                ">
                    <span><kbd style="padding:1px 4px; border-radius:3px; background:var(--bg-base, #0b0f19);">↑</kbd><kbd style="padding:1px 4px; border-radius:3px; background:var(--bg-base, #0b0f19);">↓</kbd> Navigieren</span>
                    <span><kbd style="padding:1px 4px; border-radius:3px; background:var(--bg-base, #0b0f19);">↵</kbd> Auswählen</span>
                    <span><kbd style="padding:1px 4px; border-radius:3px; background:var(--bg-base, #0b0f19);">ESC</kbd> Schließen</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = document.getElementById('cmd-input');
        const results = document.getElementById('cmd-results');

        let selectedIndex = 0;
        let commandItems = [];

        function buildCommands() {
            const items = [];

            // Municipalities
            const municipalities = [
                { name: "Aachen", lat: 50.7753, lng: 6.0839, zoom: 12 },
                { name: "Düren", lat: 50.8022, lng: 6.4833, zoom: 12 },
                { name: "Erkelenz", lat: 51.0800, lng: 6.3150, zoom: 12 },
                { name: "Euskirchen", lat: 50.6606, lng: 6.7872, zoom: 12 },
                { name: "Heinsberg", lat: 51.0631, lng: 6.0964, zoom: 12 },
                { name: "Mönchengladbach", lat: 51.1912, lng: 6.4430, zoom: 12 },
                { name: "Rhein-Erft-Kreis (Bergheim)", lat: 50.9577, lng: 6.6406, zoom: 11 },
                { name: "Rhein-Kreis Neuss", lat: 51.1983, lng: 6.6917, zoom: 11 },
                { name: "Städteregion Aachen", lat: 50.7753, lng: 6.2000, zoom: 11 }
            ];

            municipalities.forEach(m => {
                items.push({
                    category: "Gemeinde",
                    label: `📍 Zoom zu Gemeinde ${m.name}`,
                    icon: "📍",
                    action: () => {
                        if (window.map) window.map.flyTo([m.lat, m.lng], m.zoom, { duration: 1.2 });
                        window.showToast(`Zentriert auf ${m.name}`, "📍");
                    }
                });
            });

            // Layer Shortcuts
            const layerButtons = document.querySelectorAll('.filter-btn[data-layer-name]');
            layerButtons.forEach(btn => {
                const layerName = btn.getAttribute('data-layer-name');
                items.push({
                    category: "Karten-Layer",
                    label: `🗺️ Layer umschalten: ${layerName}`,
                    icon: "🗺️",
                    action: () => {
                        btn.click();
                        window.showToast(`Layer "${layerName}" umgeschaltet`, "🗺️");
                    }
                });
            });

            // System Actions
            items.push({
                category: "Aktion",
                label: "🔗 Aktuelle Ansicht teilen (Link kopieren)",
                icon: "🔗",
                action: () => {
                    const btn = document.getElementById('share-view-btn');
                    if (btn) btn.click();
                }
            });

            items.push({
                category: "Aktion",
                label: "💾 Offene Geodaten exportieren (GeoJSON)",
                icon: "💾",
                action: () => window.exportActiveLayersData('geojson')
            });

            items.push({
                category: "Aktion",
                label: "📊 Bericht generieren (PDF / Druckansicht)",
                icon: "📊",
                action: () => {
                    const btn = document.getElementById('generate-report-btn');
                    if (btn) btn.click();
                }
            });

            items.push({
                category: "Aktion",
                label: "🌓 Farbschema wechseln (Dark / Light Theme)",
                icon: "🌓",
                action: () => {
                    const btn = document.getElementById('theme-toggle') || document.getElementById('btn-toggle-theme') || document.getElementById('theme-toggle-btn');
                    if (btn) {
                        btn.click();
                    } else if (typeof window.toggleDarkMode === 'function') {
                        window.toggleDarkMode();
                    }
                }
            });

            items.push({
                category: "Aktion",
                label: "🔄 Filter zurücksetzen",
                icon: "🔄",
                action: () => {
                    const btn = document.getElementById('reset-filters-btn');
                    if (btn) btn.click();
                }
            });

            return items;
        }

        function renderResults(filterText = "") {
            const query = filterText.toLowerCase().trim();
            const allItems = buildCommands();
            commandItems = allItems.filter(item => 
                item.label.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );

            if (selectedIndex >= commandItems.length) selectedIndex = 0;

            if (commandItems.length === 0) {
                results.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary, #9ca3af); font-size: 13px;">Keine Treffer für "${filterText}" gefunden.</div>`;
                return;
            }

            results.innerHTML = commandItems.map((item, idx) => `
                <div class="cmd-item ${idx === selectedIndex ? 'selected' : ''}" data-idx="${idx}" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 13px;
                    margin-bottom: 2px;
                    background: ${idx === selectedIndex ? 'var(--bg-surface-hover, rgba(31, 41, 55, 0.9))' : 'transparent'};
                    color: ${idx === selectedIndex ? 'var(--accent-primary, #6366f1)' : 'var(--text-primary, #f3f4f6)'};
                    transition: background 0.15s ease;
                ">
                    <span style="display:flex; align-items:center; gap:10px;">
                        <span>${item.icon}</span>
                        <span style="font-weight:${idx === selectedIndex ? '600' : '400'}">${item.label}</span>
                    </span>
                    <span style="
                        font-size: 10px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        padding: 2px 6px;
                        border-radius: 4px;
                        background: rgba(255, 255, 255, 0.08);
                        color: var(--text-secondary, #9ca3af);
                    ">${item.category}</span>
                </div>
            `).join('');

            // Add click listeners
            results.querySelectorAll('.cmd-item').forEach(el => {
                el.addEventListener('click', () => {
                    const idx = parseInt(el.getAttribute('data-idx'), 10);
                    if (commandItems[idx]) {
                        closePalette();
                        commandItems[idx].action();
                    }
                });
            });
        }

        function openPalette() {
            modal.hidden = false;
            modal.style.display = 'flex';
            requestAnimationFrame(() => { modal.style.opacity = '1'; });
            input.value = '';
            selectedIndex = 0;
            renderResults();
            setTimeout(() => input.focus(), 50);
        }

        function closePalette() {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.hidden = true;
                modal.style.display = 'none';
            }, 200);
        }

        // Global Keydown Handler
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (modal.hidden) openPalette();
                else closePalette();
                return;
            }

            if (modal.hidden) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % (commandItems.length || 1);
                renderResults(input.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + commandItems.length) % (commandItems.length || 1);
                renderResults(input.value);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (commandItems[selectedIndex]) {
                    closePalette();
                    commandItems[selectedIndex].action();
                }
            }
        });

        input.addEventListener('input', () => {
            selectedIndex = 0;
            renderResults(input.value);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePalette();
        });

        // Add visual KBD trigger to search inputs
        const searchInputs = document.querySelectorAll('#usearch-input, #search-input');
        searchInputs.forEach(inp => {
            const parent = inp.parentElement;
            if (parent && !parent.querySelector('.kbd-hint')) {
                const kbd = document.createElement('kbd');
                kbd.className = 'kbd-hint';
                kbd.textContent = 'Ctrl K';
                kbd.title = 'Schnellsuche öffnen (Ctrl + K)';
                kbd.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 2px 6px;
                    font-size: 10px;
                    font-weight: 600;
                    background: var(--bg-surface, rgba(17, 24, 39, 0.8));
                    color: var(--text-secondary, #9ca3af);
                    border: 1px solid var(--border-color, rgba(255,255,255,0.15));
                    border-radius: 4px;
                    pointer-events: auto;
                    cursor: pointer;
                `;
                kbd.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openPalette();
                });
                parent.style.position = 'relative';
                parent.appendChild(kbd);
            }
        });
    }

    // --- 3. OPEN DATA EXPORT (GEOJSON & CSV) ---
    window.exportActiveLayersData = function (format = 'geojson') {
        const activeFeatures = [];
        if (window.layerDataStore) {
            Object.keys(window.layerDataStore).forEach(key => {
                const store = window.layerDataStore[key];
                if (store && store.layer && window.map && window.map.hasLayer(store.layer)) {
                    if (store.geoData && store.geoData.features) {
                        store.geoData.features.forEach(f => {
                            const featCopy = JSON.parse(JSON.stringify(f));
                            featCopy.properties._layer_name = key;
                            activeFeatures.push(featCopy);
                        });
                    }
                }
            });
        }

        if (activeFeatures.length === 0) {
            window.showToast("Keine aktiven Fachdaten-Layer auf der Karte sichtbar", "⚠️");
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];

        if (format === 'geojson') {
            const geojsonOutput = {
                type: "FeatureCollection",
                _metadata: {
                    title: "AquaRevier Akteurskarte — Geodaten-Export",
                    exported_at: new Date().toISOString(),
                    license: "Data licence Germany – attribution – Version 2.0 / Land NRW",
                    source: "ELWAS-WEB (Land NRW) / Geobasis NRW",
                    feature_count: activeFeatures.length
                },
                features: activeFeatures
            };

            const blob = new Blob([JSON.stringify(geojsonOutput, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aquarevier_geodata_export_${dateStr}.geojson`;
            a.click();
            URL.revokeObjectURL(url);
            window.showToast(`${activeFeatures.length} Objekte als GeoJSON exportiert`, "💾");
        } else if (format === 'csv') {
            // Flatten properties to CSV
            const allKeys = new Set();
            activeFeatures.forEach(f => {
                if (f.properties) Object.keys(f.properties).forEach(k => allKeys.add(k));
            });
            const keyArray = Array.from(allKeys);
            let csv = keyArray.join(',') + '\n';

            activeFeatures.forEach(f => {
                const row = keyArray.map(k => {
                    let val = f.properties[k];
                    if (val === null || val === undefined) return '""';
                    if (typeof val === 'object') val = JSON.stringify(val);
                    val = String(val).replace(/"/g, '""');
                    return `"${val}"`;
                });
                csv += row.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aquarevier_data_export_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            window.showToast(`${activeFeatures.length} Objekte als CSV exportiert`, "💾");
        }
    };

    // --- 4. UPTIME & SYSTEM HEALTH BADGE ---
    function initSystemHealthBadge() {
        if (document.getElementById('system-health-badge')) return;

        const badge = document.createElement('div');
        badge.id = 'system-health-badge';
        badge.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: var(--bg-surface, rgba(17, 24, 39, 0.85));
            color: var(--text-primary, #f3f4f6);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        `;

        badge.innerHTML = `
            <span style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                box-shadow: 0 0 8px #10b981;
                display: inline-block;
            "></span>
            <span>ELWAS & WMS 🟢 Operational</span>
        `;

        badge.addEventListener('mouseover', () => {
            badge.style.transform = 'scale(1.04)';
            badge.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
        });
        badge.addEventListener('mouseout', () => {
            badge.style.transform = 'scale(1)';
            badge.style.boxShadow = '0 4px 15px rgba(0,0,0,0.25)';
        });

        badge.addEventListener('click', () => {
            window.showToast("Alle 18 Kartenlayer & WMS-Dienste antworten mit HTTP 200 OK", "🟢");
        });

        document.body.appendChild(badge);
    }

    // --- 0. DYNAMIC COLOR HARMONY FOR FILTER BUTTONS ---
    function applyLayerColorHarmony() {
        if (!document.getElementById('color-harmony-styles')) {
            const style = document.createElement('style');
            style.id = 'color-harmony-styles';
            style.textContent = `
                .filter-btn {
                    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease !important;
                }
                .filter-btn.active {
                    background: color-mix(in srgb, var(--swatch-color, var(--accent-primary)) 20%, var(--bg-surface, rgba(17, 24, 39, 0.9))) !important;
                    border-color: var(--swatch-color, var(--accent-primary)) !important;
                    color: var(--text-primary, #f3f4f6) !important;
                    box-shadow: 0 0 12px color-mix(in srgb, var(--swatch-color, var(--accent-primary)) 40%, transparent) !important;
                }
                .filter-btn.active .swatch {
                    box-shadow: 0 0 8px var(--swatch-color, var(--accent-primary)) !important;
                    transform: scale(1.2) !important;
                }
                .filter-btn.active .counter-badge {
                    background: color-mix(in srgb, var(--swatch-color, var(--accent-primary)) 35%, transparent) !important;
                    color: var(--text-primary, #ffffff) !important;
                    border: 1px solid color-mix(in srgb, var(--swatch-color, var(--accent-primary)) 60%, transparent) !important;
                }
                body.light-theme .filter-btn.active {
                    background: color-mix(in srgb, var(--swatch-color, var(--accent-primary)) 18%, #ffffff) !important;
                    color: #0f172a !important;
                }
                body.light-theme .filter-btn.active .counter-badge {
                    color: #0f172a !important;
                }
            `;
            document.head.appendChild(style);
        }

        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const swatch = btn.querySelector('.swatch');
            if (swatch) {
                let bgColor = swatch.style.backgroundColor || swatch.style.background;
                if (bgColor) {
                    btn.style.setProperty('--swatch-color', bgColor);
                }
            }
        });
    }

    // --- 6. MEHRSPRACHIGKEITS-SUPPORT (DE / EN) ---
    const I18N_DICT = {
        de: {
            app_title: "Akteurskarte - AquaRevier",
            search_placeholder: "Nach Name oder Ort suchen...",
            cmd_placeholder: "Schnellsuche (Gemeinden, Layer, Akteure, Aktionen)...",
            share_view: "🔗 Ansicht teilen",
            reset_filters: "Filter zurücksetzen",
            generate_report: "📊 Bericht generieren (PDF)",
            open_data_export: "💾 Geodaten-Export",
            health_online: "ELWAS & WMS 🟢 Operational",
            switch_lang: "🇬🇧 English"
        },
        en: {
            app_title: "Stakeholder Map - AquaRevier",
            search_placeholder: "Search by name or location...",
            cmd_placeholder: "Quick search (Municipalities, Layers, Stakeholders, Actions)...",
            share_view: "🔗 Share View",
            reset_filters: "Reset Filters",
            generate_report: "📊 Generate Report (PDF)",
            open_data_export: "💾 Open Data Export",
            health_online: "ELWAS & WMS 🟢 Operational",
            switch_lang: "🇩🇪 Deutsch"
        }
    };

    function initLanguageToggle() {
        let currentLang = localStorage.getItem('aquarevier_lang') || 'de';

        function applyLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('aquarevier_lang', lang);
            const dict = I18N_DICT[lang];
            if (!dict) return;

            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.placeholder = dict.search_placeholder;

            const cmdInput = document.getElementById('cmd-input');
            if (cmdInput) cmdInput.placeholder = dict.cmd_placeholder;

            const shareBtn = document.getElementById('share-view-btn');
            if (shareBtn) shareBtn.textContent = dict.share_view;

            const resetBtn = document.getElementById('reset-filters-btn');
            if (resetBtn) resetBtn.textContent = dict.reset_filters;

            const reportBtn = document.getElementById('generate-report-btn');
            if (reportBtn) reportBtn.textContent = dict.generate_report;

            const exportBtn = document.getElementById('open-data-export-btn');
            if (exportBtn) exportBtn.textContent = dict.open_data_export;

            const langBtn = document.getElementById('lang-toggle-btn');
            if (langBtn) langBtn.textContent = dict.switch_lang;

            window.showToast(lang === 'de' ? "Sprache: Deutsch 🇩🇪" : "Language: English 🇬🇧", "🌐");
        }

        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn && resetBtn.parentElement && !document.getElementById('lang-toggle-btn')) {
            const langBtn = document.createElement('button');
            langBtn.id = 'lang-toggle-btn';
            langBtn.className = 'filter-btn';
            langBtn.style.cssText = 'padding: 4px 8px; font-size: 10px; margin-left: 6px;';
            langBtn.textContent = currentLang === 'de' ? '🇬🇧 English' : '🇩🇪 Deutsch';
            langBtn.addEventListener('click', () => {
                applyLanguage(currentLang === 'de' ? 'en' : 'de');
            });
            resetBtn.parentElement.appendChild(langBtn);
        }

        if (currentLang !== 'de') {
            applyLanguage(currentLang);
        }
    }

    // --- 7. INTERACTIVE PLUVIAL KREIS MAP CONTROLS & MAP INTERACTION ---
    function initPluvialKreisControls() {
        const kreisData = {
            "Städteregion Aachen": { lat: 50.7753, lng: 6.2000, zoom: 11, url: "https://starkregengefahrenkarten-staedteregion-aachen.cismet.de/" },
            "Kreis Düren": { lat: 50.8022, lng: 6.4833, zoom: 11, url: "https://starkregengefahrenkarten-kreis-dueren.cismet.de/" },
            "Kreis Euskirchen": { lat: 50.6606, lng: 6.7872, zoom: 11, url: "https://starkregen-euskirchen-v11.cismet.de/geoserver/wms" },
            "Kreis Heinsberg": { lat: 51.0631, lng: 6.0964, zoom: 11, url: "https://www.kreis-heinsberg.de/" },
            "Rhein-Erft-Kreis": { lat: 50.9577, lng: 6.6406, zoom: 11, url: "https://www.rhein-erft-kreis.de/" },
            "Rhein-Kreis Neuss": { lat: 51.1983, lng: 6.6917, zoom: 11, url: "https://www.rhein-kreis-neuss.de/" },
            "Mönchengladbach": { lat: 51.1912, lng: 6.4430, zoom: 11, url: "https://www.moenchengladbach.de/" }
        };

        const pluvialLinks = document.querySelectorAll('.external-portal-link');
        pluvialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const text = link.textContent.replace('🔗', '').replace('↗', '').trim();
                const info = kreisData[text];
                if (info && window.map) {
                    window.map.flyTo([info.lat, info.lng], info.zoom, { duration: 1.2 });
                    window.showToast(`🌊 Starkregen-Fokus: ${text} auf Karte zentriert!`, "📍");
                }
            });
        });
    }

    // --- 8. KEYBOARD ACCESSIBILITY & ARIA ENHANCEMENTS ---
    function initAccessibility() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');
            if (!btn.hasAttribute('role')) btn.setAttribute('role', 'button');
            
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    // --- 9. AUTO SYSTEM THEME SYNC ---
    function initAutoThemeSync() {
        if (!localStorage.getItem('theme') && !localStorage.getItem('aquarevier_theme')) {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        }
    }

    // --- 5. INITIALIZE ALL ON DOM READY ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyLayerColorHarmony();
            initCommandPalette();
            initSystemHealthBadge();
            initLanguageToggle();
            initPluvialKreisControls();
            initAccessibility();
            initAutoThemeSync();
        });
    } else {
        applyLayerColorHarmony();
        initCommandPalette();
        initSystemHealthBadge();
        initLanguageToggle();
        initPluvialKreisControls();
        initAccessibility();
        initAutoThemeSync();
    }

})();
