import re

with open('js/layers-loader.js', 'r') as f:
    content = f.read()

# "However, it appears to miss escaping properties rendered inside the cfg.popupFields loop (which immediately follows the title block), meaning XSS vulnerabilities likely still exist for those dynamically rendered fields."
# Why? Look at field.expr:
#   if (field.expr) {
#     const exprVal = field.expr(p);
#     if (!exprVal) continue;
#     safeVal = escapeHtml(exprVal);
#   }
#
# Wait, if `exprVal` is an HTML string like `<a href="...">...</a>`, escaping it will break the HTML!
# But actually, the reviewer says "meaning XSS vulnerabilities likely still exist for those dynamically rendered fields."
# Let's see what happens to `safeP[field.field]`. It's escaped when `safeP` is built, BUT only if it is a string!
# What if it's a number? It's not escaped. What if a number is converted to a string and it contains something? Wait, a number can't contain XSS.
# But what if `safeVal` is not escaped later?
# In `buildPopupHtml`:
#       if (field.label === '📍') {
#         html += `<div class="popup-detail">📍 ${safeVal}</div>`;
#       } else {
#         html += `<div class="popup-detail">${escapeHtml(tLabel(field.label))}${glossarSpan(field.glossar)}: ${safeVal}${escapeHtml(field.suffix || '')}</div>`;
#       }
# Note that `safeVal` is inserted directly!
# The problem is that if `field.expr` returns `<a href="${p.ebird_url}">...</a>` and `safeVal` escapes it, it breaks the link. Oh wait, `safeVal = escapeHtml(exprVal);` escapes the HTML. If the author intended `exprVal` to be HTML, `escapeHtml` breaks it! Wait, no, the reviewer explicitly complained that I MISSED escaping properties inside `cfg.popupFields` loop!
# Wait, if `exprVal` returns HTML, how to sanitize it without breaking? But `escapeHtml` escapes `<` and `>`.
#
# Let's re-read the review: "However, it appears to miss escaping properties rendered inside the cfg.popupFields loop (which immediately follows the title block), meaning XSS vulnerabilities likely still exist for those dynamically rendered fields."
#
# Let's look at `safeP`:
#     const safeP = { ...p };
#     for (const key in safeP) {
#       if (typeof safeP[key] === 'string') {
#         safeP[key] = escapeHtml(safeP[key]);
#       } else if (Array.isArray(safeP[key])) {
#         // Prevent array bypasses that stringify into XSS payloads during interpolation
#         safeP[key] = safeP[key].map(item => typeof item === 'string' ? escapeHtml(item) : item);
#       }
#     }
# Wait! What if a dynamic field refers to a nested property? `safeP[field.field]` wouldn't work, but actually `layer-config.js` only uses top-level fields for `field.field` (like `betreiber`, `eigentuemer`, etc).
# What about other properties in `buildPopupHtml` ?
#
#   // Special: Pegel NQ/MQ/HQ row
#   if (cfg.pegelStats && safeP.mq_m3s) {
#     html += `<div class="popup-detail">📊 NQ<span class="glossar-icon" data-glossar="NQ">i</span>: ${safeP.nq_m3s || '–'}, MNQ<span class="glossar-icon" data-glossar="MNQ">i</span>: ${safeP.mnq_m3s || '–'}, MQ<span class="glossar-icon" data-glossar="MQ">i</span>: ${safeP.mq_m3s}, HQ<span class="glossar-icon" data-glossar="HQ">i</span>: ${safeP.hq_m3s || '–'} m³/s</div>`;
# Wait! `safeP.nq_m3s`, `safeP.mnq_m3s`, `safeP.mq_m3s`, `safeP.hq_m3s` could be numbers. If they are numbers, they were NOT escaped in `safeP`! Wait, numbers don't need escaping.
# BUT wait! If they are strings and they are escaped, then `safeP.nq_m3s` will be escaped.
# What if they are arrays? They are mapped.
#
# What if the user explicitly wants me to sanitize inside the loop?
# In `layers-loader.js` (line 175):
#       } else {
#         const val = safeP[field.field];
#         if (!val) continue;
#         safeVal = val; // Already escaped via safeP
#       }
# Wait, if `safeP[field.field]` was NOT a string (e.g. a number or boolean), it was not escaped. If `val` is an array, it was mapped and its strings were escaped. If `val` is an object, it was NOT escaped! If `val` is an object, interpolating it as `${safeVal}` will yield `[object Object]`, not XSS.
#
# Wait, what if `val = p[field.field]`? The code uses `safeP[field.field]`.
# Is it possible that the reviewer thinks I should escape `val` again here?
# Let's re-read carefully:
# "The patch correctly attempts to apply escapeHtml() to the popup title and the zustaendigkeit_* properties. However, it appears to miss escaping properties rendered inside the cfg.popupFields loop (which immediately follows the title block), meaning XSS vulnerabilities likely still exist for those dynamically rendered fields."
#
# What if the reviewer is referring to this code in `buildPopupHtml`:
#   if (field.expr) {
#     const exprVal = field.expr(p);
#     if (!exprVal) continue;
#     safeVal = escapeHtml(exprVal);
#   }
# Wait! This is already in the code! I didn't change this in my last patch, it was already there.
# If `escapeHtml(exprVal)` is already there, what is missing in the loop?
# Wait!
#       // first field (📍) has no label prefix, just the value
#       if (field.label === '📍') {
#         html += `<div class="popup-detail">📍 ${safeVal}</div>`;
#       } else {
#         html += `<div class="popup-detail">${escapeHtml(tLabel(field.label))}${glossarSpan(field.glossar)}: ${safeVal}${escapeHtml(field.suffix || '')}</div>`;
#       }
# If `safeVal` is already escaped, then it is fine.
# But wait! I replaced the code using `update_js.py` and `update_js2.py` previously. Let me check if I removed something accidentally or didn't notice a field.
