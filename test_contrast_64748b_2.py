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

print("Let's check the hardcoded 'var(--text-secondary, #64748b)' elements in dark mode.")
print("If they are using --text-secondary, they are 9ca3af, which is > 4.5")
print("But what about #64748b on dark backgrounds?")
print("#64748b on 0b0f19:", contrast('64748b', '0b0f19'))
print("#64748b on 111827:", contrast('64748b', '111827'))
print("These are < 4.5. So any hardcoded #64748b that does NOT use var(--text-secondary) will fail in dark mode.")
