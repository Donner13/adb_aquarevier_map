# AquaRevier CSS Specificity Audit Report

This report summarizes the findings of the CSS specificity and architecture audit for the AquaRevier project. The overarching goal is to identify points of high specificity, overriding base styles, leaking generic classes, and missing or overlapping media query boundaries.

## 1. `!important` Usage (Specificity Wars)
The audit revealed a substantial overuse of `!important` tags (78 instances in `index.html`, 71 in `internal.html`), particularly concentrated in dynamic components and overrides:

- **Theme Modifiers:** Classes like `.light-theme` and `.dark-theme` rely heavily on `!important` to force overrides across standard DOM components and customized widgets (e.g., `body.light-theme .logo-box { background: #ffffff !important; border: 2px solid #1e293b !important; }`).
- **Leaflet UI:** Specific Leaflet components (`.leaflet-popup-content-wrapper`, `.leaflet-popup-tip`, `.leaflet-control-layers`) are aggressively overridden using `!important` tags to impose theme consistency.
- **Dynamic Elements:** The `.logo-box` and `.logo-box:hover` selectors use `!important` for almost every property, overriding any parent rules and making the UI rigid against future adjustments.

**Resolution Strategy:**
- Refactor the styling strategy for the `.light-theme` and `.dark-theme` components by using CSS Custom Properties (CSS variables) for backgrounds, borders, and shadows at the `:root` and `body` levels.
- Remove `!important` from Leaflet UI overrides by appropriately scoping the selectors and loading the custom stylesheet *after* `leaflet.css`.
- Remove `!important` from `.logo-box` hover states and rely on natural cascading priority.

## 2. Overridden Base Styles & Specificity Wars
There are notable specificity chains that compete with base functionality:

- **Inputs and Buttons Focus:** Multiple specific focus properties are set, such as `#search-input:focus`, `.search-box input:focus`, and `.usearch-box input:focus`, overriding native behaviors using custom `outline: 2px solid var(--accent-primary)`.
- **Accessibility vs. Styling:** Focus styles are forcefully overridden using `.high-contrast button:focus-visible` and `.high-contrast input:focus-visible` with `outline: 4px solid #ff5f00;`. This indicates a structured, but highly specific conflict with standard component selectors.
- **Button Hover States:** Broad and scoped buttons have conflicting hover transitions (`.filter-btn:hover`, `.filter-btn.inactive`, `.usearch-item:hover`).

**Resolution Strategy:**
- Consolidate input and button styles under `.form-input` and `.btn` parent classes to ensure a unified configuration rather than repeating specific ID (`#search-input`) overrides.
- Structure focus-visible states cleanly to rely on CSS variables instead of explicit hex overrides.

## 3. Global CSS Affecting Leaflet/Map Components
There are many explicit Leaflet global overrides within `index.html` and `internal.html`:

- Selectors like `body.light-theme .leaflet-popup-content-wrapper`, `body.presentation-mode .leaflet-popup-content`, and `.leaflet-marker-icon:focus-visible` are deeply chained to modify the standard Leaflet map behavior.
- The `.leaflet-tile-pane` is modified globally to desaturate map layers via `filter: saturate(0.35) brightness(1.03) contrast(1.02);`.

**Resolution Strategy:**
- Avoid chaining `body.light-theme` directly with `.leaflet-*` elements inside inline `<style>` tags. Move custom Leaflet theming to `styles.css` using custom properties.

## 4. Media Query Overlaps and Missing Breakpoints
The media queries implement distinct logic flows:

- `max-width: 768px` for general mobile layout shifts and sidebar toggles.
- `max-width: 640px` targeting specific `.usearch-box` adjustments.
- `max-width: 480px` for `.leaflet-popup-content-wrapper` and `.info-legend` shrinking.

**Resolution Strategy:**
- The current implementation is generally stable and avoids overlap conflicts. However, consolidating these breakpoints into organized breakpoint variables (if migrating to SCSS/SASS) or placing them at the bottom of a unified stylesheet would improve maintainability.

## 5. CSS-in-JS and Scoped Styles Leaking Globally
A primary concern is the massive dependency on inline styles applied through JavaScript string templates:

- Within `js/app-enhancements.js`, `js/ai-assistant.js`, `js/universal-search.js`, and `js/gemeinde-steckbrief.js`, DOM elements are continuously generated with extensive `style="..."` attributes (e.g., `style="background: #ffffff; width: 100%; max-width: 620px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;"`).
- Hardcoded inline styles prevent external stylesheets from overriding component behavior without using `!important`, feeding back into the "specificity arms race."

**Resolution Strategy:**
- Extract all component styles out of JS string templates into distinct CSS classes (e.g., `.dossier-card`, `.ai-msg-typing`).
- Ensure JS only assigns these predefined classes using `classList.add()`, keeping logic and presentation separated.

## 6. Class Name Collisions
The project uses generic component names:

- `.active` is heavily reused across unrelated components (`#kreisScorecardModal.active`, `.usearch-item.active`, `.filter-btn.active`, `.scorecard-table tr.active-row`).
- `.hidden` is used specifically for `#pegel-analysis-panel.hidden`.
- Bootstrap-like component styles like `.btn` and `.btn-primary` are mixed loosely across the HTML, potentially risking collisions.

**Resolution Strategy:**
- Rename generic classes using a component-scoped naming convention like BEM (e.g., `.filter-btn--active`, `.usearch-item--active`).
- Refrain from using `.btn` unless Bootstrap is fully supported; stick to project-specific namespaces (e.g., `.aq-btn`).

## 7. Specificity of Marker/Callout Styles
- `.logo-callout-marker` and `.logo-box` use rigid absolute positioning intertwined with aggressive `!important` flags (`background: #ffffff !important; border: 2px solid #1e293b !important;`).
- Hover states (`.logo-box:hover`) utilize `transform: scale(1.08) !important` to ensure precedence over standard rendering.

**Resolution Strategy:**
- Remove the `!important` tags from `.logo-box`. If overriding base Leaflet icons, define a specific `divIcon` class in Leaflet and target it with standard specific selectors without `!important`.

## 8. Animation Property Conflicts (transition, transform, opacity)
Animations are effectively managed:

- Transforms apply to `.logo-box:hover` and `.website-btn:hover` alongside `transition` delays.
- Opacity animations are structured with dedicated keyframes (`@keyframes wsg-pulse`, `@keyframes modalFadeIn`).
- No significant overlapping conflicts exist in animations, although `.logo-box` relies on `!important` to enforce the transform.

**Resolution Strategy:**
- Maintain current `@keyframes` but decouple `!important` from dynamic `:hover` effects to allow responsive CSS scaling naturally.


COMPLETED: Audited `!important` declarations, overridden base styles, global Leaflet modifiers, media query logic, CSS-in-JS inline styles, specific `.logo-box` and `.logo-callout` overrides, class name collisions (`.active`), and animation property definitions across `css/styles.css`, `index.html`, and `internal.html`. Found a massive overreliance on inline `style="..."` attributes and `!important` overriding in UI themes (`.light-theme` / `.dark-theme`) and Leaflet scope chains (`body.light-theme .leaflet-popup-content-wrapper`). The report formats these exact points as requested without altering any source files.
TESTS: 0 passed / 0 failed (No code execution changes introduced, task explicitly restricted to auditing)
RISKS: Continuing the current CSS-in-JS mixed with `!important` overrides will make further responsive or theme-related UI additions extremely brittle. A full refactoring pass is recommended as the next slice of work.
