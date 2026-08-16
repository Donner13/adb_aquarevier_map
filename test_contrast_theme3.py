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

print("bg-surface:", contrast('9ca3af', '111827')) # rgba(17, 24, 39, 0.95) roughly #111827
print("bg-surface-hover:", contrast('9ca3af', '1f293b')) # rgba(31, 41, 55, 0.95) roughly #1f293b
print("accent-primary:", contrast('9ca3af', '6366f1')) # #6366f1
