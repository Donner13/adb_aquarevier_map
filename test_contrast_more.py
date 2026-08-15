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
bg2 = (31, 41, 55)

hex_colors = ['a3a3a3', 'a8a29e', '94a3b8', 'cbd5e1', 'a1a1aa']

for hc in hex_colors:
    c = hex_to_rgb(hc)
    print(f"{hc} on {bg}: {contrast(c, bg)}")
    print(f"{hc} on {bg2}: {contrast(c, bg2)}")
