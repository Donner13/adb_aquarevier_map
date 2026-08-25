/**
 * js/bookmarks-manager.js
 * AquaRevier Map Bookmarks & Favorites Manager
 * Saves custom map views (center, zoom, active layers) locally in browser storage for 1-click retrieval.
 */

(function() {
    const STORAGE_KEY = 'aquarevier_saved_bookmarks_v1';

    let bookmarksCache = [];
    let bookmarksMap = new Map();
    let cacheInitialized = false;

    /**
     * Lazy-loads bookmarks from storage into in-memory array and Map caches.
     * Prevents synchronous disk I/O and JSON re-parsing on subsequent access.
     */
    function ensureCacheLoaded() {
        if (cacheInitialized) return;
        if (!bookmarksMap) bookmarksMap = new Map();

        try {
            let raw = null;
            if (window.StorageModule && typeof window.StorageModule.getItem === 'function') {
                raw = window.StorageModule.getItem(STORAGE_KEY);
            } else if (typeof localStorage !== 'undefined') {
                raw = localStorage.getItem(STORAGE_KEY);
            }
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    bookmarksCache = parsed;
                }
            }
        } catch (e) {
            bookmarksCache = [];
        }

        bookmarksMap.clear();
        for (let i = 0; i < bookmarksCache.length; i++) {
            const bm = bookmarksCache[i];
            if (bm && bm.id !== undefined && bm.id !== null) {
                if (!bookmarksMap.has(bm.id)) {
                    bookmarksMap.set(bm.id, bm);
                }
            }
        }
        cacheInitialized = true;
    }

    /**
     * Persists current in-memory bookmarks to local browser storage.
     */
    function persistBookmarks() {
        try {
            if (window.StorageModule && typeof window.StorageModule.setItem === 'function') {
                window.StorageModule.setItem(STORAGE_KEY, JSON.stringify(bookmarksCache));
            } else if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarksCache));
            }
        } catch (e) {
            if (typeof window.showToast === 'function') {
                window.showToast("Speichern im Browserspeicher fehlgeschlagen", "⚠️");
            }
        }
    }

    // Synchronize cache when localStorage is updated in another tab
    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', (e) => {
            if (e && e.key === STORAGE_KEY) {
                if (e.newValue) {
                    try {
                        const parsed = JSON.parse(e.newValue);
                        if (Array.isArray(parsed)) {
                            bookmarksCache = parsed;
                            if (!bookmarksMap) bookmarksMap = new Map();
                            bookmarksMap.clear();
                            for (let i = 0; i < bookmarksCache.length; i++) {
                                const bm = bookmarksCache[i];
                                if (bm && bm.id !== undefined && bm.id !== null) {
                                    if (!bookmarksMap.has(bm.id)) {
                                        bookmarksMap.set(bm.id, bm);
                                    }
                                }
                            }
                            cacheInitialized = true;
                        } else {
                            cacheInitialized = false;
                        }
                    } catch (err) {
                        cacheInitialized = false;
                    }
                } else {
                    cacheInitialized = false;
                }
                if (typeof window.renderBookmarksList === 'function') {
                    window.renderBookmarksList();
                }
            }
        });
    }

    window.getSavedBookmarks = function() {
        ensureCacheLoaded();
        return bookmarksCache.map(bm => ({ ...bm }));
    };

    window.saveBookmark = function(title) {
        if (!title || !title.trim()) {
            if (typeof window.showToast === 'function') window.showToast("Lesezeichen-Erstellung abgebrochen", "ℹ️");
            return;
        }
        if (typeof map === 'undefined') return;
        const center = map.getCenter();
        const zoom = map.getZoom();

        ensureCacheLoaded();

        const newBookmark = {
            id: 'bm_' + Date.now(),
            title: title.trim(),
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
            date: new Date().toLocaleDateString('de-DE')
        };

        bookmarksCache.push(newBookmark);
        if (bookmarksMap && !bookmarksMap.has(newBookmark.id)) {
            bookmarksMap.set(newBookmark.id, newBookmark);
        }

        persistBookmarks();
        window.renderBookmarksList();
        if (typeof window.showToast === 'function') window.showToast(`Lesezeichen "${title.trim()}" gespeichert`, "🔖");
    };

    window.deleteBookmark = function(id) {
        ensureCacheLoaded();
        if (!bookmarksMap || !bookmarksMap.has(id)) return;

        bookmarksCache = bookmarksCache.filter(b => b.id !== id);
        bookmarksMap.delete(id);

        persistBookmarks();
        window.renderBookmarksList();
    };

    window.applyBookmark = function(id) {
        ensureCacheLoaded();
        if (!bookmarksMap) return;
        const bm = bookmarksMap.get(id);
        if (bm && typeof map !== 'undefined') {
            map.setView([bm.lat, bm.lng], bm.zoom, { animate: true });
        }
    };

    window.renderBookmarksList = function() {
        const container = document.getElementById('bookmarks-list-container');
        if (!container) return;

        const bookmarks = window.getSavedBookmarks();
        if (!bookmarks || bookmarks.length === 0) {
            container.innerHTML = `
                <div style="font-size: 10.5px; color: #64748b; text-align: center; padding: 6px;">
                    Keine gespeicherten Favoriten. Klicke auf "➕ Favorit speichern".
                </div>
            `;
            return;
        }

        let html = '';
        bookmarks.forEach(bm => {
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
