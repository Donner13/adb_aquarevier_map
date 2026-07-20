"""
Baut grundwassermessstellen.geojson. Die Koordinaten aus der ELWAS-Liste
sind aus Datenschutzgruenden auf ~100m genau maskiert (z.B. "331xx" statt
exaktem Wert) - wir ersetzen "xx" durch "50" (Zellenmitte), was fuer eine
regionale Uebersichtskarte ausreicht, aber keine Millimeter-Genauigkeit
vortaeuscht.

WICHTIG (Bugfix 2026-07-16): ELWAS liefert die Werte in *Dekametern*
(UTM-Meter / 10), nicht in Metern - z.B. "295xx" fuer eine echte Ostung von
295450m (295450/10 = 29545, letzte 2 Ziffern maskiert = "295xx"). Der
vorherige Code hat "xx" -> "50" ersetzt und den Wert direkt als UTM-Meter an
pyproj uebergeben, ohne die fehlende Nachkommastelle *10 auszugleichen -
Ergebnis waren um Faktor 10 zu kleine Ost-/Nordwerte, die via
EPSG:25832->4326 irgendwo im Golf von Guinea (~lat 5, lon 4.7) statt in NRW
(~lat 50.8, lon 6.1) landeten. Alle 4410 Messstellen waren dadurch fuer JEDE
Kartenansicht (geclustert oder einzeln) ausserhalb des sichtbaren Bereichs -
das war die eigentliche Ursache, warum die Grundwassermessstellen-Ebene
(inkl. beider vorheriger Leaflet.markercluster-Versuche) "nichts gerendert"
hat. Verifiziert gegen bekannte Ortslagen (u.a. Herzogenrath, Vaalserquartier,
Rurich) nach Anwendung des *10-Fixes.
"""
import json
import shutil
import os

import sys
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT_PATH = os.path.join(BASE, "..")
sys.path.insert(0, os.path.join(ROOT_PATH, "elwas_toolkit"))
from changelog import write_changelog
from pyproj import Transformer


IN_PATH = os.path.join(BASE, "grundwassermessstellen.json")
OUT_PATH = os.path.join(BASE, "grundwassermessstellen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "grundwassermessstellen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "grundwassermessstellen.geojson")
ROOT_COPY_PATH = os.path.join(ROOT_PATH, "grundwassermessstellen.geojson")

transformer = Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)

def deanonymize(value):
    if not value:
        return None
    v = value.replace("xx", "50")
    try:
        # ELWAS-Rohwert ist in Dekametern maskiert -> *10 fuer echte UTM-Meter
        # (siehe Modul-Docstring / Bugfix 2026-07-16).
        return float(v) * 10
    except ValueError:
        return None

def main():
    with open(IN_PATH, encoding="utf-8") as f:
        data = json.load(f)

    features = []
    seen_keys = set()
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
            
            name = s.get("name")
            gemeinde = s.get("gemeinde")
            
            # Eindeutiger Key aus Name, Koordinaten und Gemeinde zur Deduplizierung
            key = (name, round(lon, 6), round(lat, 6), gemeinde)
            if key in seen_keys:
                continue
            seen_keys.add(key)
            
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "name": name,
                    "gemeinde": gemeinde,
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
    import hashlib
    def gwm_id(f):
        p = f["properties"]
        c = f["geometry"]["coordinates"]
        name = p.get("name", "")
        gemeinde = p.get("gemeinde", "")
        return hashlib.sha1(f"{name}|{gemeinde}|{round(c[0],5)}|{round(c[1],5)}".encode()).hexdigest()[:12]

    write_changelog("grundwassermessstellen", gwm_id, old_features, features, os.path.join(ROOT_PATH, "changelog"))

    # Copy to root
    shutil.copy(OUT_PATH, ROOT_COPY_PATH)

    print(f"Features written: {len(features)} (deduplicated)")
    print(f"Skipped (no coords): {skipped}")
    print(f"Output: {OUT_PATH}")

if __name__ == "__main__":
    main()
