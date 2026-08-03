const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetStrRenderStart = `        // Render Sidebar and Markers
        function renderMapAndSidebar() {`;

const renderUpdateStr = `
        // Update URL Parameters based on current filters
        function updateUrlParams() {
            const url = new URL(window.location);
            const searchQuery = document.getElementById('search-input').value.trim();

            if (searchQuery) {
                url.searchParams.set('q', searchQuery);
            } else {
                url.searchParams.delete('q');
            }

            if (activeFilters.size < Object.keys(groupColors).length) {
                url.searchParams.set('gruppe', Array.from(activeFilters).join(','));
            } else {
                url.searchParams.delete('gruppe');
            }

            window.history.replaceState({}, '', url);
        }

        // Render Sidebar and Markers
        function renderMapAndSidebar() {
            updateUrlParams();
`;

html = html.replace(targetStrRenderStart, renderUpdateStr);

const targetStrLoadStart = `        // Initial Load
        loadContacts();`;

const initUpdateStr = `        // Initial Load parsing URL
        function parseUrlParamsAndLoad() {
            const url = new URL(window.location);
            const q = url.searchParams.get('q');
            const gruppe = url.searchParams.get('gruppe');

            if (q) {
                document.getElementById('search-input').value = q;
            }

            if (gruppe) {
                activeFilters.clear();
                const groups = gruppe.split(',');
                groups.forEach(g => {
                    if (groupColors[g]) {
                        activeFilters.add(g);
                    }
                });

                // Update UI buttons based on loaded params
                document.querySelectorAll('.filter-btn[data-group]').forEach(btn => {
                    const bg = btn.getAttribute('data-group');
                    if (bg === 'all') {
                        if (activeFilters.size === Object.keys(groupColors).length) {
                            btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');
                        } else {
                            btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');
                        }
                    } else {
                        if (activeFilters.has(bg)) {
                            btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');
                        } else {
                            btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');
                        }
                    }
                });
            }

            loadContacts();
        }

        // Filter Reset Logic
        document.getElementById('reset-filters-btn').addEventListener('click', () => {
            document.getElementById('search-input').value = '';

            activeFilters = new Set(Object.keys(groupColors));
            document.querySelectorAll('.filter-btn[data-group]').forEach(btn => {
                btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');
            });

            renderMapAndSidebar();
        });

        // Initial Load
        parseUrlParamsAndLoad();`;

html = html.replace(targetStrLoadStart, initUpdateStr);

fs.writeFileSync('index.html', html);
console.log("Filter logic and URL params added successfully.");
