import json

with open("pegel.geojson", "r", encoding="utf-8") as f:
    pegel_data = json.load(f)

for feat in pegel_data["features"]:
    p = feat["properties"]
    if p.get("upstream_data_available"):
        # We need the list of actual upstream businesses for the drawing.
        # But this info is not in pegel.geojson. We need to modify build_pegel_correlation.py
        pass
