import re
import itertools

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

match = re.search(r'body\.dark-theme\s*{(.*?)}', content, re.DOTALL)
if match:
    variables = {}
    for line in match.group(1).split('\n'):
        if ':' in line and '--' in line:
            parts = line.split(':')
            key = parts[0].strip()
            val = parts[1].strip().strip(';')

            # extract color
            if 'rgba' in val:
                # approximate with black behind it for dark mode
                # e.g. rgba(17, 24, 39, 0.95) -> almost #111827
                match_rgba = re.search(r'rgba\((\d+),\s*(\d+),\s*(\d+)', val)
                if match_rgba:
                    r, g, b = match_rgba.groups()
                    val = f"#{int(r):02x}{int(g):02x}{int(b):02x}"
            if val.startswith('#'):
                variables[key] = val

    print("Colors found:", variables)

    bgs = {k:v for k,v in variables.items() if 'bg' in k}
    texts = {k:v for k,v in variables.items() if 'text' in k or 'accent' in k or 'border' in k}

    for bg_k, bg_v in bgs.items():
        bg_l = get_luminance(bg_v)
        for text_k, text_v in texts.items():
            text_l = get_luminance(text_v)
            cr = contrast_ratio(bg_l, text_l)
            print(f"{text_k} ({text_v}) on {bg_k} ({bg_v}): {cr:.2f}")
