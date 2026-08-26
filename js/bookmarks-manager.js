/**
 * js/bookmarks-manager.js
 * AquaRevier Map Bookmarks & Favorites Manager
 * Saves custom map views (center, zoom, active layers) locally in browser storage for 1-click retrieval.
 */

(function() {
    const STORAGE_KEY = 'aquarevier_saved_bookmarks_v1';

    let cachedBookmarks = null;
    const bookmarksMap = new Map();

    function loadCache() {
        cachedBookmarks = [];
        bookmarksMap.clear();
        try {
            const raw = window.StorageModule.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    cachedBookmarks = parsed;
                    for (let i = 0; i < parsed.length; i++) {
                        const bm = parsed[i];
                        if (bm && bm.id !== undefined && bm.id !== null) {
                            if (!bookmarksMap.has(bm.id)) {
                                bookmarksMap.set(bm.id, bm);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            cachedBookmarks = [];
            bookmarksMap.clear();
        }
    }

    /**
     * Lazy-initialization guard: ensures bookmarks are loaded from storage into memory on first access.
     */
    function ensureLoaded() {
        if (cachedBookmarks === null) {
            loadCache();
        }
    }

    function persistBookmarks() {
        try {
            window.StorageModule.setItem(STORAGE_KEY, JSON.stringify(cachedBookmarks || []));
        } catch (e) {
            console.warn('Failed to persist bookmarks to storage:', e);
        }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', function(e) {
            if (e.key === STORAGE_KEY || e.key === null) {
                cachedBookmarks = null;
            }
        });
    }

    window.getSavedBookmarks = function() {
        ensureLoaded();
        return cachedBookmarks.map(b => ({ ...b }));
    };

    window.saveBookmark = function(title) {
        if (!title || !title.trim()) {
            if (typeof window.showToast === 'function') window.showToast("Lesezeichen-Erstellung abgebrochen", "ℹ️");
            return;
        }
        if (typeof map === 'undefined') return;
        const center = map.getCenter();
        const zoom = map.getZoom();

        ensureLoaded();
        const newBookmark = {
            id: 'bm_' + Date.now(),
            title: title.trim(),
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
            date: new Date().toLocaleDateString('de-DE')
        };

        cachedBookmarks.push(newBookmark);
        bookmarksMap.set(newBookmark.id, newBookmark);
        persistBookmarks();
        window.renderBookmarksList();
        if (typeof window.showToast === 'function') window.showToast(`Lesezeichen "${title.trim()}" gespeichert`, "🔖");
    };

    window.deleteBookmark = function(id) {
        ensureLoaded();
        if (bookmarksMap.has(id)) {
            bookmarksMap.delete(id);
            cachedBookmarks = cachedBookmarks.filter(b => b.id !== id);
            persistBookmarks();
        }
        window.renderBookmarksList();
    };

    window.applyBookmark = function(id) {
        if (id === null || id === undefined) return;
        ensureLoaded();
        const bm = bookmarksMap.get(id);
        if (bm && typeof map !== 'undefined') {
            map.setView([bm.lat, bm.lng], bm.zoom, { animate: true });
        }
    };

    window.renderBookmarksList = function() {
        const container = document.getElementById('bookmarks-list-container');
        if (!container) return;

        ensureLoaded();
        if (cachedBookmarks.length === 0) {
            container.innerHTML = `
                <div style="font-size: 10.5px; color: #64748b; text-align: center; padding: 6px;">
                    Keine gespeicherten Favoriten. Klicke auf "➕ Favorit speichern".
                </div>
            `;
            return;
        }

        let html = '';
        cachedBookmarks.forEach(bm => {
            html += `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                    <div style="cursor: pointer; flex: 1;" onclick="applyBookmark('${bm.id}')">
                        <div style="font-weight: 600; color: #1e293b;">⭐ ${escapeHtml(bm.title)}</div>
                        <div style="font-size: 9.5px; color: #64748b;">Zoom ${bm.zoom} • ${bm.date}</div>
                    </div>
                    <button type="button" aria-label="Löschen" title="Löschen" style="background: transparent; border: none; color: #ef4444; font-size: 14px; cursor: pointer;" onclick="deleteBookmark('${bm.id}')">✕</button>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(window.renderBookmarksList, 700));
    } else {
        setTimeout(window.renderBookmarksList, 700);
    }
})();
