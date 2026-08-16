1. Use `update_script.py` to replace `#64748b` and `#475569` text colors with `var(--text-secondary, #64748b)` and `var(--text-secondary, #475569)` respectively.
2. But wait, I must check memory: "dynamically generated Leaflet map controls/legends are explicitly styled for light mode ... do NOT replace their hardcoded text colors with CSS variables".
   - The map legends might be `.leaflet-control-layers` or `.leaflet-popup-content`. Let's check where the replacements happened.
3. In `index.html`, lines `4280: Fluvial (LANUV)` and `4284: Pluvial (Kommunen)` are inside a dynamically generated Leaflet control (`L.control({ position: 'bottomright' })`). These are map legends! So I should NOT replace `#64748b` with `var(--text-secondary)` there.
   Let's check lines 3885-4029. Those are SVG `<line stroke="#475569">`. Memory says: "Custom CSS properties (like `var(--text-secondary)`) are not evaluated inside SVG strings encoded as data URIs. Hardcoded hex colors (e.g., `#475569`) must be retained or used in these instances to ensure they render properly."
4. So I should write a more precise replacement script that:
   - Replaces `color: #64748b` with `color: var(--text-secondary, #64748b)` EXCLUDING the map legend (`Gefahrenkarten` control block).
   - Replaces `color: #475569` with `color: var(--text-secondary, #475569)` EXCLUDING the SVG data URIs (`stroke="#475569"` isn't `color:`, so my previous regex `color:\s*#475569` was fine for avoiding SVGs!).
5. Wait! The memory also says: "Dark mode CSS variables (e.g., `--bg-base`, `--text-secondary`) are defined within `<style>` blocks in `index.html` and `internal.html` under the `body.dark-theme` selector, rather than in external CSS files."
6. And wait, the initial `contrast.js` script showed that `--text-secondary` is `#d1d5db`, which has 12:1 contrast against `#0b0f19` (dark mode bg-base). BUT `#64748b` is 4.02:1, which is < 4.5. So any `color: #64748b` and `color: #475569` (which is even darker) must be replaced with `var(--text-secondary, ...)` to ensure contrast.
7. Let's make sure I find ALL occurrences correctly. I will write a script to replace only the valid ones.
