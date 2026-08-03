with open('index.html', 'r') as f:
    text = f.read()

s1 = """        loadRiverLayer();

        let riverLayerCache = null;"""

r1 = """        let riverLayerCache = null;
        loadRiverLayer();"""

text = text.replace(s1, r1)

with open('index.html', 'w') as f:
    f.write(text)

with open('internal.html', 'r') as f:
    text2 = f.read()

s2 = """        loadRiverLayer();

        let riverLayerCache = null;"""

r2 = """        let riverLayerCache = null;
        loadRiverLayer();"""

text2 = text2.replace(s2, r2)

with open('internal.html', 'w') as f:
    f.write(text2)
