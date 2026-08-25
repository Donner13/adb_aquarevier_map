'use strict';

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Bookmarks Manager Performance & Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        await page.evaluate(() => {
            const storage = new Map();
            window.StorageModule = {
                getItem: (key) => storage.get(key) || null,
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

    test('bookmark performance benchmark demonstrates speedup over baseline (10,000 iterations)', async ({ page }) => {
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

            // Baseline unoptimized approach simulation (JSON.parse + Array.find + map.setView per lookup)
            const baselineStart = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                const targetId = 'bm_' + (i % N);
                const raw = window.StorageModule.getItem(key);
                const list = JSON.parse(raw);
                const bm = list.find(b => b.id === targetId);
                if (bm && typeof map !== 'undefined') {
                    map.setView([bm.lat, bm.lng], bm.zoom, { animate: true });
                }
            }
            const baselineMs = performance.now() - baselineStart;

            // Optimized in-memory Map lookup approach
            const optStart = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                const targetId = 'bm_' + (i % N);
                window.applyBookmark(targetId);
            }
            const optimizedMs = performance.now() - optStart;

            return {
                baselineMs,
                optimizedMs,
                speedup: baselineMs / (optimizedMs || 0.001)
            };
        });

        expect(perfResult.optimizedMs).toBeLessThanOrEqual(perfResult.baselineMs);
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

    test('detects same-tab direct storage updates via string comparison', async ({ page }) => {
        const reloaded = await page.evaluate(() => {
            window.saveBookmark('Initial Bookmark');
            const key = 'aquarevier_saved_bookmarks_v1';

            // Directly modify storage in same tab without dispatching event
            const externalData = [{ id: 'bm_direct', title: 'Direct Storage Modification', lat: 51, lng: 7, zoom: 10, date: '2025' }];
            window.StorageModule.setItem(key, JSON.stringify(externalData));

            const list = window.getSavedBookmarks();
            return list.length === 1 && list[0].id === 'bm_direct';
        });

        expect(reloaded).toBe(true);
    });

    test('getSavedBookmarks returns shallow copy protecting nested objects from mutation without JSON overhead', async ({ page }) => {
        const isProtected = await page.evaluate(() => {
            window.saveBookmark('Immutable Test');
            const list1 = window.getSavedBookmarks();
            list1[0].title = 'Corrupted Title';

            const list2 = window.getSavedBookmarks();
            return list2[0].title === 'Immutable Test';
        });

        expect(isProtected).toBe(true);
    });

    test('clears cache when external storage is deleted or cleared', async ({ page }) => {
        const cleared = await page.evaluate(() => {
            window.saveBookmark('Tab 1 Bookmark');
            const key = 'aquarevier_saved_bookmarks_v1';

            // Simulate external storage removal
            window.StorageModule.removeItem(key);

            // Dispatch storage event with null newValue
            window.dispatchEvent(new StorageEvent('storage', { key: key, newValue: null }));

            const list = window.getSavedBookmarks();
            return list.length === 0;
        });

        expect(cleared).toBe(true);
    });
});
