/**
 * js/modules/storage.js
 * Modularize State Persistence by encapsulating LocalStorage read/write routines.
 */

(function(window) {
    'use strict';

    /**
     * Wrapper class for local storage operations.
     * Provides safe access to localStorage with error handling.
     */
    class StorageModule {

        /**
         * Retrieves an item from local storage by key.
         *
         * @param {string} key - The key of the item to retrieve.
         * @returns {string|null} The value associated with the key, or null if the key does not exist or storage is unavailable.
         */
        getItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('Storage unavailable for getItem:', e);
                return null;
            }
        }

        /**
         * Sets an item in local storage.
         *
         * @param {string} key - The key under which to store the value.
         * @param {string} value - The value to store.
         * @returns {boolean} True if the item was successfully stored, false if storage is unavailable.
         */
        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Storage unavailable for setItem:', e);
                return false;
            }
        }

        /**
         * Removes an item from local storage by key.
         *
         * @param {string} key - The key of the item to remove.
         * @returns {boolean} True if the item was successfully removed (or if it didn't exist), false if storage is unavailable.
         */
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
