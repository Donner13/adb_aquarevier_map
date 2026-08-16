with open('index.html', 'r') as f:
    index_lines = f.readlines()
with open('internal.html', 'r') as f:
    internal_lines = f.readlines()

export_start = -1
export_end = -1
for i, line in enumerate(index_lines):
    if '<!-- Export Section -->' in line:
        export_start = i
    if export_start != -1 and '</div>' in line and i > export_start + 1:
        # Actually, let's just find the exact chunk
        if '<div class="sidebar-footer">' in line:
            export_end = i - 2
            break

print("Export start:", export_start, "Export end:", export_end)
export_block = index_lines[export_start:export_end+1]
print("".join(export_block))

# Find where to insert in internal.html
internal_insert = -1
for i, line in enumerate(internal_lines):
    if '<div class="sidebar-footer">' in line:
        internal_insert = i - 1
        break

print("Internal insert at:", internal_insert)
