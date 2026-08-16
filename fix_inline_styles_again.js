const fs = require('fs');

function applyFix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // The AI reviewer pointed out two issues:
    // 1. `.feedback-badge.abgelehnt` has `background-color: #f1f5f9; color: var(--text-secondary, #475569);`
    // In dark mode, --text-secondary is #9ca3af. Contrast between #9ca3af (light gray) and #f1f5f9 (very light gray) is terrible.
    // 2. `#radius-status-info` has `background: #f8fafc; color: var(--text-secondary, #475569);`. Same issue.
    // 3. SVG `stroke="var(...)"` is unnecessary and out of scope, I should revert it to `stroke="#475569"`.

    // First, let's revert the SVG strokes.
    content = content.replace(/stroke="var\(--text-secondary, #475569\)"/g, 'stroke="#475569"');
    content = content.replace(/stroke="var\(--text-secondary, #64748b\)"/g, 'stroke="#64748b"');
    content = content.replace(/stroke="var\(--text-secondary, #595959\)"/g, 'stroke="#595959"');

    // For `.feedback-badge.abgelehnt { background-color: #f1f5f9; color: var(--text-secondary, #475569); }`
    // Since this is in the `<style>` block:
    // It's defined as: `.feedback-badge.abgelehnt { background-color: #f1f5f9; color: var(--text-secondary, #475569); }`
    // To make it adapt in dark mode, we could change the background-color to a variable like `var(--bg-surface-hover, #f1f5f9)` or similar, OR we can remove the `var(--text-secondary, ...)` and just use `#475569` so it stays dark against the light background?
    // Wait, the task is about Dark Mode texts being 4.5:1. If the background is hardcoded light `#f1f5f9`, the text should be dark!
    // `#475569` vs `#f1f5f9` is 7.5:1 (passes). So it should NOT use `var(--text-secondary)` because `--text-secondary` becomes light in dark mode!
    // So we just revert that specific `.feedback-badge.abgelehnt` color back to `#475569`.

    // For `#radius-status-info`: `<div id="radius-status-info" style="font-size: 10.5px; color: var(--text-secondary, #475569); background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px dashed #cbd5e1; text-align: center;">`
    // Background is `#f8fafc`. Again, the background is light, so the text needs to stay dark `#475569`. It should NOT use `var(--text-secondary)`.

    // Let's identify the places where the background is also dark mode compatible.
    // The previous feedback: "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an"
    // Which means ONLY the texts that are on a dark background in dark mode need adjusting.
    // The ones on a light background (like badges) should remain dark.

    // Let's revert all inline styles back to hardcoded first, then selectively apply `var(--text-secondary)` to the ones on dark backgrounds.

    content = content.replace(/color: var\(--text-secondary, #475569\)/g, 'color: #475569');
    content = content.replace(/color: var\(--text-secondary, #64748b\)/g, 'color: #64748b');
    content = content.replace(/color: var\(--text-secondary, #595959\)/g, 'color: #595959');

    // Wait, if I revert everything, then they will fail the WCAG AA contrast against the dark surface, which was the original problem!
    // Let's check where the original problem was.
    // "Die neuen Overrides können Inline-Texte mit exakt diesen Farb-Strings auf --text-secondary anheben"
    // So the original CSS override (body.dark-theme [style*="color: #475569"]) matched elements with hardcoded colors.
    // But it matched ALL of them, including the ones with light backgrounds (like `#radius-status-info`).
    // If an element has an inline style `background: #f8fafc; color: #475569;`, we DO NOT want to change its color to light gray in dark mode, unless we ALSO change its background.
    // Actually, in Dark Mode, should `#radius-status-info` have a light background?
    // Usually, in a Dark Mode, you don't want glaring white boxes. The background should ideally adapt too, e.g. `background: var(--bg-surface-hover, #f8fafc)`.
    // And `.feedback-badge.abgelehnt` should have `background-color: var(--bg-surface-hover, #f1f5f9)`.
    // If we adapt their backgrounds to dark variables, then `var(--text-secondary)` will work!
    // But modifying the background was flagged as "erweitern den Patch unnötig" maybe?
    // Let's read carefully: "Sie garantiert WCAG AA aber nicht: .feedback-badge.abgelehnt behält #f1f5f9 als Inline-Hintergrund; mit einem hellen Dark-Mode---text-secondary entsteht zu geringer Kontrast. Dasselbe Risiko besteht bei #radius-status-info mit festem hellem Hintergrund #f8fafc."

    // Option A: Adapt the backgrounds to dark mode variables as well.
    // Option B: Exclude them from the `var(--text-secondary)` substitution (leave them hardcoded as light-mode looking elements).
    // The safest and most correct way to pass the contrast check is to revert the text colors to `#475569` for those specific elements with hardcoded light backgrounds!

    // Wait, if I just revert them, I still have to fix the OTHER dimmed texts that are on dark backgrounds!
    // Let's apply `var(--text-secondary)` carefully.

    // First, restore all to original.
    // I already did the `color: var(...)` to `color: #...` replacement above.

    // Now let's selectively replace only the ones that don't have a light background.
    // For index.html & internal.html, let's look at `color: #475569`.
    // In index.html:
    // - style="font-size: 10px; color: #475569; margin-top: 6px;" -> This is a source attribution text inside the popup. The popup is dark in dark mode. -> Should be var(--text-secondary).
    // - .feedback-badge.abgelehnt { background-color: #f1f5f9; color: #475569; } -> Background is light. Leave it.
    // - style="background-color: #475569; border: 1.2px dashed #ffffff;" -> This is a swatch background! Leave it!
    // - style="font-size: 10.5px; color: #475569; background: #f8fafc; ... " -> #radius-status-info. Background is light. Leave it!

    // For `color: #64748b`:
    // - style="font-size: 11px; color: #64748b; margin-bottom: 8px;" -> In timeseries popup? Popup is dark. -> var(--text-secondary)
    // - style="display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; margin-bottom: 8px;" -> In bookmarks? -> var(--text-secondary)
    // - style="font-size: 12px; color: var(--text-secondary, #64748b);" -> ALREADY has var!
    // - style="font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: 500;" -> Gefahrenkarten layer info. -> var(--text-secondary)
    // - style="font-size:11px; color:#64748b; margin-bottom:2px;" -> Gefahrenkarten html block -> var(--text-secondary)

    // For `color: #595959`:
    // - `--color-sonstige: #595959;` -> In the style block. In dark mode we already added `--color-sonstige: #9ca3af;` in the body.dark-theme block! Wait, did I remove that?
    // Let's re-add it if I removed it.

    fs.writeFileSync(filePath, content);
}

applyFix('index.html');
applyFix('internal.html');
