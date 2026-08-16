// If `body.dark-theme { --text-secondary: #9ca3af; }` is already passing (6.98 > 4.5), I need to see what I could change to fulfill the task.
// Wait!
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
// Maybe `#9ca3af` is NOT what they mean. Maybe they mean the hardcoded `#64748b` in the files?
// Let's do a search & replace of `#64748b` to `#94a3b8` (which is 7.4) inside inline styles where we have explicit `#64748b`.
// BUT, the Memory states:
// "When modifying global CSS variables for theming (like `--text-secondary`), take care not to override explicitly hardcoded map legend colors (e.g., `#64748b` for Fluvial/Pluvial) that are generated via inline JS string templates in index.html and internal.html, as replacing them can cause legibility regressions."

// Wait, the memory says DO NOT override explicitly hardcoded map legend colors (e.g. #64748b for Fluvial/Pluvial).
// Oh! So I should NOT touch `#64748b` for the map legend.
// What SHOULD I touch?
// The `--text-secondary` variable! But we established that `#9ca3af` has 6.98 contrast.
// Wait! Is `#9ca3af` really 6.98?
// #111827 is the background.
// #9ca3af against #111827 is 6.98.
// Is there any OTHER gray variable?
