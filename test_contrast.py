def get_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

    def adjust(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = adjust(r), adjust(g), adjust(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(l1, l2):
    bright = max(l1, l2)
    dark = min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)

bg_base = get_luminance('0b0f19')
bg_surf = get_luminance('111827') # Close enough for 0.95 opacity over base
text_sec = get_luminance('9ca3af')

print(f"Base BG L: {bg_base}")
print(f"Surf BG L: {bg_surf}")
print(f"Text Sec L: {text_sec}")

print(f"Contrast Text Sec vs Base BG: {contrast_ratio(text_sec, bg_base)}")
print(f"Contrast Text Sec vs Surf BG: {contrast_ratio(text_sec, bg_surf)}")

# Find a good text_secondary color
for g in range(160, 220):
    hex_c = f"{g:02x}{g:02x}{g:02x}"
    l = get_luminance(hex_c)
    cr_surf = contrast_ratio(l, bg_surf)
    if cr_surf >= 4.5:
        print(f"Found good color: #{hex_c} with contrast {cr_surf}")
        break
