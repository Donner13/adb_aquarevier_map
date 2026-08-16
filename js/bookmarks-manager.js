/**
 * js/bookmarks-manager.js
 * AquaRevier Map Bookmarks & Favorites Manager
 * Saves custom map views (center, zoom, active layers) locally in browser storage for 1-click retrieval.
 */

(function() {
    const STORAGE_KEY = 'aquarevier_saved_bookmarks_v1';

    window.getSavedBookmarks = function() {
        try {
            const raw = window.StorageModule.getItem(STORAGE_KEY);
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw); // parse safely
                return Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
                return [];
            }
        } catch (e) {
            return [];
        }
    };

    window.saveBookmark = function(title) {
        if (!title || !title.trim()) {
            if (typeof window.showToast === 'function') window.showToast("Lesezeichen-Erstellung abgebrochen", "ℹ️");
            return;
        }
        if (typeof map === 'undefined') return;
        const center = map.getCenter();
        const zoom = map.getZoom();

        const bookmarks = window.getSavedBookmarks();
        const newBookmark = {
            id: 'bm_' + Date.now(),
            title: title.trim(),
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
            date: new Date().toLocaleDateString('de-DE')
        };

        bookmarks.push(newBookmark);
        window.StorageModule.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        window.renderBookmarksList();
        if (typeof window.showToast === 'function') window.showToast(`Lesezeichen "${title.trim()}" gespeichert`, "🔖");
    };

    window.deleteBookmark = function(id) {
        let bookmarks = window.getSavedBookmarks();
        bookmarks = bookmarks.filter(b => b.id !== id);
        window.StorageModule.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        window.renderBookmarksList();
    };

    window.applyBookmark = function(id) {
        const bookmarks = window.getSavedBookmarks();
        const bm = bookmarks.find(b => b.id === id);
        if (bm && typeof map !== 'undefined') {
            map.setView([bm.lat, bm.lng], bm.zoom, { animate: true });
        }
    };

    window.renderBookmarksList = function() {
        const container = document.getElementById('bookmarks-list-container');
        if (!container) return;

        const bookmarks = window.getSavedBookmarks();
        if (bookmarks.length === 0) {
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
