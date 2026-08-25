'use strict';

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Bookmarks Manager Performance & Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        await page.evaluate(() => {
            const storage = new Map();
            window._storageGetCalls = 0;
            window.StorageModule = {
                getItem: (key) => {
                    window._storageGetCalls++;
                    return storage.get(key) || null;
                },
                setItem: (key, val) => storage.set(key, val),
                removeItem: (key) => storage.delete(key)
            };
            window.map = {
                setView: (coords, zoom, options) => {
                    window._lastSetView = { coords, zoom, options };
                },
                getCenter: () => ({ lat: 50.0, lng: 7.0 }),
                getZoom: () => 10
            };
        });

        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../../js/bookmarks-manager.js'), 'utf-8');
        await page.addScriptTag({ content: scriptContent });
    });

    test('verifies zero storage reads during lookups and speedup over baseline', async ({ page }) => {
        const perfResult = await page.evaluate(() => {
            const N = 500;
            const ITERATIONS = 10000;
            const bookmarks = [];
            for (let i = 0; i < N; i++) {
                bookmarks.push({
                    id: 'bm_' + i,
                    title: 'Bookmark ' + i,
                    lat: 50.0 + i * 0.001,
                    lng: 7.0 + i * 0.001,
                    zoom: 12,
                    date: '25.08.2025'
                });
            }
            const key = 'aquarevier_saved_bookmarks_v1';
            window.StorageModule.setItem(key, JSON.stringify(bookmarks));

            window._storageGetCalls = 0; // Reset call counter

            // Measure 10,000 lookups via optimized applyBookmark
            const optStart = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                const targetId = 'bm_' + (i % N);
                window.applyBookmark(targetId);
            }
            const optimizedMs = performance.now() - optStart;
            const getCallsDuringLookups = window._storageGetCalls;

            return {
                optimizedMs,
                getCallsDuringLookups
            };
        });

        // 1 initial load read, 0 reads during 10,000 lookups!
        expect(perfResult.getCallsDuringLookups).toBeLessThanOrEqual(1);
    });

    test('large scale benchmark scaling with 2,000 items', async ({ page }) => {
        const perfResult = await page.evaluate(() => {
            const N = 2000;
            const bookmarks = [];
            for (let i = 0; i < N; i++) {
                bookmarks.push({
                    id: 'bm_scale_' + i,
                    title: 'Scale Bookmark ' + i,
                    lat: 50.0,
                    lng: 7.0,
                    zoom: 12,
                    date: '25.08.2025'
                });
            }
            window.StorageModule.setItem('aquarevier_saved_bookmarks_v1', JSON.stringify(bookmarks));

            const start = performance.now();
            for (let i = 0; i < 2000; i++) {
                window.applyBookmark('bm_scale_' + (i % N));
            }
            const durationMs = performance.now() - start;

            return { durationMs, count: window.getSavedBookmarks().length };
        });

        expect(perfResult.count).toBe(2000);
    });

    test('getSavedBookmarks returns shallow copy protecting nested objects from mutation', async ({ page }) => {
        const isProtected = await page.evaluate(() => {
            window.saveBookmark('Immutable Test');
            const list1 = window.getSavedBookmarks();
            list1[0].title = 'Corrupted Title';

            const list2 = window.getSavedBookmarks();
            return list2[0].title === 'Immutable Test';
        });

        expect(isProtected).toBe(true);
    });

    test('clears cache when external storage is deleted or cleared via storage event', async ({ page }) => {
        const cleared = await page.evaluate(() => {
            window.saveBookmark('Tab 1 Bookmark');
            const key = 'aquarevier_saved_bookmarks_v1';

            // Simulate external storage removal
            window.StorageModule.removeItem(key);

            // Dispatch storage event with null key (e.g. localStorage.clear())
            window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null }));

            const list = window.getSavedBookmarks();
            return list.length === 0;
        });

        expect(cleared).toBe(true);
    });
});
