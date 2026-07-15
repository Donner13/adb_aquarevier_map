"""
Spatial Join: zaehlt Industrieeinleiter (elwas_einleiter.geojson) pro
Teileinzugsgebiet-Polygon (rur_einzugsgebiet.geojson) und summiert deren
jaehrliche Abwassermenge (m3/a aus mengen_je_typ.*.max_a).

Beide Quell-Dateien liegen bereits in WGS84 (lon/lat) vor, keine
Koordinatentransformation noetig - nur Point-in-Polygon.
"""
import json
import os
import re

from shapely.geometry import shape, Point

BASE = os.path.dirname(os.path.abspath(__file__))
CATCHMENT_IN = os.path.join(BASE, "..", "rur_einzugsgebiet.geojson")
EINLEITER_IN = os.path.join(BASE, "..", "elwas_einleiter.geojson")
OUT_PATH = os.path.join(BASE, "rur_einzugsgebiet_stats.geojson")


def parse_german_number(v):
    """'1.300' -> 1300.0 (Punkt=Tausender), '260,5' -> 260.5 (Komma=Dezimal)."""
    if not v:
        return None
    v = v.strip().replace(".", "").replace(",", ".")
    try:
        return float(v)
    except ValueError:
        return None


def company_total_a(props):
    total = 0.0
    has_value = False
    for typ_vals in (props.get("mengen_je_typ") or {}).values():
        num = parse_german_number(typ_vals.get("max_a"))
        if num is not None:
            total += num
            has_value = True
    return total, has_value


def format_de(n):
    return f"{n:,.0f}".replace(",", ".")


def main():
    with open(CATCHMENT_IN, encoding="utf-8") as f:
        catchments = json.load(f)
    with open(EINLEITER_IN, encoding="utf-8") as f:
        einleiter = json.load(f)

    polygons = []
    for feat in catchments["features"]:
        geom = shape(feat["geometry"])
        polygons.append({"geom": geom, "props": feat["properties"], "geometry_raw": feat["geometry"],
                          "betriebe": 0, "abwasser_a": 0.0, "betriebe_mit_wert": 0})

    unmatched = 0
    for feat in einleiter["features"]:
        point = shape(feat["geometry"])
        total_a, has_value = company_total_a(feat["properties"])
        matched = False
        for entry in polygons:
            if entry["geom"].contains(point) or entry["geom"].touches(point):
                entry["betriebe"] += 1
                entry["abwasser_a"] += total_a
                if has_value:
                    entry["betriebe_mit_wert"] += 1
                matched = True
        if not matched:
            unmatched += 1

    out_features = []
    for entry in polygons:
        p = entry["props"]
        out_features.append({
            "type": "Feature",
            "geometry": entry["geometry_raw"],
            "properties": {
                "gewaesser": p.get("GEW_NAME"),
                "abschnitt": p.get("ABS_NAME"),
                "teilgebiet_flaeche_km2": round(p.get("TEZG_GES"), 2) if p.get("TEZG_GES") is not None else None,
                "gesamteinzugsgebiet_km2": round(p.get("GEZG"), 2) if p.get("GEZG") is not None else None,
                "anzahl_betriebe": entry["betriebe"],
                "anzahl_betriebe_mit_mengenangabe": entry["betriebe_mit_wert"],
                "gesamtabwasser_a": round(entry["abwasser_a"], 1),
                "gesamtabwasser_text": f"{format_de(entry['abwasser_a'])} m³/a" if entry["abwasser_a"] > 0 else None,
            },
        })

    geojson = {"type": "FeatureCollection", "features": out_features}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, allow_nan=False)

    with_betriebe = sum(1 for e in polygons if e["betriebe"] > 0)
    print(f"Teileinzugsgebiete: {len(polygons)}, davon mit >=1 Betrieb: {with_betriebe}")
    print(f"Betriebe insgesamt: {len(einleiter['features'])}, nicht in irgendeinem Polygon gefunden: {unmatched}")
    print(f"Output: {OUT_PATH}")


if __name__ == "__main__":
    main()
