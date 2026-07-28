/**
 * js/pwa-offline.js
 * AquaRevier PWA Offline & Field Mode Handler
 * Manages network status indicators, offline caching, and PWA integration for field work.
 */

(function() {
    function updateNetworkStatus() {
        const isOnline = navigator.onLine;
        const badge = document.getElementById('network-status-badge');
        if (badge) {
            if (isOnline) {
                badge.innerHTML = '🟢 Online';
                badge.style.background = '#dcfce7';
                badge.style.color = '#15803d';
                badge.style.borderColor = '#86efac';
            } else {
                badge.innerHTML = '📡 Offline (Feldmodus)';
                badge.style.background = '#fef3c7';
                badge.style.color = '#b45309';
                badge.style.borderColor = '#fde68a';
            }
        }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNetworkStatus);
    } else {
        updateNetworkStatus();
    }
})();
