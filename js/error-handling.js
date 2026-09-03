/**
 * AquaRevier Error Handling & Toast Notification Engine
 * Manages user-facing error states, loading indicators, and toast feedback.
 */
(function(window) {
    'use strict';

    class AquaErrorManager {
        constructor() {
            this.container = null;
            this.initContainer();
        }

        initContainer() {
            if (document.getElementById('aqua-toast-container')) return;
            if (!document.getElementById('aqua-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'aqua-toast-styles';
                style.textContent = `
                    .aqua-toast-container {
                        position: fixed;
                        top: 72px;
                        right: 16px;
                        z-index: 5000;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        width: min(360px, calc(100vw - 32px));
                        pointer-events: none;
                    }
                    .aqua-toast {
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                        padding: 12px 14px;
                        color: var(--text-primary, #0f172a);
                        background: var(--bg-surface, #fff);
                        border: 1px solid var(--border-color, #cbd5e1);
                        border-left: 4px solid #0284c7;
                        border-radius: 8px;
                        box-shadow: 0 10px 30px rgba(15, 23, 42, .2);
                        opacity: 0;
                        transform: translateX(16px);
                        transition: opacity .2s ease, transform .2s ease;
                        pointer-events: auto;
                    }
                    .aqua-toast-visible { opacity: 1; transform: translateX(0); }
                    .aqua-toast-hiding { opacity: 0; transform: translateX(16px); }
                    .aqua-toast-success { border-left-color: #16a34a; }
                    .aqua-toast-warning { border-left-color: #d97706; }
                    .aqua-toast-error { border-left-color: #dc2626; }
                    .aqua-toast-message { flex: 1; line-height: 1.4; }
                    .aqua-toast-close {
                        border: 0;
                        background: transparent;
                        color: inherit;
                        cursor: pointer;
                        font-size: 1.25rem;
                        line-height: 1;
                    }
                `;
                document.head.appendChild(style);
            }
            const container = document.createElement('div');
            container.id = 'aqua-toast-container';
            container.className = 'aqua-toast-container';
            document.body.appendChild(container);
            this.container = container;
        }

        showToast(message, type = 'info', duration = 4000) {
            this.initContainer();
            const toast = document.createElement('div');
            toast.className = `aqua-toast aqua-toast-${type}`;
            
            const iconMap = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };

            toast.innerHTML = `
                <span class="aqua-toast-icon">${iconMap[type] || 'ℹ️'}</span>
                <span class="aqua-toast-message">${message}</span>
                <button class="aqua-toast-close" type="button" aria-label="Schließen">&times;</button>
            `;

            toast.querySelector('.aqua-toast-close').onclick = () => {
                toast.classList.add('aqua-toast-hiding');
                setTimeout(() => toast.remove(), 300);
            };

            this.container.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('aqua-toast-visible'));

            if (duration > 0) {
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.classList.add('aqua-toast-hiding');
                        setTimeout(() => toast.remove(), 300);
                    }
                }, duration);
            }
        }

        showLayerLoading(layerName) {
            this.showToast(`Lade Daten für ${layerName}...`, 'info', 2000);
        }

        showLayerError(layerName, errorMsg = '') {
            const detail = errorMsg ? ` (${errorMsg})` : '';
            this.showToast(`Fehler beim Laden von ${layerName}${detail}. Bitte erneut versuchen.`, 'error', 5000);
        }

        handleWmsTileError(tileUrl) {
            console.warn('[AquaRevier] WMS Tile error:', tileUrl);
            this.showToast('Einige Kartenausschnitte (WMS) konnten nicht geladen werden.', 'warning', 3000);
        }
    }

    window.AquaError = new AquaErrorManager();
    window.showToastNotification = (msg, type, duration) => window.AquaError.showToast(msg, type, duration);
})(window);
