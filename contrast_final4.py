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

# 314155 is the hex for rgb(49, 65, 85) -- no wait, 31 in hex is 49.
# rgba(31, 41, 55, 0.95) -> rgb(31, 41, 55). Hex for that is 1f2937
print(hex(31), hex(41), hex(55))
# 1f, 29, 37

# So bg-surface-hover is #1f2937 (with 95% opacity on top of #0b0f19, roughly #1e2835)
print("contrast 9ca3af on 1e2835:", contrast('9ca3af', '1e2835')) # 5.86

# Okay, what DOES fail?
# There are hardcoded `color: var(--text-secondary, #64748b)` inline styles!
print("64748b on 0b0f19:", contrast('64748b', '0b0f19')) # 4.02 (FAIL)
print("64748b on 111827:", contrast('64748b', '111827')) # 3.73 (FAIL)

# Is that it? Does "gedimmte Texte" refer to --text-secondary itself?
# "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
# Maybe #9ca3af DOES fail on something.
print("9ca3af on 374151:", contrast('9ca3af', '374151')) # 3.2

# Look at style block again.
