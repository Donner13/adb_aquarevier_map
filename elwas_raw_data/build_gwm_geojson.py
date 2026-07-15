"""
Baut grundwassermessstellen.geojson. Die Koordinaten aus der ELWAS-Liste
sind aus Datenschutzgruenden auf ~100m genau maskiert (z.B. "331xx" statt
exaktem Wert) - wir ersetzen "xx" durch "50" (Zellenmitte), was fuer eine
regionale Uebersichtskarte ausreicht, aber keine Millimeter-Genauigkeit
vortaeuscht.
"""
import json
import os
from pyproj import Transformer

BASE = os.path.dirname(os.path.abspath(__file__))
IN_PATH = os.path.join(BASE, "grundwassermessstellen.json")
OUT_PATH = os.path.join(BASE, "grundwassermessstellen.geojson")

transformer = Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)

def deanonymize(value):
    if not value:
        return None
    v = value.replace("xx", "50")
    try:
        return float(v)
    except ValueError:
        return None

def main():
    with open(IN_PATH, encoding="utf-8") as f:
        data = json.load(f)

    features = []
    skipped = 0
    for kreis, stations in data.items():
        if not isinstance(stations, list):
            continue
        for s in stations:
            ost = deanonymize(s.get("utm_east"))
            nord = deanonymize(s.get("utm_north"))
            if ost is None or nord is None:
                skipped += 1
                continue
            try:
                lon, lat = transformer.transform(ost, nord)
            except (ValueError, TypeError):
                skipped += 1
                continue
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "name": s.get("name"),
                    "gemeinde": s.get("gemeinde"),
                    "kreis": kreis,
                    "eigentuemer": s.get("eigentuemer"),
                    "messstellenart": s.get("messstellenart"),
                    "genauigkeit": "~100m (anonymisiert)",
                    "quelle": "ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung - Version 2.0",
                },
            })

    geojson = {"type": "FeatureCollection", "features": features}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, allow_nan=False)

    print(f"Features written: {len(features)}")
    print(f"Skipped (no coords): {skipped}")
    print(f"Output: {OUT_PATH}")

if __name__ == "__main__":
    main()
