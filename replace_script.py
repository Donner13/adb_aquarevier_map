import re

def process(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace `color: #64748b` -> `color: var(--text-secondary, #64748b)`
    # EXCEPT in the legend which has `<div style="font-weight:700; margin-bottom:4px; font-size:12.5px;">Gefahrenkarten</div>`

    # Let's split by lines to be safer
    lines = content.split('\n')
    out_lines = []

    in_legend = False
    for line in lines:
        if 'Gefahrenkarten' in line and 'font-weight:700' in line:
            in_legend = True

        if in_legend and '</div>' in line and 'Starkregen' in line:
            in_legend = False # Actually the legend ends a bit later, let's just count 15 lines max or stop at `return div;`

        if 'return div;' in line and in_legend:
            in_legend = False

        if not in_legend:
            # For 64748b
            if 'color: #64748b' in line:
                line = line.replace('color: #64748b', 'color: var(--text-secondary, #64748b)')
            if 'color:#64748b' in line:
                line = line.replace('color:#64748b', 'color: var(--text-secondary, #64748b)')

            # For 475569
            if 'color: #475569' in line:
                line = line.replace('color: #475569', 'color: var(--text-secondary, #475569)')
            if 'color:#475569' in line:
                line = line.replace('color:#475569', 'color: var(--text-secondary, #475569)')

            # For background-color
            if 'background-color: #475569' in line:
                # Wait, memory says: "Any dimmed text or category colors in Dark Mode must maintain a minimum WCAG AA contrast ratio of 4.5:1 against dark backgrounds."
                # Does `var(--text-secondary)` apply to background-colors of badges?
                # .feedback-badge.abgelehnt { background-color: #f1f5f9; color: #475569; }
                pass

        out_lines.append(line)

    with open(filepath, 'w') as f:
        f.write('\n'.join(out_lines))

process('index.html')
process('internal.html')
