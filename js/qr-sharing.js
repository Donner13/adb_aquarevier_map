/**
 * js/qr-sharing.js
 * AquaRevier Instant QR-Code & Deep-Link Share Generator
 * Generates shareable URLs and dynamic QR codes capturing map coordinates and active layers.
 */

(function() {
    /**
     * Generates a deep-link URL capturing current map position & active layers.
     */
    window.generateCurrentMapDeepLink = function() {
        if (typeof map === 'undefined' || !map || typeof map.getCenter !== 'function') return window.location.href;
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        const params = new URLSearchParams();
        params.set('lat', center.lat.toFixed(5));
        params.set('lng', center.lng.toFixed(5));
        params.set('z', zoom);

        const activeLayers = [];
        const overlayMaps = window.overlayMaps || (typeof window.overlayMaps !== 'undefined' ? window.overlayMaps : null);
        if (overlayMaps && typeof map !== 'undefined') {
            Object.keys(overlayMaps).forEach(name => {
                const layer = overlayMaps[name];
                if (layer && map.hasLayer(layer)) {
                    activeLayers.push(name);
                }
            });
        } else if (window.activeOverlayLayers) {
            Object.keys(window.activeOverlayLayers).forEach(name => {
                if (window.activeOverlayLayers[name]) activeLayers.push(name);
            });
        }
        if (activeLayers.length > 0) {
            params.set('layers', activeLayers.join(','));
        }

        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?${params.toString()}`;
    };

    /**
     * Renders QR code modal with fallback image onError.
     */
    window.openQrShareModal = function() {
        const deepLink = window.generateCurrentMapDeepLink();
        const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(deepLink)}&size=240&margin=1`;

        let modal = document.getElementById('qr-share-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'qr-share-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'qr-share-modal-title');
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10010;
                background: var(--modal-backdrop, rgba(0, 0, 0, 0.6));
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background: var(--bg-surface, #ffffff); width: 100%; max-width: 420px; border-radius: 12px; box-shadow: var(--modal-shadow, 0 10px 30px rgba(0, 0, 0, 0.5)); overflow: hidden; text-align: center; font-size: 12px;">
                <div style="background: #1e293b; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <span id="qr-share-modal-title" style="font-size: 15px; font-weight: 700;">📱 QR-Code &amp; Deep-Link Teilen</span>
                    <button type="button" onclick="closeQrShareModal()" aria-label="Schließen" title="Schließen" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="font-size: 11.5px; color: var(--text-secondary, #64748b); margin-bottom: 14px;">
                        Scanne den QR-Code mit deinem Smartphone, um diesen Kartenausschnitt &amp; die aktiven Layer direkt vor Ort im Feld zu öffnen.
                    </div>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: inline-block; margin-bottom: 14px;">
                        <img src="${qrApiUrl}" alt="QR Code" width="200" height="200" style="display: block; border-radius: 4px;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><path fill=\\'%23f1f5f9\\' d=\\'M0 0h200v200H0z\\'/><text x=\\'100\\' y=\\'105\\' fill=\\'%2364748b\\' font-size=\\'12\\' text-anchor=\\'middle\\'>QR-Code (Offline)</text></svg>';">
                    </div>

                    <div style="margin-bottom: 14px;">
                        <input type="text" id="qr-deeplink-input" value="${escapeHtml(deepLink)}" readonly style="width: 100%; font-size: 11px; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f1f5f9; text-align: center;">
                    </div>

                    <button type="button" class="btn btn-sm btn-primary" style="width: 100%; font-size: 12px; padding: 6px;" onclick="copyDeepLinkToClipboard()">
                        📋 Link in Zwischenablage kopieren
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.closeQrShareModal = function() {
        const modal = document.getElementById('qr-share-modal');
        if (modal) modal.style.display = 'none';
    };

    window.copyDeepLinkToClipboard = function() {
        const input = document.getElementById('qr-deeplink-input');
        if (input) {
            input.select();
            const msg = (window.currentLanguage === 'en') ? '✓ Link copied to clipboard!' : '✓ Link erfolgreich in die Zwischenablage kopiert!';
            navigator.clipboard.writeText(input.value).then(() => {
                if (typeof window.showToast === 'function') {
                    window.showToast(msg, '🔗');
                } else {
                    alert(msg);
                }
            });
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
