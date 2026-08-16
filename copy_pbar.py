with open('index.html', 'r') as f:
    index_lines = f.readlines()
with open('internal.html', 'r') as f:
    internal_lines = f.readlines()

pbar_css_start = -1
for i, line in enumerate(index_lines):
    if '/* ===== Präsentationsmodus ===== */' in line:
        pbar_css_start = i
        break
pbar_css_end = -1
for i in range(pbar_css_start, len(index_lines)):
    if '</style>' in index_lines[i]:
        pbar_css_end = i
        break
css_block = index_lines[pbar_css_start:pbar_css_end]

insert_css = -1
for i, line in enumerate(internal_lines):
    if '</style>' in line:
        insert_css = i
        break
if pbar_css_start != -1 and insert_css != -1:
    internal_lines = internal_lines[:insert_css] + css_block + internal_lines[insert_css:]

# HTML block
pbar_html_start = -1
for i, line in enumerate(index_lines):
    if '<div id="presentation-bar">' in line:
        pbar_html_start = i
        break
pbar_html_end = -1
for i in range(pbar_html_start, len(index_lines)):
    if '</div>' in index_lines[i] and '<div id="filter-live-region"' in index_lines[i+1]:
        pbar_html_end = i + 1
        break
html_block = index_lines[pbar_html_start:pbar_html_end]

insert_html = -1
for i, line in enumerate(internal_lines):
    if '<div id="filter-live-region"' in line:
        insert_html = i
        break
if pbar_html_start != -1 and insert_html != -1:
    internal_lines = internal_lines[:insert_html] + html_block + internal_lines[insert_html:]

# JS block
pbar_js_start = -1
for i, line in enumerate(index_lines):
    if '// ===== Präsentationsmodus =====' in line:
        pbar_js_start = i
        break
pbar_js_end = -1
for i in range(pbar_js_start, len(index_lines)):
    if 'document.addEventListener(\'DOMContentLoaded\', () => {' in "".join(index_lines[i:i+3]):
        pbar_js_end = i
        break
js_block = index_lines[pbar_js_start:pbar_js_end]

insert_js = -1
for i, line in enumerate(internal_lines):
    if 'document.addEventListener(\'DOMContentLoaded\', () => {' in line:
        insert_js = i
        break
if pbar_js_start != -1 and insert_js != -1:
    internal_lines = internal_lines[:insert_js] + js_block + internal_lines[insert_js:]

with open('internal.html', 'w') as f:
    f.writelines(internal_lines)
