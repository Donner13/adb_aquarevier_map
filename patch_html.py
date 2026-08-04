import re

def insert_script(html):
    return re.sub(
        r'(<script src="js/layers-loader.js"></script>)',
        r'\1\n    <script src="js/groundwater_contours.js"></script>',
        html
    )

def insert_button(html):
    button_html = """                        <button class="filter-btn" data-layer-name="🌊 Grundwassergleichenplan (Isolinien)" title="Interpolierter Grundwasserstand als Flächenkarte (IDW/Kriging auf ELWAS-Messstellen)">
                            <span class="swatch" style="background: linear-gradient(90deg, #56B4E9, #0072B2); width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>
                            <span class="filter-label">Grundwassergleichen</span>
                            <span class="counter-badge" id="cnt-layer-gwiso">(0/0)</span>
                        </button>"""

    return re.sub(
        r'(<button class="filter-btn" data-layer-name="💧 Grundwassermessstellen.*?<\/button>)',
        r'\1\n' + button_html,
        html,
        flags=re.DOTALL
    )

def insert_overlay(html):
    return re.sub(
        r'("📈 Grundwasserwiederanstieg \(Modell\)": gwwaLayer,)',
        r'"🌊 Grundwassergleichenplan (Isolinien)": gwIsoLayer,\n            \1',
        html
    )

def insert_overlay_event(html):
    return re.sub(
        r'(if \(e\.layer === gwwaLayer\) loadGwwaLayer\(\);)',
        r'\1\n            if (e.layer === gwIsoLayer) loadGwIsoLayer();',
        html
    )

for filename in ['index.html', 'internal.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    content = insert_script(content)
    content = insert_button(content)
    content = insert_overlay(content)
    content = insert_overlay_event(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patched index.html and internal.html")
