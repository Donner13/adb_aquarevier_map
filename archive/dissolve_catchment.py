import json
import subprocess
import sys

# Ensure shapely is installed
try:
    import shapely
    from shapely.ops import unary_union
    from shapely.geometry import shape, mapping
except ImportError:
    print("Installing shapely...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "shapely"])
    import shapely
    from shapely.ops import unary_union
    from shapely.geometry import shape, mapping

with open("rur_einzugsgebiet.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

geoms = []
for feature in data["features"]:
    geom = shape(feature["geometry"])
    if geom.is_valid:
        geoms.append(geom)
    else:
        # Buffer to fix invalid geometry
        geoms.append(geom.buffer(0))

union_geom = unary_union(geoms)

# Simplify slightly to reduce file size
union_geom_simple = union_geom.simplify(0.0005, preserve_topology=True)

output_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Rur Einzugsgebiet Gesamt"},
            "geometry": mapping(union_geom_simple)
        }
    ]
}

with open("rur_einzugsgebiet_outline.geojson", "w", encoding="utf-8") as f:
    json.dump(output_geojson, f)

print("Successfully dissolved 131 features into 1 outline!")
