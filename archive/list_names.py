import json

with open("contacts_anonymized.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

names = set(f["properties"]["name"] for f in data["features"])
for name in sorted(names):
    print(name)
