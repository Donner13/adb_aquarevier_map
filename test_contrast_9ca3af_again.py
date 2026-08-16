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

# Okay, what if the background isn't pure #111827.
# Say the background is white, but it's dark mode. (Probably not)
print("9ca3af on 000000:", contrast('9ca3af', '000000'))
print("cbd5e1 on 111827:", contrast('cbd5e1', '111827')) # > 4.5
print("d1d5db on 111827:", contrast('d1d5db', '111827')) # > 4.5
print("9ca3af on 111827:", contrast('9ca3af', '111827')) # 6.98 ( > 4.5 )

# So wait. 9ca3af is already > 4.5. Why did they ask to change it to >= 4.5?
# Let's check 9ca3af on f3f4f6 (which is text-primary, maybe they have 9ca3af on text-primary?)
# No, it's text-secondary.
print("\nIs it possible the task wants me to change 9ca3af to something brighter because of some specific background?")
print("Wait... look at js/theme-darkmode.js... does it have CSS?")
