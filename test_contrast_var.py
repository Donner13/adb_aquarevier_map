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

print("9ca3af on 0b0f19:", contrast('9ca3af', '0b0f19')) # bg-base
print("9ca3af on 111827:", contrast('9ca3af', '111827')) # bg-surface

# What should it be?
print("d1d5db on 111827:", contrast('d1d5db', '111827')) # > 4.5
print("cbd5e1 on 111827:", contrast('cbd5e1', '111827')) # 11.2

print("d1d5db on 1f293b:", contrast('d1d5db', '1f293b')) # > 4.5
print("d1d5db on 1e293b:", contrast('d1d5db', '1e293b')) # > 4.5
print("d1d5db on 0b0f19:", contrast('d1d5db', '0b0f19')) # > 4.5

print("\ncbd5e1 on 111827:", contrast('cbd5e1', '111827')) # > 4.5
print("cbd5e1 on 1f293b:", contrast('cbd5e1', '1f293b')) # > 4.5
print("cbd5e1 on 1e293b:", contrast('cbd5e1', '1e293b')) # > 4.5
print("cbd5e1 on 0b0f19:", contrast('cbd5e1', '0b0f19')) # > 4.5

# What about hardcoded #64748b?
print("\n64748b on 111827:", contrast('64748b', '111827'))
print("94a3b8 on 111827:", contrast('94a3b8', '111827'))
print("94a3b8 on 1f293b:", contrast('94a3b8', '1f293b'))
print("cbd5e1 on 111827:", contrast('cbd5e1', '111827'))

# Wait, the task says:
# "Pruefe die CSS-Kontrastwerte im Dark Mode (js/theme-darkmode.js und style-Block) und passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."

print("Current --text-secondary in Dark mode is #9ca3af.")
print("Contrast on bg-surface (#111827):", contrast('9ca3af', '111827'))
print("Contrast on bg-base (#0b0f19):", contrast('9ca3af', '0b0f19'))
