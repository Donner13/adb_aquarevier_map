import csv
import json
import os

# Paths
root_dir = r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map"
csv_path = os.path.join(root_dir, "elwas_raw_data", "zustaendigkeiten_kreise.csv")

files = [
    "stauanlagen.geojson",
    "regenbecken.geojson",
    "querbauwerke.geojson",
    "klaeranlagen.geojson",
    "pegel.geojson",
    "elwas_einleiter.geojson",
    "grundwassermessstellen.geojson"
]

# Load CSV data
mapping = {}
with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        k_normalized = row["kreis"].strip().casefold()
        mapping[k_normalized] = {
            "behoerde": row["behoerde"].strip(),
            "amt": row["amt"].strip(),
            "email": row["email"].strip(),
            "telefon": row["telefon"].strip(),
            "hinweis": row["hinweis"].strip()
        }

print(f"Loaded {len(mapping)} county responsibility mappings.")

# Process each GeoJSON file
for file_name in files:
    file_path = os.path.join(root_dir, file_name)
    if not os.path.exists(file_path):
        print(f"File not found, skipping: {file_name}")
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    matched_count = 0
    unmatched_kreise = set()
    total_count = len(data.get("features", []))
    
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        k = props.get("kreis")
        
        # Clean previous joined properties if they exist (idempotency)
        for field in ["zustaendigkeit_behoerde", "zustaendigkeit_amt", "zustaendigkeit_email", "zustaendigkeit_telefon", "zustaendigkeit_hinweis"]:
            if field in props:
                del props[field]
        
        if k:
            k_normalized = k.strip().casefold()
            if k_normalized in mapping:
                info = mapping[k_normalized]
                props["zustaendigkeit_behoerde"] = info["behoerde"]
                props["zustaendigkeit_amt"] = info["amt"]
                props["zustaendigkeit_email"] = info["email"]
                props["zustaendigkeit_telefon"] = info["telefon"]
                if info["hinweis"]:
                    props["zustaendigkeit_hinweis"] = info["hinweis"]
                matched_count += 1
            else:
                unmatched_kreise.add(k.strip())
        else:
            unmatched_kreise.add("Kein Kreis-Attribut")
            
    # Write back in-place
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, allow_nan=False)
        
    print(f"Processed {file_name}: {matched_count}/{total_count} features matched.")
    if unmatched_kreise:
        print(f"  Unmatched: {sorted(list(unmatched_kreise))}")
