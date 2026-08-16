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

print("Look at #475569 on white")
print(contrast('475569', 'ffffff'))

# So #475569 on white is 6.8:1, very good.
# But what happens to #475569 in dark mode?
# There are hardcoded uses of #475569!
print("#475569 on #111827 (dark mode bg):", contrast('475569', '111827')) # 2.3:1 - FAILS WCAG AA
print("#64748b on #111827 (dark mode bg):", contrast('64748b', '111827')) # 3.7:1 - FAILS WCAG AA

# So the task: "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
# Maybe we need to change `--text-secondary` to something lighter like `#d1d5db`?
print("#d1d5db on #111827:", contrast('d1d5db', '111827')) # 12:1
print("#cbd5e1 on #111827:", contrast('cbd5e1', '111827')) # 11.9:1
print("#9ca3af on #111827:", contrast('9ca3af', '111827')) # 6.9:1

# Wait, 9ca3af on 111827 is 6.9, which is >= 4.5.
# Is it 9ca3af on bg-base (0b0f19)? It's 7.5.

print("\nWhat about 9ca3af on other backgrounds?")
print("search box background (1e293b):", contrast('9ca3af', '1e293b')) # 5.7
print("bg-surface-hover (1f293b):", contrast('9ca3af', '1f293b')) # 5.7

# Hmm. Does 9ca3af fail on ANY dark background?
print("accent-primary (6366f1):", contrast('9ca3af', '6366f1')) # 1.7 (Fail, but is text-secondary used on accent-primary? Unlikely)

print("What if the task means that 9ca3af is not light enough, and they want it even brighter? Or maybe they mean the hardcoded colors?")
