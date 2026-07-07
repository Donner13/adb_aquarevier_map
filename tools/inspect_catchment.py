import json

with open("rur_einzugsgebiet.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

print("Total features:", len(data["features"]))
if data["features"]:
    print("Keys of first feature:", data["features"][0].keys())
    print("Properties of first feature:", data["features"][0].get("properties"))
