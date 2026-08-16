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

print("Look at #9ca3af again.")
# I need to check where #9ca3af might fail. What if we change --text-secondary to #d1d5db ?
# "passe gedimmte Texte auf mindestens 4.5:1 Kontrast gemaess WCAG AA an."
# Maybe --text-secondary is currently #9ca3af, which is > 4.5 on bg-surface and bg-base.
# WAIT.
# Does 9ca3af fail on `#1e293b` (bg-surface-hover/search box)? No, it's 5.76.
# Does 9ca3af fail on `#314155`? (rgba(31, 41, 55, 0.95))
print("9ca3af on 314155 (this is rgba(31, 41, 55) roughly without opacity):")
print(contrast('9ca3af', '314155'))
# wait. rgba(31, 41, 55) has luminance:
r, g, b = 31/255, 41/255, 55/255
print("contrast 9ca3af on 1f2937:", contrast('9ca3af', '1f2937'))
