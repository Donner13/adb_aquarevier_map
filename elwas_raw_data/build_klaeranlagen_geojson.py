import json
import shutil
import os

import sys
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT_PATH = os.path.join(BASE, "..")
sys.path.insert(0, os.path.join(ROOT_PATH, "elwas_toolkit"))
from changelog import write_changelog
from pyproj import Transformer


IN_PATH = os.path.join(BASE, "klaeranlagen.json")
OUT_PATH = os.path.join(BASE, "klaeranlagen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "klaeranlagen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "klaeranlagen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "klaeranlagen.geojson")

transformer = Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)

def main():
    with open(IN_PATH, encoding="utf-8") as f:
        data = json.load(f)

    features = []
    skipped = []
    for anlagen_nr, v in data.items():
        if "error" in v:
            skipped.append(anlagen_nr)
            continue
        ost, nord = v.get("utm_east"), v.get("utm_north")
        if not ost or not nord:
            skipped.append(anlagen_nr)
            continue
        try:
            lon, lat = transformer.transform(float(ost), float(nord))
        except (ValueError, TypeError):
            skipped.append(anlagen_nr)
            continue
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "anlagen_nr": anlagen_nr,
                "name": v.get("name"),
                "gemeinde": v.get("gemeinde"),
                "kreis": v.get("kreis"),
                "betreiber": v.get("betreiber"),
                "gewaesser": v.get("gewaesser"),
                "ausbaugroesse_ew": v.get("ausbaugroesse_ew"),
                "quelle": "ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung - Version 2.0",
            },
        })

    geojson = {"type": "FeatureCollection", "features": features}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False, allow_nan=False)

    # Load old features for diffing
    old_features = []
    if os.path.exists(ROOT_COPY_PATH):
        try:
            with open(ROOT_COPY_PATH, "r", encoding="utf-8") as f:
                old_data = json.load(f)
                old_features = old_data.get("features", [])
        except Exception as e:
            print(f"Could not load old features: {e}")

    # Write changelog
    write_changelog("klaeranlagen", "anlagen_nr", old_features, features, os.path.join(ROOT_PATH, "changelog"))

    # Copy to root
    shutil.copy(OUT_PATH, ROOT_COPY_PATH)

    print(f"Features written: {len(features)}")
    print(f"Skipped: {len(skipped)} {skipped}")
    print(f"Output: {OUT_PATH}")

if __name__ == "__main__":
    main()
