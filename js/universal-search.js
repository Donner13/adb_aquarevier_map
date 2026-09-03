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
        const seenKeys = new Set();

        function addToIndex(item) {
            // Deduplication logic [AQ-129]
            const key = `${item.type}:${item.id || item.title}:${item.lat}:${item.lng}`;
            if (seenKeys.has(key)) return;
            seenKeys.add(key);
            index.push(item);
        }

        // 1. Gemeinden
        if (typeof window.getAvailableGemeinden === 'function') {
            const gemeinden = window.getAvailableGemeinden();
            gemeinden.forEach(g => {
                addToIndex({
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

                let lat, lng, bounds;
                if (f.geometry.type === 'Point') {
                    lng = f.geometry.coordinates[0];
                    lat = f.geometry.coordinates[1];
                } else if (typeof L !== 'undefined') {
                    // For Lines/Polygons: use representative center or bounds [AQ-102]
                    // [Performance] Use light bounds calculation instead of L.geoJSON(f)
                    const b = getFeatureBounds(f);
                    if (b.isValid()) {
                        const center = b.getCenter();
                        lat = center.lat;
                        lng = center.lng;
                        bounds = b;
                    }
                }

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return; // [AQ-103]

                addToIndex({
                    title: p.name || 'Akteur',
                    subtitle: `${p.group || 'Partner'} • ${p.stadt || p.ort || ''}`,
                    category: '🤝 Akteur',
                    type: 'feature',
                    layerId: 'akteure',
                    lat: lat,
                    lng: lng,
                    bounds: bounds,
                    feature: f
                });
            });
        }

        // 3. Layer Data Store (Messstellen, Pegel, Kläranlagen, Einleiter, Gewässergüte)
        const catMap = {
            'grundwassermessstellen': '💧 Messstelle',
            'pegel': '📏 Pegel',
            'klaeranlagen': '🚰 Kläranlage',
            'elwas_einleiter': '🏭 Einleiter',
            'stauanlagen': '⛰️ Stauanlage',
            'regenbecken': '🌧️ Regenbecken',
            'querbauwerke': '🚧 Querbauwerk',
            'gewaesserguete': '💧 Gewässergüte' // Added [AQ-102]
        };

        if (window.layerDataStore) {
            Object.keys(catMap).forEach(key => {
                const geojson = window.layerDataStore[key];
                if (geojson && Array.isArray(geojson.features)) {
                    geojson.features.forEach(f => {
                        if (!f.properties || !f.geometry) return;
                        const p = f.properties;

                        let lat, lng, bounds;
                        if (f.geometry.type === 'Point') {
                            lng = f.geometry.coordinates[0];
                            lat = f.geometry.coordinates[1];
                        } else if (typeof L !== 'undefined') {
                            // [AQ-102] [Performance] light bounds
                            const b = getFeatureBounds(f);
                            if (b.isValid()) {
                                const center = b.getCenter();
                                lat = center.lat;
                                lng = center.lng;
                                bounds = b;
                            }
                        }

                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return; // [AQ-103]

                        const title = p.name || p.bezeichnung || p.betreiber || p.messstellen_nr || key;
                        addToIndex({
                            title: title,
                            subtitle: `${p.gewaesser || p.gemeinde || p.kreis || p.abschnitt || ''}`,
                            category: catMap[key],
                            type: 'feature',
                            layerId: key, // [AQ-102] Store layer ID for popup generation
                            lat: lat,
                            lng: lng,
                            bounds: bounds,
                            feature: f
                        });
                    });
                }
            });
        }

        window.universalSearchIndex = index;
    };

    /**
     * Light-weight bounds calculation for GeoJSON features without creating Leaflet layers.
     */
    function getFeatureBounds(f) {
        const bounds = L.latLngBounds([]);
        if (!f.geometry || !f.geometry.coordinates) return bounds;

        function process(coords) {
            if (typeof coords[0] === 'number') {
                bounds.extend([coords[1], coords[0]]);
            } else if (Array.isArray(coords)) {
                coords.forEach(process);
            }
        }
        process(f.geometry.coordinates);
        return bounds;
    }

    /**
     * Performs fuzzy search against index with weighted ranking [AQ-101, AQ-128].
     */
    window.queryUniversalSearch = function(query) {
        if (!query || query.trim().length < 2) return [];
        const q = query.toLowerCase().trim();

        if (window.universalSearchIndex.length === 0) {
            window.buildUniversalSearchIndex();
        }

        const scoredResults = window.universalSearchIndex.map(item => {
            const title = item.title.toLowerCase();
            const subtitle = item.subtitle.toLowerCase();
            let score = 0;

            if (title === q) score += 100;
            else if (title.startsWith(q)) score += 50;
            else if (title.includes(q)) score += 20;

            if (subtitle.includes(q)) score += 10;

            // Simple fuzzy check [AQ-101]
            if (score === 0) {
                if (fuzzyMatch(q, title)) score += 5;
            }

            return { item, score };
        }).filter(res => res.score > 0);

        scoredResults.sort((a, b) => b.score - a.score);

        return scoredResults.slice(0, 15).map(res => res.item);
    };

    /**
     * Simple fuzzy matching logic.
     */
    function fuzzyMatch(query, text) {
        let i = 0, j = 0;
        while (i < query.length && j < text.length) {
            if (query[i] === text[j]) i++;
            j++;
        }
        return i === query.length;
    }

    /**
     * Renders search results dropdown with ARIA accessibility [AQ-126].
     */
    window.renderSearchDropdown = function(inputElem, results) {
        let dropdown = document.getElementById('universal-search-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'universal-search-dropdown';
            dropdown.setAttribute('role', 'listbox');
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
            }
        }

        if (!results || results.length === 0) {
            dropdown.style.display = 'none';
            inputElem.setAttribute('aria-expanded', 'false');
            return;
        }

        let html = '';
        results.forEach((item, idx) => {
            html += `
                <div class="search-result-item"
                     id="search-item-${idx}"
                     role="option"
                     data-idx="${idx}"
                     tabindex="0"
                     style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
                     onmouseover="this.style.background='#f8fafc'"
                     onmouseout="this.style.background='transparent'">
                    <div>
                        <div style="font-weight: 600; font-size: 11.5px; color: #0f172a;">${escapeHtml(item.title)}</div>
                        <div style="font-size: 10px; color: #64748b;">${escapeHtml(item.subtitle)}</div>
                    </div>
                    <span class="badge bg-light text-dark" style="font-size: 9.5px; border: 1px solid #cbd5e1;">${item.category}</span>
                </div>
            `;
        });

        dropdown.innerHTML = html;

        let liveRegion = document.getElementById("usearch-live-region");
        if (!liveRegion) {
            liveRegion = document.createElement("div");
            liveRegion.id = "usearch-live-region";
            liveRegion.setAttribute("aria-live", "polite");
            liveRegion.style.cssText = "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;";
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = results.length + " Ergebnisse gefunden.";
        dropdown.style.display = 'block';
        inputElem.setAttribute('aria-expanded', 'true');

        // Add click listeners to items
        dropdown.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-idx'), 10);
                const target = results[idx];
                if (target) {
                    window.selectSearchResult(target);
                    dropdown.style.display = 'none';
                    inputElem.setAttribute('aria-expanded', 'false');
                }
            });
        });
    };

    /**
     * Handles selection of a search result.
     * [AQ-102] Improved to handle bounds and layer activation.
     */
    window.selectSearchResult = function(item) {
        if (!item) return;

        if (item.type === 'gemeinde' && typeof window.openGemeindeDossier === 'function') {
            window.openGemeindeDossier(item.name);
            return;
        }

        if (Number.isFinite(item.lat) && Number.isFinite(item.lng) && typeof map !== 'undefined') {
            // Activate corresponding layer if it's off [UX Improvement]
            if (item.category && typeof overlayMaps !== 'undefined') {
                const layerName = Object.keys(overlayMaps).find(name => name.includes(item.category.replace(/[^a-zA-Z0-9\s]/g, '').trim()));
                if (layerName && !map.hasLayer(overlayMaps[layerName])) {
                    map.addLayer(overlayMaps[layerName]);
                }
            }

            if (item.bounds) {
                window.matchMedia("(prefers-reduced-motion: reduce)").matches ? map.fitBounds(item.bounds, { padding: [50, 50], duration: 1.5 }) : map.flyToBounds(item.bounds, { padding: [50, 50], duration: 1.5 });
            } else {
                map.setView([item.lat, item.lng], 15, { animate: true });
            }

            // Open popup if it's a feature result
            if (item.feature && item.feature.properties) {
                setTimeout(() => {
                    const popupHtml = typeof window.buildFeaturePopupHtml === 'function' ? window.buildFeaturePopupHtml(item.feature.properties, item.layerId) : null;
                    if (popupHtml) {
                        L.popup()
                            .setLatLng([item.lat, item.lng])
                            .setContent(popupHtml)
                            .openOn(map);
                    }
                }, 1600);
            }
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const debounce = (fn, delay) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    // Event-based rebuild with debounce [AQ-100, AQ-132]
    const debouncedRebuild = debounce(() => {
        window.buildUniversalSearchIndex();
    }, 250);

    window.addEventListener('aquarevier:layer-loaded', debouncedRebuild);

    // Attach search event listener with debounce [AQ-127]
    function initSearchInputs() {
        window.buildUniversalSearchIndex();
        const searchInputs = document.querySelectorAll('#usearch-input, .universal-search-input');

        const handleInput = debounce((e) => {
            const q = e.target.value;
            const results = window.queryUniversalSearch(q);
            window.renderSearchDropdown(e.target, results);
        }, 150);

        searchInputs.forEach(input => {
            input.setAttribute('role', 'combobox');
            input.setAttribute('aria-autocomplete', 'list');
            input.setAttribute('aria-haspopup', 'listbox');
            input.setAttribute('aria-expanded', 'false');
            input.setAttribute('aria-controls', 'universal-search-dropdown');

            input.addEventListener('input', handleInput);

            // Keyboard navigation [AQ-126]
            input.addEventListener('keydown', (e) => {
                const dropdown = document.getElementById('universal-search-dropdown');
                if (!dropdown || dropdown.style.display === 'none') return;

                const items = dropdown.querySelectorAll('.search-result-item');
                let currentIndex = Array.from(items).findIndex(el => el.classList.contains('focused'));

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentIndex < items.length - 1) {
                        if (currentIndex >= 0) items[currentIndex].classList.remove('focused', 'bg-light');
                        currentIndex++;
                        items[currentIndex].classList.add('focused', 'bg-light');
                        input.setAttribute('aria-activedescendant', items[currentIndex].id);
                        items[currentIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentIndex > 0) {
                        items[currentIndex].classList.remove('focused', 'bg-light');
                        currentIndex--;
                        items[currentIndex].classList.add('focused', 'bg-light');
                        input.setAttribute('aria-activedescendant', items[currentIndex].id);
                        items[currentIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'Enter') {
                    if (currentIndex >= 0) {
                        items[currentIndex].click();
                    }
                } else if (e.key === 'Escape') {
                    dropdown.style.display = 'none';
                    input.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Event-based rebuild [AQ-100, AQ-132]
    window.addEventListener('aquarevier:layer-loaded', () => {
        window.buildUniversalSearchIndex();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initSearchInputs, 500));
    } else {
        setTimeout(initSearchInputs, 500);
    }
})();
