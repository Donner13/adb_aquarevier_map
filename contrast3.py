def luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    def adjust(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def contrast(hex1, hex2):
    lum1 = luminance(hex1)
    lum2 = luminance(hex2)
    bright = max(lum1, lum2)
    dark = min(lum1, lum2)
    return (bright + 0.05) / (dark + 0.05)

bg_surface_hex = '111827' # this is the base of the rgb
bg_base_hex = '0b0f19'

hex_colors = ['6b7280', '9ca3af', 'a1a1aa', 'd1d5db']
for h in hex_colors:
    print(f"{h} on {bg_surface_hex}: {contrast(h, bg_surface_hex)}")
