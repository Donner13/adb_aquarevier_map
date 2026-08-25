'use strict';

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Bookmarks Manager Performance & Logic Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('about:blank');

        await page.evaluate(() => {
            const storageMap = new Map();
            window.StorageModule = {
                getItem: (key) => storageMap.get(key) || null,
                setItem: (key, val) => storageMap.set(key, val),
                removeItem: (key) => storageMap.delete(key)
            };
            window.map = {
                setView: (coords, zoom, options) => {
                    window._lastSetView = { coords, zoom, options };
                }
            };
        });

        const scriptContent = fs.readFileSync(path.resolve(__dirname, '../../js/bookmarks-manager.js'), 'utf-8');
        await page.addScriptTag({ content: scriptContent });
    });

    test('bookmark performance benchmark and correctness', async ({ page }) => {
        const perfResult = await page.evaluate(() => {
            // Populate 500 bookmarks into storage
            const N = 500;
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
            window.StorageModule.setItem('aquarevier_saved_bookmarks_v1', JSON.stringify(bookmarks));

            // Measure 1,000 lookups via applyBookmark
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                const id = 'bm_' + (i % N);
                window.applyBookmark(id);
            }
            const durationMs = performance.now() - start;

            const saved = window.getSavedBookmarks();

            return {
                durationMs,
                count: saved.length,
                lastSetView: window._lastSetView
            };
        });

        expect(perfResult.count).toBe(500);
        // 1,000 in-memory Map lookups should execute in under 50ms
        expect(perfResult.durationMs).toBeLessThan(50);
        expect(perfResult.lastSetView).toBeDefined();
    });
});
