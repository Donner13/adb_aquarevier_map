import json

with open("contacts_anonymized.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

for i, feature in enumerate(data["features"]):
    props = feature.get("properties", {})
    if "name" not in props:
        print(f"Feature {i} has no name property!")
    elif not isinstance(props["name"], str):
        print(f"Feature {i} name is not a string: {type(props['name'])}")
print("All features checked.")
