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

print("d1d5db on 0b0f19:", contrast('d1d5db', '0b0f19'))
print("d1d5db on 111827:", contrast('d1d5db', '111827'))

# Okay, what about #475569?
print("#475569 on #111827:", contrast('475569', '111827'))
print("#475569 on #0b0f19:", contrast('475569', '0b0f19'))

# What if we change var(--text-secondary) to d1d5db or cbd5e1?
print("#cbd5e1 on #111827:", contrast('cbd5e1', '111827'))
print("#cbd5e1 on #0b0f19:", contrast('cbd5e1', '0b0f19'))
