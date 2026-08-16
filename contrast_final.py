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

print("9ca3af on 0b0f19:", contrast('9ca3af', '0b0f19'))
print("9ca3af on 111827:", contrast('9ca3af', '111827'))

# Wait, if `9ca3af` passes the 4.5:1 ratio (it is ~7:1 on dark backgrounds), what fails?
# What if the background surface is lighter?
# No, it's 111827.
# Maybe "gedimmte Texte" refers to something else?

# Let's search for "gedimmt" or "muted" or other colors
