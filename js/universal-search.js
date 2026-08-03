/**
 * js/universal-search.js
 * AquaRevier Universal Auto-Suggest & Fuzzy Search Engine
 * Searches across all loaded GeoJSON datasets, municipalities, monitoring stations, gauges, and actors.
 */

(function() {
    window.universalSearchIndex = [];

    /**
     * Builds/refreshes the combined search index.
     */
    window.buildUniversalSearchIndex = function() {
        const index = [];

        // 1. Gemeinden
        if (typeof window.getAvailableGemeinden === 'function') {
            const gemeinden = window.getAvailableGemeinden();
            gemeinden.forEach(g => {
                index.push({
                    title: g.name,
                    subtitle: `Gemeinde in ${g.kreis}`,
                    category: '🏛️ Gemeinde',
                    type: 'gemeinde',
                    lat: g.centerLat,
                    lng: g.centerLng,
                    name: g.name
                });
            });
        }

        // 2. Akteure
        if (window.geojsonData && Array.isArray(window.geojsonData.features)) {
            window.geojsonData.features.forEach(f => {
                if (!f.properties || !f.geometry) return;
                const p = f.properties;
                const coords = f.geometry.coordinates;
                index.push({
                    title: p.name || 'Akteur',
                    subtitle: `${p.group || 'Partner'} • ${p.stadt || p.ort || ''}`,
                    category: '🤝 Akteur',
                    type: 'feature',
                    lat: coords[1],
                    lng: coords[0],
                    feature: f
                });
            });
        }

        // 3. Layer Data Store (Messstellen, Pegel, Kläranlagen, Einleiter)
        const catMap = {
            'grundwassermessstellen': '💧 Messstelle',
            'pegel': '📏 Pegel',
            'klaeranlagen': '🚰 Kläranlage',
            'elwas_einleiter': '🏭 Einleiter',
            'stauanlagen': '⛰️ Stauanlage',
            'regenbecken': '🌧️ Regenbecken',
            'querbauwerke': '🚧 Querbauwerk'
        };

        if (window.layerDataStore) {
            Object.keys(catMap).forEach(key => {
                const geojson = window.layerDataStore[key];
                if (geojson && Array.isArray(geojson.features)) {
                    geojson.features.forEach(f => {
                        if (!f.properties || !f.geometry || f.geometry.type !== 'Point') return;
                        const p = f.properties;
                        const coords = f.geometry.coordinates;
                        const title = p.name || p.bezeichnung || p.betreiber || p.messstellen_nr || key;
                        index.push({
                            title: title,
                            subtitle: `${p.gewaesser || p.gemeinde || p.kreis || ''}`,
                            category: catMap[key],
                            type: 'feature',
                            lat: coords[1],
                            lng: coords[0],
                            feature: f
                        });
                    });
                }
            });
        }

        window.universalSearchIndex = index;
    };

    // Basic Levenshtein distance for true fuzzy matching
    function levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    /**
     * Performs fuzzy search against index.
     */
    window.queryUniversalSearch = function(query) {
        if (!query || query.trim().length < 2) return [];
        const q = query.toLowerCase().trim();

        if (window.universalSearchIndex.length === 0) {
            window.buildUniversalSearchIndex();
        }

        const results = window.universalSearchIndex.filter(item => {
            const t = item.title.toLowerCase();
            const s = item.subtitle.toLowerCase();
            const c = item.category.toLowerCase();

            // Direct substring match
            if (t.includes(q) || s.includes(q) || c.includes(q)) return true;

            // Simple fuzzy match (allow 1 typo for queries > 4 chars, 2 typos for > 7 chars)
            const allowedTypos = q.length > 7 ? 2 : (q.length > 4 ? 1 : 0);
            if (allowedTypos > 0) {
                const words = [...t.split(/\s+/), ...s.split(/\s+/)];
                for (const word of words) {
                    if (Math.abs(word.length - q.length) <= allowedTypos) {
                        if (levenshteinDistance(word, q) <= allowedTypos) return true;
                    }
                }
            }
            return false;
        });

        return results.slice(0, 15); // Top 15 matches
    };

    /**
     * Renders search results dropdown in input container.
     */
    window.renderSearchDropdown = function(inputElem, results) {
        let dropdown = document.getElementById('universal-search-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'universal-search-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                z-index: 10009;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                max-height: 280px;
                overflow-y: auto;
                margin-top: 4px;
                display: none;
            `;
            if (inputElem.parentNode) {
                inputElem.parentNode.style.position = 'relative';
                inputElem.parentNode.appendChild(dropdown);

                let liveRegion = document.getElementById('universal-search-live-region');
                if (!liveRegion) {
                    liveRegion = document.createElement('div');
                    liveRegion.id = 'universal-search-live-region';
                    liveRegion.className = 'sr-only';
                    liveRegion.setAttribute('aria-live', 'polite');
                    liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;';
                    inputElem.parentNode.appendChild(liveRegion);
                }
            }
        }

        if (!results || results.length === 0) {
            dropdown.style.display = 'none';
            const liveRegion = document.getElementById('universal-search-live-region');
            if (liveRegion) liveRegion.textContent = inputElem.value.trim().length >= 2 ? "Keine Treffer gefunden" : "";
            return;
        }

        const liveRegion = document.getElementById('universal-search-live-region');
        if (liveRegion) {
            liveRegion.textContent = results.length + " Ergebnisse gefunden";
        }
        let html = '';
        results.forEach((item, idx) => {
            html += `
                <div class="search-result-item" data-idx="${idx}" style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <div>
                        <div style="font-weight: 600; font-size: 11.5px; color: #0f172a;">${escapeHtml(item.title)}</div>
                        <div style="font-size: 10px; color: #64748b;">${escapeHtml(item.subtitle)}</div>
                    </div>
                    <span class="badge bg-light text-dark" style="font-size: 9.5px; border: 1px solid #cbd5e1;">${item.category}</span>
                </div>
            `;
        });

        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        // Add click listeners to items
        dropdown.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-idx'), 10);
                const target = results[idx];
                if (target) {
                    window.selectSearchResult(target);
                    dropdown.style.display = 'none';
                }
            });
        });
    };

    /**
     * Handles selection of a search result.
     */
    window.selectSearchResult = function(item) {
        if (!item) return;

        if (item.type === 'gemeinde' && typeof window.openGemeindeDossier === 'function') {
            window.openGemeindeDossier(item.name);
        } else if (item.lat && item.lng && typeof map !== 'undefined') {
            map.setView([item.lat, item.lng], 15, { animate: true });
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Attach search event listener to existing search inputs
    function initSearchInputs() {
        window.buildUniversalSearchIndex();
        const searchInputs = document.querySelectorAll('#usearch-input, .universal-search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const q = e.target.value;
                const results = window.queryUniversalSearch(q);
                window.renderSearchDropdown(input, results);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initSearchInputs, 800));
    } else {
        setTimeout(initSearchInputs, 800);
    }
})();
