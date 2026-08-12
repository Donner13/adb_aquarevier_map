/**
 * js/pwa-offline.js
 * AquaRevier Network Connectivity & Field Mode Status Indicator
 * Manages online/offline network status badge indicators during field work.
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

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
