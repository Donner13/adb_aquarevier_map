import re

with open('index.html', 'r', encoding='utf-8') as f:
    idx_html = f.read()

with open('internal.html', 'r', encoding='utf-8') as f:
    int_html = f.read()

# 1. CSS
match_css = re.search(r'(\.embed-mini-legend \{[\s\S]*?\}\s*body\.embed-mode \.embed-mini-legend \{[\s\S]*?\}\s*\.embed-mini-legend-item \{[\s\S]*?\}\s*\.embed-mini-legend-color \{[\s\S]*?\})', idx_html)
css_to_add = match_css.group(1)
if '.embed-mini-legend {' not in int_html:
    int_html = int_html.replace('</style>', css_to_add + '\n    </style>')

# 2. Button
int_html = re.sub(
    r'<button\s+class="filter-btn"\s+id="generate-report-btn"',
    r'<button class="filter-btn active" id="generate-report-btn"',
    int_html
)

# 3. DOM ID
start_dom = idx_html.find('<div id="embed-mini-legend" class="embed-mini-legend">')
end_dom = idx_html.find('<!-- Embed Modal -->', start_dom)
if start_dom != -1 and end_dom != -1 and 'id="embed-mini-legend"' not in int_html:
    embed_legend_dom = idx_html[start_dom:end_dom]
    int_html = int_html.replace('<!-- Embed Modal -->', embed_legend_dom + '<!-- Embed Modal -->')

# 4. JS Embed Mode Parameter check
start1 = idx_html.find('// Check Embed Mode URL Parameter')
end1 = idx_html.find('// 12. Helper function to check map boundaries', start1)
if end1 == -1: end1 = idx_html.find('let statsGeoData = null;', start1)

embed_mode_logic = idx_html[start1:end1]

if '// Check Embed Mode URL Parameter' not in int_html:
    target = '        let statsGeoData = null;'
    if target in int_html:
        parts = int_html.split(target, 1)
        int_html = parts[0] + embed_mode_logic + target + parts[1]

# 5. JS Modal Logic
start2 = idx_html.find('// Embed Modal Logic')
end2 = idx_html.find('// Export Logic', start2)
embed_modal_logic = idx_html[start2:end2]

if '// Embed Modal Logic' not in int_html:
    embed_modal_logic += """
        window.openEmbedModal = function() {
            if (embedModal) {
                embedModal.style.display = 'flex';
                if (typeof generateEmbedSnippet === 'function') generateEmbedSnippet();
            }
        };
"""
    int_html = int_html.replace('</body>', '    <script>\n' + embed_modal_logic + '    </script>\n</body>')

with open('internal.html', 'w', encoding='utf-8') as f:
    f.write(int_html)

print("Patch applied.")
