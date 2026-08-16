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

print("Let's look closely at 9ca3af on the different dark mode backgrounds")
print("bg-base: #0b0f19 -> contrast:", contrast('9ca3af', '0b0f19'))
# rgba(17, 24, 39, 0.95) on top of bg-base (#0b0f19)
# r = 17*0.95 + 11*0.05 = 16.15 + 0.55 = 16.7
# g = 24*0.95 + 15*0.05 = 22.8 + 0.75 = 23.55
# b = 39*0.95 + 25*0.05 = 37.05 + 1.25 = 38.3
# hex approx #111826
print("bg-surface approx #111826 -> contrast:", contrast('9ca3af', '111826'))
# rgba(31, 41, 55, 0.95) on top of bg-base
# r = 31*0.95 + 11*0.05 = 29.45 + 0.55 = 30
# g = 41*0.95 + 15*0.05 = 38.95 + 0.75 = 39.7
# b = 55*0.95 + 25*0.05 = 52.25 + 1.25 = 53.5
# hex approx #1E2835
print("bg-surface-hover approx #1E2835 -> contrast:", contrast('9ca3af', '1E2835'))

print("\nWhat about other text colors in dark mode?")
print("border-color: rgba(255, 255, 255, 0.12)")

print("\nAre there any other gray text colors?")
print("Like #64748b ?")
print("#64748b on #111826 -> contrast:", contrast('64748b', '111826'))
print("#64748b on #0b0f19 -> contrast:", contrast('64748b', '0b0f19'))

print("Current text-secondary is 9ca3af. Let's see if 9ca3af passes everywhere.")
print("Wait, 9ca3af on bg-surface-hover is 5.86, which is > 4.5.")
print("So 9ca3af already passes 4.5:1.")
print("Wait, did I miss something? Is there another gray?")
