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

# test what hex we need for background (17, 24, 38)
bg_surface = (17, 24, 39)
bg_base = (11, 15, 25)
print(f"9ca3af on {bg_surface}:", contrast(hex_to_rgb('9ca3af'), bg_surface))
print(f"9ca3af on {bg_base}:", contrast(hex_to_rgb('9ca3af'), bg_base))

print(f"a8b2c1 on {bg_surface}:", contrast(hex_to_rgb('a8b2c1'), bg_surface))
print(f"b0b8c6 on {bg_surface}:", contrast(hex_to_rgb('b0b8c6'), bg_surface))

c2 = hex_to_rgb('64748b')
print(f"64748b on {bg_surface}:", contrast(c2, bg_surface))
