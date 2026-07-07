import json

with open("contacts_anonymized.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

main_partners = [
    'wver',
    'schoellershammer',
    'smurfit',
    'tillmann',
    'rlv',
    'eschweiler',
    'fiw',
    'isa',
    'iww'
]

def is_main_partner(name):
    name_lower = name.lower()
    return any(p in name_lower for p in main_partners)

for feature in data["features"]:
    name = feature["properties"]["name"]
    if is_main_partner(name):
        print(f"{name}: {feature['geometry']['coordinates']}")
