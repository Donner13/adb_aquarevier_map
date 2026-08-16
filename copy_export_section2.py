with open('index.html', 'r') as f:
    index_lines = f.readlines()
with open('internal.html', 'r') as f:
    internal_lines = f.readlines()

export_start = -1
export_end = -1
for i, line in enumerate(index_lines):
    if '<!-- Export Section -->' in line:
        export_start = i
        break

for i in range(export_start, len(index_lines)):
    if '<div class="sidebar-footer">' in index_lines[i]:
        export_end = i - 1
        break

print("Export start:", export_start, "Export end:", export_end)
export_block = index_lines[export_start:export_end]
print("".join(export_block))

# Check if presentation-bar exists in index.html and internal.html
pbar_index = -1
for i, line in enumerate(index_lines):
    if '<div id="presentation-bar">' in line:
        pbar_index = i
        break
pbar_index_end = -1
for i in range(pbar_index, len(index_lines)):
    if '</div>' in index_lines[i] and 'document.addEventListener' in "".join(index_lines[i:i+10]):
        # Just find the end of presentation-bar
        pass
# Actually we can just grep
