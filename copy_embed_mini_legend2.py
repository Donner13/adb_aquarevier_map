with open('index.html', 'r') as f:
    index_lines = f.readlines()
with open('internal.html', 'r') as f:
    internal_lines = f.readlines()

css_start = -1
for i, line in enumerate(index_lines):
    if '.embed-mini-legend {' in line:
        css_start = i
        break
css_end = -1
for i in range(css_start, len(index_lines)):
    if '/* Embed Modal */' in index_lines[i]:
        css_end = i
        break

css_block = index_lines[css_start:css_end]

internal_insert_css = -1
for i, line in enumerate(internal_lines):
    if '/* Embed Modal */' in line:
        internal_insert_css = i
        break

if css_start != -1 and internal_insert_css != -1:
    internal_lines = internal_lines[:internal_insert_css] + css_block + internal_lines[internal_insert_css:]

# Refetch lines since we mutated internal_lines
js_start = -1
for i, line in enumerate(index_lines):
    if 'const miniLegendContainer = document.getElementById(\'embed-mini-legend-items\');' in line:
        js_start = i - 2
        break
js_end = -1
for i in range(js_start, len(index_lines)):
    if '            // Set dynamic back link' in index_lines[i]:
        js_end = i
        break

js_block = index_lines[js_start:js_end]

internal_insert_js = -1
for i, line in enumerate(internal_lines):
    if '            // Set dynamic back link' in line:
        internal_insert_js = i
        break

if js_start != -1 and internal_insert_js != -1:
    internal_lines = internal_lines[:internal_insert_js] + js_block + internal_lines[internal_insert_js:]

with open('internal.html', 'w') as f:
    f.writelines(internal_lines)
