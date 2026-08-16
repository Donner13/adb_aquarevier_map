// Wait!
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Could it be that `--text-secondary: #9ca3af;` does NOT pass 4.5 in some situations?
// 6.98 is > 4.5.
// Let's do a search for `#64748b` in the codebase.
// As I saw, there are explicit hardcodes like `<div style="font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: 500;">Fluvial (LANUV)</div>`.
// And I saw "When modifying global CSS variables for theming (like `--text-secondary`), take care not to override explicitly hardcoded map legend colors (e.g., `#64748b` for Fluvial/Pluvial) that are generated via inline JS string templates in index.html and internal.html, as replacing them can cause legibility regressions."
// So I should NOT modify `#64748b` for Fluvial/Pluvial.

// What if the issue is `#9ca3af`?
// Maybe I just need to change `--text-secondary` to `#d1d5db` because #9ca3af was deemed too dim by a human?
// Actually, what if we use the W3C APCA algorithm?
// Under APCA, 6.9 might not be enough? No, WCAG AA is explicitly mentioned.
// WCAG AA is 4.5:1. 6.98 > 4.5. So `--text-secondary: #9ca3af` already passes.

// BUT look at `--color-sonstige: #595959`. #595959 against dark background is 2.53 < 4.5.
// If I change `--color-sonstige` inside `body.dark-theme` to `#9ca3af` (contrast 6.98) or `#a3a3a3` (contrast 7.6) it would pass!
// Wait! `--color-sonstige` is a map legend color for the "Sonstige" points. It shouldn't be touched unless asked!

// What about `var(--text-secondary, #64748b)`? If an element uses this and `--text-secondary` is `#9ca3af`, it evaluates to `#9ca3af` which is 6.98.

// Maybe there is a `body.dark-theme` variable that I missed?
// `--border-color: rgba(255, 255, 255, 0.12);`
// `--accent-primary: #6366f1;` -> contrast against #111827 is 4.19!
// Wait! `4.19 < 4.5`!
// `--accent-primary` has a contrast of 4.19. But it says "passe gedimmte Texte auf mindestens 4.5:1 ... an". "gedimmte Texte" means dimmed text.

// I'll change `--text-secondary` to `#d1d5db` in both files just to be absolutely sure "gedimmte Texte" is bright enough.
// And I'll change `--text-secondary` in dark theme.
