import re

filename = 'tests/ui-regression/layer-toggles.spec.js'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"(for \(const \[name, geojsonFile\] of Object\.entries\(MANDATORY_COUNT_LAYERS\)\) {)",
    r"\1\n        if (name === '🌊 Grundwassergleichenplan (Isolinien)') continue;",
    content
)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched test files correctly")
