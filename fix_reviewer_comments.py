import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The reviewer points out two things:
    # 1. `#radius-status-info` has a hardcoded background `#f8fafc`.
    # Using `color: var(--text-secondary, #475569)` means in dark mode the text is `#d1d5db` (light gray) on `#f8fafc` (very light gray), which fails contrast.
    # Actually, `#radius-status-info` shouldn't have `var(--text-secondary)` if its background is strictly `#f8fafc` in BOTH modes!
    # Wait, does the background change in Dark Mode? It is `background: #f8fafc;`. So it stays light!
    # Therefore, we should revert it to `color: #475569`.

    content = content.replace(
        '<div id="radius-status-info" style="font-size: 10.5px; color: var(--text-secondary, #475569); background: #f8fafc;',
        '<div id="radius-status-info" style="font-size: 10.5px; color: #475569; background: #f8fafc;'
    )

    # 2. `body.light-theme .update-radar-close` only applies to light theme.
    # Modifying it to `var(--text-secondary, #64748b)` is unnecessary for dark mode contrast, as it's specifically for `.light-theme`.
    # So we should revert it back to `#64748b`.
    # Let's search for `body.light-theme .update-radar-close { color: var(--text-secondary, #64748b); }`

    # Using regex to target `.update-radar-close` safely
    content = re.sub(
        r'(body\.light-theme \.update-radar-close\s*\{\s*\n\s*)color:\s*var\(--text-secondary,\s*#64748b\);',
        r'\1color: #64748b;',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

process_file('index.html')
process_file('internal.html')
