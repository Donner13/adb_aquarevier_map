import re

files = ['index.html', 'internal.html']

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find occurrences of `color: #64748b` and replace with `color: var(--text-secondary, #64748b)`
    # Note: we should avoid changing Leaflet map controls if there are any.
    # The Leaflet popups are usually in JS or string templates.
    # Let's inspect the `color: #64748b` in index.html:
    # 1328: .logo-schoellershammer-sub
    # 1939: .update-radar-close
    # 2383: 2000 ... 2010 year labels
    # 2453: Fluvial (LANUV)
    # 2468: Pluvial (Kommunen)
    # 4280: Fluvial (LANUV) (JS template)
    # 4284: Pluvial (Kommunen) (JS template)

    # Let's carefully regex replace them
    content = re.sub(r'color:\s*#64748b', r'color: var(--text-secondary, #64748b)', content)
    content = re.sub(r'color:\s*#475569', r'color: var(--text-secondary, #475569)', content)

    # And what about color:#64748b without spaces?
    content = re.sub(r'color:#64748b', r'color: var(--text-secondary, #64748b)', content)
    content = re.sub(r'color:#475569', r'color: var(--text-secondary, #475569)', content)

    # Wait, memory says: "dynamically generated Leaflet map controls/legends are explicitly styled for light mode (e.g., white backgrounds with `#1e293b` text) even when the dark theme is active; do NOT replace their hardcoded text colors with CSS variables, as this breaks contrast (e.g., light-gray text on white)."

    with open(filepath, 'w') as f:
        f.write(content)
