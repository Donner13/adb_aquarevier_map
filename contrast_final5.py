def luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = "".join(c+c for c in hex_color)
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

# Okay, what if --text-secondary is used on --bg-surface-hover?
# --bg-surface-hover is rgba(31, 41, 55, 0.95)
# Wait! I calculated --bg-surface-hover earlier!
print(contrast('9ca3af', '1f2937')) # 5.78 > 4.5.

print("Is there a lighter grey in tailwind?")
print("Gray 300: #d1d5db")
print("Gray 400: #9ca3af")
print("If the task asks to adjust 'gedimmte Texte' (which is --text-secondary) to MINIMUM 4.5:1 ... maybe my contrast formula is slightly off, or they measured it differently?")
print("Wait... what if --text-secondary (#9ca3af) is used somewhere with a LIGHTER background in dark mode?")
print("Let's just change `--text-secondary` to `#d1d5db` (Gray 300) in dark mode to be absolutely safe.")
