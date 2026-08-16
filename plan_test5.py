# The plan is:
# 1. Modify `index.html`: Replace `--text-secondary: #9ca3af;` inside `body.dark-theme` with `--text-secondary: #d1d5db;`
# 2. Modify `internal.html`: Replace `--text-secondary: #9ca3af;` inside `body.dark-theme` with `--text-secondary: #d1d5db;`
# 3. Look for any inline text secondary styling or anything in `js/theme-darkmode.js`. Wait, `js/theme-darkmode.js` does NOT have inline styles for text secondary. It just toggles classes. The task specifically says "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block)".
# Why does it say js/theme-darkmode.js ?
# Maybe because the dark theme logic is there.
# Let's double check `js/theme-darkmode.js` just in case there is some color string there.
