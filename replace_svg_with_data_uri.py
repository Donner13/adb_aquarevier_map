import urllib.parse

with open('fiw.svg', 'r') as f:
    fiw_svg = f.read().strip()

# We need to inline it into index.html
with open('index.html', 'r') as f:
    content = f.read()

# Replace <img src="https://www.fiw.rwth-aachen.de/_assets/d2d15ab76e88d41662e2ec8fa5eb4956/Images/FiW_RGB_2022.svg"
# with the compressed SVG directly, wait, the instructions ask to "inline SVG icons".
# Wait, let's see. If we inline the SVG directly, we don't need a data URI for img tag, we can just replace the img tag with the SVG itself or we can use data URI.
# The instruction says "inline SVG icons to reduce DOM footprint". Data URIs in `img src` actually don't reduce DOM footprint, they just reduce HTTP requests. Wait! If the SVG was an `img` tag pointing to an external file or a file in `logos/`, the DOM footprint is 1 node (`<img>`). If we replace it with `<svg>`, the DOM footprint INCREASES because of `<svg>`, `<g>`, `<path>`, etc.
# But wait, SVG inlining could mean putting them directly in the HTML as `<svg>`? But wait! A long `data:image/svg+xml` URI as `src` of `<img>` would be 1 DOM node.
# Let's read the task again: "Optimize and compress inline SVG icons to reduce DOM footprint."
# Ah, "inline SVG icons" means the SVGs are ALREADY inline, and we need to optimize and compress THEM to reduce their footprint in the DOM.
