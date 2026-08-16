import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

with open('internal.html', 'r', encoding='utf-8') as f:
    internal_content = f.read()

# Locate Embed Modal Logic in index.html (the event handlers for copy, close, width, etc)
js_start_str = '// Embed Modal Logic'
js_start = index_content.find(js_start_str)

if js_start != -1:
    js_end_str = '// Export Logic'
    js_end = index_content.find(js_end_str, js_start)
    if js_end != -1:
        js_str = index_content[js_start:js_end]
        if '// Embed Modal Logic' not in internal_content:
            # We will put it right before Check Embed Mode URL Parameter
            internal_content = internal_content.replace('        // Check Embed Mode URL Parameter', js_str + '\n        // Check Embed Mode URL Parameter')

with open('internal.html', 'w', encoding='utf-8') as f:
    f.write(internal_content)
