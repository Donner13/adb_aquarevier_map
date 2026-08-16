with open('internal.html', 'r') as f:
    internal_lines = f.readlines()

for i in range(len(internal_lines)):
    if '<div class="sidebar-footer">' in internal_lines[i]:
        insert_idx = i - 1
        break

with open('index.html', 'r') as f:
    index_lines = f.readlines()

export_start = -1
for i, line in enumerate(index_lines):
    if '<!-- Export Section -->' in line:
        export_start = i
        break
export_end = -1
for i in range(export_start, len(index_lines)):
    if '<div class="sidebar-footer">' in index_lines[i]:
        export_end = i - 1
        break

export_block = index_lines[export_start:export_end]

internal_lines.insert(insert_idx, "".join(export_block))

with open('internal.html', 'w') as f:
    f.writelines(internal_lines)
