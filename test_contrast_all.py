import re

def get_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    def adjust(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = adjust(r), adjust(g), adjust(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(l1, l2):
    bright = max(l1, l2)
    dark = min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)

with open('index.html', 'r') as f:
    content = f.read()

# Extract dark theme block
match = re.search(r'body\.dark-theme\s*{(.*?)}', content, re.DOTALL)
if match:
    block = match.group(1)
    variables = {}
    for line in block.split('\n'):
        if ':' in line and '--' in line:
            parts = line.split(':')
            key = parts[0].strip()
            val = parts[1].strip().strip(';')
            variables[key] = val

    print("Variables found:", variables)

    # Calculate contrast for all text colors against bg-base and bg-surface
    def hex_from_rgba_approx(val):
        # Very rough approximation, we'll just check hexes for now
        if val.startswith('#'):
            return val
        return None

    bg_base_hex = hex_from_rgba_approx(variables.get('--bg-base'))
    bg_surface_hex = hex_from_rgba_approx(variables.get('--bg-surface'))
    # --bg-surface is rgba(17, 24, 39, 0.95), let's use the solid color for worst case
    bg_surface_hex = '#111827'

    bg_base_l = get_luminance(bg_base_hex) if bg_base_hex else 0
    bg_surface_l = get_luminance(bg_surface_hex) if bg_surface_hex else 0

    print(f"Base BG L: {bg_base_l}, Surface BG L: {bg_surface_l}")

    for k, v in variables.items():
        if 'text' in k or 'accent' in k:
            if v.startswith('#'):
                l = get_luminance(v)
                print(f"{k} ({v}): L={l:.4f}")
                print(f"  vs Base BG: {contrast_ratio(l, bg_base_l):.2f}")
                print(f"  vs Surface BG: {contrast_ratio(l, bg_surface_l):.2f}")
