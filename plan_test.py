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

# Wait. There's #9ca3af (text-secondary).
# On bg-surface (111827), it is 6.98.
# On bg-surface-hover (1f293b), it is 5.75.
# Neither fails 4.5:1.
# BUT what if they are used on #334155 (slate-700) or similar?
# Maybe they consider #9ca3af too low contrast when used on #1e293b by a stricter standard (AAA is 7:1) ?
# The task says "auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
# What actually fails 4.5:1 is #64748b, #6b7280 and #475569.
# Look at `--text-secondary` in dark mode:
# It's currently #9ca3af. If we change it to #d1d5db, it will comfortably pass AAA.

print("#9ca3af on #475569:", contrast('9ca3af', '475569')) # 2.6
