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

# wait. what if they don't mean `#9ca3af` ?
# "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
# What is "gedimmte Texte" in German CSS terminology?
# It means "dimmed texts". Usually `--text-secondary` or `.text-muted` or similar.
# In the `style` block, I see:
# --text-secondary: #9ca3af;
# Let's change it to #d1d5db which passes 12:1 to be safe.

# Are there any other text colors in dark mode style block?
# Let's check the dark mode CSS again.
