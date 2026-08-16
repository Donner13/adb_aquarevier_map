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

# It passes 4.5! So why did they ask to change it?
# Let's check #9ca3af against #1e293b (search box background)
print("9ca3af on 1e293b:", contrast('9ca3af', '1e293b'))

# Let's check d1d5db which is lighter
print("d1d5db on 0b0f19:", contrast('d1d5db', '0b0f19'))
print("d1d5db on 111827:", contrast('d1d5db', '111827'))
print("d1d5db on 1e293b:", contrast('d1d5db', '1e293b'))
print("d1d5db on 1f293b:", contrast('d1d5db', '1f293b'))
