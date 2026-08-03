/**
 * js/modules/storage.js
 * Modularize State Persistence by encapsulating LocalStorage read/write routines.
 */

(function(window) {
    'use strict';

    class StorageModule {
        getItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('Storage unavailable for getItem:', e);
                return null;
            }
        }

        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Storage unavailable for setItem:', e);
                return false;
            }
        }

        removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Storage unavailable for removeItem:', e);
                return false;
            }
        }
    }

    window.StorageModule = new StorageModule();
})(window);
