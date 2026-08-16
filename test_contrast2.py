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
bg_surf = get_luminance('111827')
text_sec_9ca3af = get_luminance('9ca3af')
text_sec_6b7280 = get_luminance('6b7280')
text_sec_4b5563 = get_luminance('4b5563')

print(f"Base BG L: {bg_base}")
print(f"Surf BG L: {bg_surf}")
print(f"Text Sec (9ca3af) L: {text_sec_9ca3af} Contrast: {contrast_ratio(text_sec_9ca3af, bg_surf)}")
print(f"Text Sec (6b7280) L: {text_sec_6b7280} Contrast: {contrast_ratio(text_sec_6b7280, bg_surf)}")
print(f"Text Sec (4b5563) L: {text_sec_4b5563} Contrast: {contrast_ratio(text_sec_4b5563, bg_surf)}")
