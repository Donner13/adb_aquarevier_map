1.  **Analyze Dark Mode Contrast**:
    *   Dark mode background surfaces (`--bg-surface`) use `rgba(17, 24, 39, 0.95)` (close to `#111827`).
    *   Hover surfaces (`--bg-surface-hover`) use `rgba(31, 41, 55, 0.95)` (close to `#1f293b`).
    *   The dimmed text variable `--text-secondary` is currently `#9ca3af`. Its contrast on `--bg-surface-hover` (`#1f293b`) is ~5.7:1, which passes WCAG AA (4.5:1).
    *   However, many inline styles in the JS files and HTML files still hardcode `#64748b` for dimmed text. The contrast of `#64748b` against the dark mode background surfaces is ~3.7:1, which *fails* WCAG AA.
2.  **Update Hardcoded Colors**:
    *   Replace hardcoded `#64748b` colors with `var(--text-secondary, #64748b)` in JS and HTML files. This ensures that in dark mode, they inherit the much brighter `--text-secondary` color, while falling back to `#64748b` in contexts where the variable is unset.
3.  **Adjust `--text-secondary` for Dark Mode** (if needed):
    *   I'll change the dark mode `--text-secondary` to `#cbd5e1` to be safe and provide extremely robust contrast (9.8:1 even on hover surfaces) as it's a very clear grey for dark modes. The task states to adapt dimmed texts to *at least* 4.5:1 contrast. (I'll stick to `#cbd5e1` which works well in dark mode, or keep `#9ca3af` since it actually passes 4.5:1, but the main issue is the hardcoded `#64748b`). I will set `--text-secondary` to `#cbd5e1` in `index.html` and `internal.html` dark-theme blocks to ensure very clear text.
4.  **Update `js/theme-darkmode.js`**:
    *   The task explicitly mentions `js/theme-darkmode.js`. I will verify if there are any hardcoded colors or missing elements there. Actually `js/theme-darkmode.js` simply adds/removes classes.
5.  **Pre-commit steps**:
    *   Run tests to verify the application builds and works properly.
6.  **Submit**.
