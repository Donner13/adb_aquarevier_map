"""
Baut elwas_einleiter.geojson aus matching_companies.csv + scrape_progress.json.
Wandelt UTM Zone 32N (EPSG:25832) Koordinaten nach WGS84 (EPSG:4326) um.
Kann jederzeit erneut laufen (auch mit unvollstaendigem scrape_progress.json)
- Firmen ohne Koordinaten werden uebersprungen und am Ende aufgelistet.
"""
import json
import os
import re
import pandas as pd
from pyproj import Transformer

BASE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE, "matching_companies.csv")
PROGRESS_PATH = os.path.join(BASE, "scrape_progress.json")
EINLEITUNGSSTELLEN_PATH = os.path.join(BASE, "scrape_progress_einleitungsstellen.json")
OUT_PATH = os.path.join(BASE, "elwas_einleiter.geojson")

BRANCHE_MAP = {
    28: "Papierindustrie",
    38: "Textilindustrie",
    22: "Chemieindustrie",
    55: "Chemieindustrie",
    40: "Metallindustrie",
    29: "Metallindustrie",
    3: "Lebensmittelindustrie",
    10: "Lebensmittelindustrie",
}

DISTRICT_TO_KREIS = {
    "D_ren": "Kreis Düren",
    "Euskirchen": "Kreis Euskirchen",
    "Heinsberg": "Kreis Heinsberg",
    "M_nchengladbach": "Stadt Mönchengladbach",
    "Rhein_Erft_Kreis": "Rhein-Erft-Kreis",
    "Rhein_Kreis_Neuss": "Rhein-Kreis Neuss",
    "St_dteregion_Aachen": "Städteregion Aachen",
}

transformer = Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)


def parse_anhang_codes(anhang_field):
    """'Anhang der AbwV' can contain multiple lines like
    '38 Textilherstellung...\n31 Wasseraufbereitung...' -> [38, 31]"""
    if not isinstance(anhang_field, str):
        return []
    codes = []
    for line in anhang_field.splitlines():
        m = re.match(r"\s*(\d+)", line)
        if m:
            codes.append(int(m.group(1)))
    return codes


def branchen_for_codes(codes):
    seen = []
    for c in codes:
        b = BRANCHE_MAP.get(c)
        if b and b not in seen:
            seen.append(b)
    return seen


def summarize_anfallstellen(anfallstellen):
    """Group by Abwasserbeschaffenheit, keep max seen value per unit."""
    by_type = {}
    for a in anfallstellen or []:
        typ = a.get("abwasserbeschaffenheit") or "unbekannt"
        entry = by_type.setdefault(typ, {"max_d": None, "max_h": None, "max_a": None})
        for key in ("max_d", "max_h", "max_a"):
            val = a.get(key)
            if val:
                try:
                    numval = float(val.replace(".", "").replace(",", "."))
                except ValueError:
                    continue
                cur = entry[key]
                cur_num = None
                if cur:
                    try:
                        cur_num = float(cur.replace(".", "").replace(",", "."))
                    except ValueError:
                        cur_num = None
                if cur is None or (cur_num is not None and numval > cur_num):
                    entry[key] = val
    return by_type


def clean_einleitungsart(field):
    if not isinstance(field, str):
        return None
    tokens = set()
    for line in field.splitlines():
        line = line.strip()
        if not line:
            continue
        if "Direkteinleitung" in line:
            tokens.add("Direkteinleitung")
        elif "Indirekteinleitung" in line:
            tokens.add("Indirekteinleitung")
        else:
            tokens.add(line)
    return " + ".join(sorted(tokens))


def format_mengen_text(by_type):
    parts = []
    for typ, vals in by_type.items():
        unit_parts = []
        if vals["max_d"]:
            unit_parts.append(f"{vals['max_d']} m³/d")
        if vals["max_h"]:
            unit_parts.append(f"{vals['max_h']} m³/h")
        if vals["max_a"]:
            unit_parts.append(f"{vals['max_a']} m³/a")
        if unit_parts:
            parts.append(f"{typ}: " + ", ".join(unit_parts))
    return "; ".join(parts)


def unique_gewaesser_connections(einleitungsstellen):
    """Dedupe by receiving water body name, keep one representative WGS84
    point per unique Gewaesser so we can draw one connecting line each
    (instead of one line per individual Einleitungsstelle, which for some
    companies would mean 20+ overlapping lines)."""
    seen = {}
    for e in einleitungsstellen or []:
        if "error" in e:
            continue
        name = e.get("gewaesser_name")
        ost = e.get("utm_east")
        nord = e.get("utm_north")
        if not name or not ost or not nord:
            continue
        if name in seen:
            continue
        try:
            lon, lat = transformer.transform(float(ost), float(nord))
        except (ValueError, TypeError):
            continue
        seen[name] = {"gewaesser": name, "lat": round(lat, 6), "lon": round(lon, 6)}
    return list(seen.values())


def main():
    df = pd.read_csv(CSV_PATH)
    with open(PROGRESS_PATH, encoding="utf-8") as f:
        progress = json.load(f)

    einleitungsstellen_progress = {}
    if os.path.exists(EINLEITUNGSSTELLEN_PATH):
        with open(EINLEITUNGSSTELLEN_PATH, encoding="utf-8") as f:
            einleitungsstellen_progress = json.load(f)

    features = []
    skipped_no_coords = []
    skipped_no_progress = []

    for _, row in df.iterrows():
        bet_nr = str(row["Betriebs-Nr"])
        data = progress.get(bet_nr)
        if not data:
            skipped_no_progress.append(bet_nr)
            continue
        if "error" in data:
            skipped_no_progress.append(bet_nr)
            continue

        ost = data.get("utm_east")
        nord = data.get("utm_north")
        if not ost or not nord:
            skipped_no_coords.append(bet_nr)
            continue

        try:
            lon, lat = transformer.transform(float(ost), float(nord))
        except (ValueError, TypeError):
            skipped_no_coords.append(bet_nr)
            continue

        anhang_field = row.get("Anhang der AbwV", "")
        codes = parse_anhang_codes(anhang_field)
        branchen = branchen_for_codes(codes)

        anfallstellen = data.get("anfallstellen", [])
        by_type = summarize_anfallstellen(anfallstellen)
        mengen_text = format_mengen_text(by_type)

        district = row.get("District", "")
        kreis = DISTRICT_TO_KREIS.get(district, district)

        es_data = einleitungsstellen_progress.get(bet_nr, {})
        einleitungen = unique_gewaesser_connections(es_data.get("einleitungsstellen", []))
        gewaesser_liste = ", ".join(e["gewaesser"] for e in einleitungen)

        feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "betriebs_nr": bet_nr,
                "name": row.get("Betriebsname"),
                "einleitungsart": clean_einleitungsart(row.get("Einleitungsart")),
                "gemeinde": row.get("Gemeinde"),
                "kreis": kreis,
                "anhang_codes": codes,
                "branchen": branchen,
                "mengen_je_typ": by_type,
                "mengen_text": mengen_text,
                "anzahl_anfallstellen": len(anfallstellen),
                "einleitungen": einleitungen,
                "gewaesser_liste": gewaesser_liste,
                "quelle": "ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung - Version 2.0",
            },
        }
        features.append(feature)

    geojson = {"type": "FeatureCollection", "features": features}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False, allow_nan=False)

    print(f"Companies total in CSV: {len(df)}")
    print(f"Features written: {len(features)}")
    print(f"Skipped (no scrape progress yet / error): {len(skipped_no_progress)} {skipped_no_progress}")
    print(f"Skipped (no coordinates): {len(skipped_no_coords)} {skipped_no_coords}")
    with_mengen = sum(1 for ft in features if ft["properties"]["mengen_text"])
    print(f"Features with at least one quantified Anfallstelle: {with_mengen}")
    with_gewaesser = sum(1 for ft in features if ft["properties"]["einleitungen"])
    print(f"Features with at least one Gewaesser-connection: {with_gewaesser}")
    print(f"Output: {OUT_PATH}")


if __name__ == "__main__":
    main()
