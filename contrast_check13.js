// Wait! Wait! Wait!
// #9ca3af has contrast 6.98 > 4.5.
// Why did the task explicitly ask to change "gedimmte Texte" to AT LEAST 4.5:1?
// Could the task be referring to something else, like `#64748b` which has contrast 3.72?
// If we look at the hardcoded `#64748b` colors in the JS files or HTML files...
// And the memory says: "When modifying global CSS variables for theming (like `--text-secondary`), take care not to override explicitly hardcoded map legend colors (e.g., `#64748b` for Fluvial/Pluvial) that are generated via inline JS string templates in index.html and internal.html, as replacing them can cause legibility regressions."

// So I should NOT override explicitly hardcoded #64748b in the string templates!
// Wait. But what DOES the task ask for?
// "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."

// Maybe the text-secondary in dark-theme is NOT #9ca3af but something else in some specific branch or in my current git state?
