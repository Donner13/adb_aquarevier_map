import json
from shapely.geometry import shape
from pyproj import CRS, Transformer
from collections import defaultdict, Counter

# Pfade zu den Quelldateien
KREISE_GEOJSON_PATH = 'kreise_rr.geojson'
EINLEITER_GEOJSON_PATH = 'elwas_einleiter.geojson'
KLAERANLAGEN_GEOJSON_PATH = 'klaeranlagen.geojson'
GRUNDWASSERMESSSTELLEN_GEOJSON_PATH = 'grundwassermessstellen.geojson'
BEVOELKERUNG_JSON_PATH = 'elwas_raw_data/kreis_bevoelkerung.json'
OUTPUT_GEOJSON_PATH = 'kreise_scorecard.geojson'

# EPSG:25832 für Flächenberechnung (UTM Zone 32N)
CRS_25832 = CRS("EPSG:25832")
CRS_4326 = CRS("EPSG:4326") # WGS84
transformer = Transformer.from_crs(CRS_4326, CRS_25832, always_xy=True)

def normalize_kreis_name(name):
    """Normalisiert Kreisnamen durch Entfernen von Präfixen und Leerzeichen."""
    name = name.replace("Kreis ", "").replace("Stadt ", "").strip()
    # Spezielle Behandlung für "Städteregion Aachen"
    if name == "Städteregion Aachen":
        return name
    return name

def load_geojson(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    # 1. Daten laden
    kreise_data = load_geojson(KREISE_GEOJSON_PATH)
    einleiter_data = load_geojson(EINLEITER_GEOJSON_PATH)
    klaeranlagen_data = load_geojson(KLAERANLAGEN_GEOJSON_PATH)
    grundwassermessstellen_data = load_geojson(GRUNDWASSERMESSSTELLEN_GEOJSON_PATH)
    bevoelkerung_data = load_json(BEVOELKERUNG_JSON_PATH)

    # Erstelle eine Map von normalisiertem Kreisnamen zu den Kreis-Features und AGS
    kreis_map = {}
    for feature in kreise_data['features']:
        gn = feature['properties']['GN']
        kn5 = feature['properties']['KN'][:5]
        kreis_map[normalize_kreis_name(gn)] = {'feature': feature, 'kn5': kn5}

    # Map von AGS zu Bevölkerungsdaten
    bevoelkerung_map = {item['kn5']: item for item in bevoelkerung_data}

    # Initialisiere Aggregations-Strukturen
    kreis_stats = defaultdict(lambda: {
        'anzahl_einleiter': 0,
        'klaeranlagen_kapazitaet_ew': 0,
        'anzahl_messstellen': 0,
        'flaeche_km2': 0,
        'einwohner': 0,
        'name': '',
        'kn5': ''
    })

    # Aggregiere Einleiter
    einleiter_counts = Counter()
    for feature in einleiter_data['features']:
        kreis_name_raw = feature['properties']['kreis']
        normalized_name = normalize_kreis_name(kreis_name_raw)
        if normalized_name in kreis_map:
            einleiter_counts[normalized_name] += 1
            kreis_stats[normalized_name]['anzahl_einleiter'] += 1
        else:
            print(f"WARNUNG: Einleiter in unbekanntem Kreis: {kreis_name_raw}")
    assert sum(einleiter_counts.values()) == len(einleiter_data['features']), \
        f"Assertion fehlgeschlagen: Einleiter-Summe ({sum(einleiter_counts.values())}) != Gesamt ({len(einleiter_data['features'])})"

    # Aggregiere Kläranlagen
    klaeranlagen_counts = Counter()
    for feature in klaeranlagen_data['features']:
        kreis_name_raw = feature['properties']['kreis']
        normalized_name = normalize_kreis_name(kreis_name_raw)
        if normalized_name in kreis_map:
            klaeranlagen_counts[normalized_name] += 1
            kapazitaet_str = feature['properties'].get('ausbaugroesse_ew', '0')
            # Tausenderpunkt entfernen und in Float umwandeln
            kapazitaet = float(kapazitaet_str.replace('.', ''))
            kreis_stats[normalized_name]['klaeranlagen_kapazitaet_ew'] += kapazitaet
        else:
            print(f"WARNUNG: Kläranlage in unbekanntem Kreis: {kreis_name_raw}")
    assert sum(klaeranlagen_counts.values()) == len(klaeranlagen_data['features']), \
        f"Assertion fehlgeschlagen: Kläranlagen-Summe ({sum(klaeranlagen_counts.values())}) != Gesamt ({len(klaeranlagen_data['features'])})"

    # Aggregiere Grundwassermessstellen
    messstellen_counts = Counter()
    for feature in grundwassermessstellen_data['features']:
        kreis_name_raw = feature['properties']['kreis']
        normalized_name = normalize_kreis_name(kreis_name_raw)
        if normalized_name in kreis_map:
            messstellen_counts[normalized_name] += 1
            kreis_stats[normalized_name]['anzahl_messstellen'] += 1
        else:
            print(f"WARNUNG: Messstelle in unbekanntem Kreis: {kreis_name_raw}")
    assert sum(messstellen_counts.values()) == len(grundwassermessstellen_data['features']), \
        f"Assertion fehlgeschlagen: Messstellen-Summe ({sum(messstellen_counts.values())}) != Gesamt ({len(grundwassermessstellen_data['features'])})"

    output_features = []
    for normalized_name, data in kreis_map.items():
        feature = data['feature']
        kn5 = data['kn5']
        
        # Geometrie transformieren und Fläche berechnen
        geom_4326 = shape(feature['geometry'])
        projected_coords = [transformer.transform(x, y) for x, y in geom_4326.exterior.coords]
        geom_25832 = shape({'type': 'Polygon', 'coordinates': [projected_coords]})
        flaeche_km2 = geom_25832.area / 1_000_000 # m^2 zu km^2

        # Bevölkerungsdaten joinen
        bevoelkerung = bevoelkerung_map.get(kn5)
        if bevoelkerung:
            kreis_stats[normalized_name]['einwohner'] = bevoelkerung['einwohner']
        else:
            print(f"WARNUNG: Keine Bevölkerungsdaten für KN5: {kn5} ({normalized_name})")
        assert kreis_stats[normalized_name]['einwohner'] > 0, f"Assertion fehlgeschlagen: Kreis {normalized_name} hat keine Einwohnerdaten."

        # Update stats
        kreis_stats[normalized_name]['flaeche_km2'] = flaeche_km2
        kreis_stats[normalized_name]['name'] = feature['properties']['GN'] # Originalname
        kreis_stats[normalized_name]['kn5'] = kn5

        # Berechne Bonus-Kennwert
        if kreis_stats[normalized_name]['einwohner'] > 0:
            kreis_stats[normalized_name]['einleiter_je_10000ew'] = \
                (kreis_stats[normalized_name]['anzahl_einleiter'] / kreis_stats[normalized_name]['einwohner']) * 10000
        else:
            kreis_stats[normalized_name]['einleiter_je_10000ew'] = 0

        if kreis_stats[normalized_name]['flaeche_km2'] > 0:
            kreis_stats[normalized_name]['messstellendichte_km2'] = \
                kreis_stats[normalized_name]['anzahl_messstellen'] / kreis_stats[normalized_name]['flaeche_km2']
        else:
            kreis_stats[normalized_name]['messstellendichte_km2'] = 0


        # Erstelle neues Feature für Output
        new_properties = feature['properties'].copy()
        new_properties.update(kreis_stats[normalized_name])
        output_features.append({
            'type': 'Feature',
            'geometry': feature['geometry'],
            'properties': new_properties
        })

    # Schreibe Output GeoJSON
    output_geojson = {
        'type': 'FeatureCollection',
        'features': output_features
    }
    with open(OUTPUT_GEOJSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(output_geojson, f, indent=2, ensure_ascii=False)

    print(f"Erfolgreich '{OUTPUT_GEOJSON_PATH}' erstellt.")
    print("\nFinal aggregierte Werte pro Kreis:")
    for feature in output_features:
        props = feature['properties']
        print(f"  {props['name']}:")
        print(f"    Einwohner: {props['einwohner']:,}")
        print(f"    Fläche (km²): {props['flaeche_km2']:.2f}")
        print(f"    Anzahl Einleiter: {props['anzahl_einleiter']}")
        print(f"    Kläranlagen Kapazität (EW): {props['klaeranlagen_kapazitaet_ew']:,}")
        print(f"    Anzahl Messstellen: {props['anzahl_messstellen']}")
        print(f"    Messstellendichte (Stellen/km²): {props['messstellendichte_km2']:.2f}")
        print(f"    Einleiter je 10.000 EW: {props['einleiter_je_10000ew']:.2f}")

if __name__ == '__main__':
    main()
