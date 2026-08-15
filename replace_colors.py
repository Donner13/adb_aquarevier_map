import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern to match #64748b but not preceded by var(--text-secondary,
    # A simple regex won't work well due to optional spaces, so let's do a positive replacement on all #64748b,
    # but first replace existing var(--text-secondary, #64748b) with a placeholder

    content = content.replace("var(--text-secondary, #64748b)", "%%TEXT_SECONDARY_PLACEHOLDER%%")
    content = content.replace("var(--text-secondary,#64748b)", "%%TEXT_SECONDARY_PLACEHOLDER%%")

    content = content.replace("#64748b", "var(--text-secondary, #64748b)")

    content = content.replace("%%TEXT_SECONDARY_PLACEHOLDER%%", "var(--text-secondary, #64748b)")

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('.'):
    if root.startswith('./.git'): continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js') or file.endswith('.css'):
            if root == '.' or root.startswith('./js') or root.startswith('./css'):
                filepath = os.path.join(root, file)
                process_file(filepath)
