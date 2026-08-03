import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    insertion = """    <!-- Tile CDN Preconnects -->
    <link rel="preconnect" href="https://basemaps.cartocdn.com" crossorigin>
    <link rel="dns-prefetch" href="https://basemaps.cartocdn.com">
    <link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin>
    <link rel="dns-prefetch" href="https://tile.openstreetmap.org">
    <link rel="preconnect" href="https://sgx.geodatenzentrum.de" crossorigin>
    <link rel="dns-prefetch" href="https://sgx.geodatenzentrum.de">
    <link rel="preconnect" href="https://www.wms.nrw.de" crossorigin>
    <link rel="dns-prefetch" href="https://www.wms.nrw.de">
    <link rel="preconnect" href="https://starkregen-euskirchen-v11.cismet.de" crossorigin>
    <link rel="dns-prefetch" href="https://starkregen-euskirchen-v11.cismet.de">
"""

    if "<!-- Tile CDN Preconnects -->" in content:
        return

    # find <head>
    head_end = content.find('</head>')
    if head_end == -1:
        print(f"Could not find </head> in {filepath}")
        return

    new_content = content[:head_end] + insertion + content[head_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Patched {filepath}")

patch_file('index.html')
patch_file('internal.html')
