def hex_to_rgb(hex_str):
    if hex_str.startswith('#'):
        hex_str = hex_str[1:]
    if len(hex_str) == 3:
        hex_str = "".join(c*2 for c in hex_str)
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def luminance(r, g, b):
    a = [v / 255.0 for v in [r, g, b]]
    a = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast(rgb1, rgb2):
    lum1 = luminance(*rgb1)
    lum2 = luminance(*rgb2)
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)

bg = (17, 24, 39)
bg_hover = (31, 41, 55)

for h in ['94a3b8', '8c9db3', '8b9bb4', '9ca3af', 'a3a3a3', '7dd3fc', '94a3b8']:
    c = hex_to_rgb(h)
    print(f"--- {h} ---")
    print(f"on {bg}: {contrast(c, bg)}")
    print(f"on {bg_hover}: {contrast(c, bg_hover)}")
    print()

for g in range(100, 180):
    hex_color = f"{g:02x}{g+16:02x}{g+32:02x}"
    if len(hex_color) == 6:
        c = hex_to_rgb(hex_color)
        r = contrast(c, bg_hover)
        if r >= 4.5:
            print(f"Found base color {hex_color} for >= 4.5 contrast (actual: {r})")
            break

c = hex_to_rgb('64748b')
print("Original 64748b on bg:", contrast(c, bg))
print("Original 64748b on bg hover:", contrast(c, bg_hover))
