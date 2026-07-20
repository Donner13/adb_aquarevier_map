import json
import os

import sys
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT_PATH = os.path.join(BASE, "..")
sys.path.insert(0, os.path.join(ROOT_PATH, "elwas_toolkit"))
from changelog import write_changelog
import shutil
from pyproj import Transformer


IN_PATH = os.path.join(BASE, "querbauwerke.json")
OUT_PATH = os.path.join(BASE, "querbauwerke.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "querbauwerke.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "querbauwerke.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "querbauwerke.geojson")
ROOT_PATH = os.path.join(BASE, "..")

transformer = Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)

def to_float(v):
    if not v:
        return None
    try:
        return float(v.replace(",", "."))
    except (ValueError, AttributeError):
        return None

def main():
    if not os.path.exists(IN_PATH):
        print(f"Input file not found: {IN_PATH}")
        return

    with open(IN_PATH, encoding="utf-8") as f:
        data = json.load(f)

    features = []
    skipped = []
    for anlagen_nr, v in data.items():
        if "error" in v:
            skipped.append(anlagen_nr)
            continue
        ost, nord = to_float(v.get("utm_east")), to_float(v.get("utm_north"))
        if ost is None or nord is None:
            skipped.append(anlagen_nr)
            continue
        try:
            lon, lat = transformer.transform(ost, nord)
        except (ValueError, TypeError):
            skipped.append(anlagen_nr)
            continue
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "anlagen_nr": anlagen_nr,
                "name": v.get("name"),
                "kreis": v.get("kreis"),
                "bauwerksart": v.get("bauwerksart"),
                "typ": v.get("typ"),
                "gewaesser": v.get("gewaesser"),
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
    write_changelog("querbauwerke", "anlagen_nr", old_features, features, os.path.join(ROOT_PATH, "changelog"))

    # Copy to root
    shutil.copy(OUT_PATH, ROOT_COPY_PATH)

    # Copy to root


    print(f"Features written: {len(features)}")
    print(f"Skipped: {len(skipped)} {skipped}")
    print(f"Output copied to: {ROOT_PATH}")

if __name__ == "__main__":
    main()
