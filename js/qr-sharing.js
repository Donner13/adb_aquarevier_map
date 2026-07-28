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
        if (typeof map === 'undefined') return window.location.href;
        const center = map.getCenter();
        const zoom = map.getZoom();
        
        const params = new URLSearchParams();
        params.set('lat', center.lat.toFixed(5));
        params.set('lng', center.lng.toFixed(5));
        params.set('z', zoom);

        const activeLayers = [];
        if (window.activeOverlayLayers) {
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
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 10010;
                background: rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background: #ffffff; width: 100%; max-width: 420px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; text-align: center; font-size: 12px;">
                <div style="background: #1e293b; color: #ffffff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 15px; font-weight: 700;">📱 QR-Code &amp; Deep-Link Teilen</span>
                    <button type="button" onclick="closeQrShareModal()" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="font-size: 11.5px; color: #64748b; margin-bottom: 14px;">
                        Scanne den QR-Code mit deinem Smartphone, um diesen Kartenausschnitt &amp; die aktiven Layer direkt vor Ort im Feld zu öffnen.
                    </div>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: inline-block; margin-bottom: 14px;">
                        <img src="${qrApiUrl}" alt="QR Code" width="200" height="200" style="display: block; border-radius: 4px;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'><rect width=\\'200\\' height=\\'200\\' fill=\\'%23f1f5f9\\'/><text x=\\'100\\' y=\\'105\\' font-size=\\'12\\' text-anchor=\\'middle\\' fill=\\'%2364748b\\'>QR-Code (Offline)</text></svg>';">
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
            navigator.clipboard.writeText(input.value).then(() => {
                alert('Deep-Link erfolgreich kopiert!');
            });
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})();
