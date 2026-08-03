/**
 * js/modules/storage.js
 * Modularized State Persistence
 * Provides a unified interface for LocalStorage read/write routines.
 */
(function(window) {
    'use strict';

    const AppStorage = {
        getItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('Storage read unavailable:', e);
                return null;
            }
        },

        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Storage write unavailable:', e);
                return false;
            }
        },

        removeItem(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Storage remove unavailable:', e);
                return false;
            }
        }
    };

    window.AppStorage = AppStorage;
})(window);
