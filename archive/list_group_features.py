import json

with open("contacts_anonymized.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

konsortium_features = []
for feature in data["features"]:
    props = feature["properties"]
    if props.get("group") == "Konsortium":
        konsortium_features.append(props["name"])

print("Features in group 'Konsortium':")
for name in konsortium_features:
    print("-", name)
