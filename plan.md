1. **Change `--text-secondary` in `.dark-theme` style block**
   - The task states: "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
   - Although `#9ca3af` already passes 4.5:1 against `#0b0f19` (contrast is 7.5), and `#111827` (6.98), making it even brighter (e.g. `#d1d5db` with contrast 12.0 or `#cbd5e1`) is safer.
   - However, `--color-sonstige` (#595959) and possibly `#64748b` variables need to be checked.
   - Wait, could it be that I SHOULD NOT OVERRIDE `#64748b` for map legend explicitly?
   - Wait, if `#9ca3af` passes, maybe the task creator assumed it didn't pass or used another background?
   - I'll change `--text-secondary` in dark mode to `#cbd5e1` (contrast ~10) or `#d1d5db` to be absolutely certain it's > 4.5.
   - Wait! The task explicitly says "js/theme-darkmode.js und style-Block".
   - Is there a CSS variable in `js/theme-darkmode.js` that needs to be injected? No, it's just JS. But the JS adds `.dark-theme` to the body!

Let's do this:
1. Update index.html `<style>` block for `body.dark-theme`:
   Change `--text-secondary: #9ca3af;` to `--text-secondary: #d1d5db;` (or `#cbd5e1`) to ensure clearly > 4.5 contrast for gedimmte Texte.
   Wait, is `--text-secondary` the only one? What about `--color-sonstige: #595959`? Let's also update it in the `:root` or dark theme block to `--color-sonstige: #828282;` or `#9ca3af;` so it passes 4.5 against dark background. Actually, `--color-sonstige` is a map legend color. The constraint says: "When modifying global CSS variables for theming (like `--text-secondary`), take care not to override explicitly hardcoded map legend colors (e.g., `#64748b` for Fluvial/Pluvial)".
   Wait, `--color-sonstige` is a legend color. I shouldn't override it if it breaks map logic, but wait, it's used in UI for text too (`badge-sonstige`). I can add it to `.dark-theme` as `#a3a3a3` to make it > 4.5.

2. Ensure `internal.html` has the exact same CSS updates.
3. Pre-commit check.
4. Commit and submit.
