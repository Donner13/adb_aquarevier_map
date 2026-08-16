import re

with open('js/layers-loader.js', 'r') as f:
    content = f.read()

# Replace getZustaendigkeitHtml(p) with the one handling undefined correctly just in case, but let's check what was rejected.
# Ah, the review said: "The patch correctly attempts to apply escapeHtml() to the popup title and the zustaendigkeit_* properties. However, it appears to miss escaping properties rendered inside the cfg.popupFields loop (which immediately follows the title block), meaning XSS vulnerabilities likely still exist for those dynamically rendered fields."
# Wait, inside the `cfg.popupFields` loop, it does this:
#
#       let safeVal;
#       if (field.expr) {
#         const exprVal = field.expr(p);
#         if (!exprVal) continue;
#         safeVal = escapeHtml(exprVal);
#       } else {
#         const val = safeP[field.field];
#         if (!val) continue;
#         safeVal = val; // Already escaped via safeP
#       }
#
# Wait, what if field.field refers to a nested property? `safeP[field.field]` will be `undefined` if `field.field` is like `Stammdaten.name`.
# Or maybe the reviewer noticed something else?
