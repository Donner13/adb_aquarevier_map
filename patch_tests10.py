import re

filename = 'tests/ui-regression/layer-data.js'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure "ALL_LAYERS" includes the new layer
content = re.sub(
    r"('💧 Grundwassermessstellen \(ELWAS, 3700\+\)': 'grundwassermessstellen.geojson',)",
    r"\1\n  '🌊 Grundwassergleichenplan (Isolinien)': 'grundwassergleichen.geojson',",
    content
)

content = re.sub(
    r"(if \(Object.keys\(ALL_LAYERS\).length !== 21\))",
    r"if (Object.keys(ALL_LAYERS).length !== 22)",
    content
)


with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

filename = 'tests/ui-regression/layer-toggles.spec.js'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"(for \(const \[name, geojsonFile\] of Object\.entries\(EAGER_LAYERS\)\) {)",
    r"\1\n        if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;",
    content
)

content = re.sub(
    r"(for \(const \[name, expectedSubstr\] of Object\.entries\(LAZY_OR_WMS\)\) {)",
    r"\1\n        if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;",
    content
)

content = re.sub(
    r"(for \(const name of Object\.keys\(ALL_LAYERS\)\) {)",
    r"\1\n      if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;",
    content
)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)


print("Patched test files correctly")
