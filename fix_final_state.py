import os
import re

def fix_file(f):
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()

        # 1. aria-pressed sync inside updateButtonVisualStates
        # We need to make sure this is done correctly in index.html and internal.html
        target_inactive = """btn.classList.remove('active');
                    btn.classList.add('inactive');"""
        rep_inactive = """btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');"""

        target_active = """btn.classList.add('active');
                    btn.classList.remove('inactive');"""
        rep_active = """btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');"""

        # In index.html, updateButtonVisualStates looks like:
        # if (activeFilters.has(g)) {
        #     btn.classList.add('active');
        #     btn.classList.remove('inactive');
        # } else {
        #     btn.classList.remove('active');
        #     btn.classList.add('inactive');
        # }

        # Just use simple regex
        content = re.sub(r"btn\.classList\.add\('active'\);\s*btn\.classList\.remove\('inactive'\);", r"btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');", content)
        content = re.sub(r"btn\.classList\.remove\('active'\);\s*btn\.classList\.add\('inactive'\);", r"btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');", content)

        # 2. Add makeMarkerAccessible helper
        helper_func = """
        // Custom marker generator
        function makeMarkerAccessible(marker, label) {
            marker.on('add', () => {
                const el = marker.getElement();
                if (el) {
                    el.setAttribute('role', 'button');
                    el.setAttribute('aria-label', label);
                }
            });
            return marker;
        }
"""
        if 'function makeMarkerAccessible' not in content:
            spot = "        // Custom marker generator\n        function createCustomMarker"
            if spot in content:
                content = content.replace(spot, helper_func.strip() + "\n\n        function createCustomMarker")

        # 3. Apply makeMarkerAccessible to markers
        def repl_custom(m):
            body = m.group(1)
            new_body = re.sub(r'return L\.marker\(\[lat,\s*lng\],\s*\{\s*icon:\s*icon\s*\}\);', r'return makeMarkerAccessible(L.marker([lat, lng], { icon: icon }), `${name}, ${group}`);', body)
            return f"function createCustomMarker(lat, lng, color, name, group) {{{new_body}}}"

        content = re.sub(r'function createCustomMarker\(lat, lng, color, name, group\) \{([\s\S]*?^        \})', repl_custom, content, flags=re.MULTILINE)

        # 2025 archive layer
        def repl_2025(m):
            body = m.group(1)
            new_body = body.replace('return L.marker(latlng, { icon: icon });', 'return makeMarkerAccessible(L.marker(latlng, { icon: icon }), `${feature.properties.name}, Gruppe ${feature.properties.group}`);')
            return f"fetch('contacts_2025_anonymized.geojson'){new_body}"

        content = re.sub(r"fetch\('contacts_2025_anonymized\.geojson'\)([\s\S]*?\}\);)", repl_2025, content)

        # elwas einleiter layer
        def repl_elwas(m):
            body = m.group(1)
            new_body = body.replace('return L.marker(latlng, { icon: icon });', 'return makeMarkerAccessible(L.marker(latlng, { icon: icon }), `Einleiter ${feature.properties.name || feature.properties.bezeichnung}`);')
            return f"fetch('elwas_einleiter.geojson'){new_body}"
        content = re.sub(r"fetch\('elwas_einleiter\.geojson'\)([\s\S]*?\}\);)", repl_elwas, content)

        # 4. Focus rings
        focus_ring_css = """
        /* Globale Focus-Ring-Regel für verbesserte Zugänglichkeit */
        button:focus-visible,
        .contact-item:focus-visible,
        .leaflet-marker-icon:focus-visible,
        a:focus-visible,
        input:focus-visible,
        .leaflet-control-layers-toggle:focus-visible {
            outline: 3px solid #2563eb !important;
            outline-offset: 2px !important;
        }
        body.high-contrast button:focus-visible,
        body.high-contrast .contact-item:focus-visible,
        body.high-contrast .leaflet-marker-icon:focus-visible,
        body.high-contrast a:focus-visible,
        body.high-contrast input:focus-visible {
            outline: 4px solid #ff5f00 !important;
            outline-offset: 2px !important;
        }
"""
        if 'button:focus-visible' not in content:
            content = content.replace("    </style>", focus_ring_css + "\n    </style>")

        with open(f, 'w') as file:
            file.write(content)

fix_file('index.html')
fix_file('internal.html')
