import csv
import json
import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT_DIR, 'elwas_raw_data', 'zustaendigkeiten_kreise.csv')

GEOJSON_FILES = [
    'klaeranlagen.geojson',
    'stauanlagen.geojson',
    'regenbecken.geojson',
    'querbauwerke.geojson',
    'pegel.geojson',
    'elwas_einleiter.geojson',
    'grundwassermessstellen.geojson'
]

def load_csv():
    zustaendigkeit = {}
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            kreis = row.get('kreis', '').strip().casefold()
            if kreis:
                zustaendigkeit[kreis] = {
                    'behoerde': row.get('behoerde', '').strip(),
                    'amt': row.get('amt', '').strip(),
                    'email': row.get('email', '').strip(),
                    'telefon': row.get('telefon', '').strip()
                }
    return zustaendigkeit

def process_geojson(filename, zustaendigkeit):
    filepath = os.path.join(ROOT_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    matched = 0
    total = len(data.get('features', []))
    unmatched_kreise = set()

    for feature in data.get('features', []):
        props = feature.get('properties', {})
        kreis = props.get('kreis', '')
        if not kreis:
            continue

        kreis_normalized = kreis.strip().casefold()
        
        if kreis_normalized in zustaendigkeit:
            z = zustaendigkeit[kreis_normalized]
            if z['behoerde']:
                props['zustaendigkeit_behoerde'] = z['behoerde']
            if z['amt']:
                props['zustaendigkeit_amt'] = z['amt']
            if z['email']:
                props['zustaendigkeit_email'] = z['email']
            if z['telefon']:
                props['zustaendigkeit_telefon'] = z['telefon']
            matched += 1
        else:
            unmatched_kreise.add(kreis)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, allow_nan=False)

    print(f"{filename}: {matched}/{total} Features gematcht, nicht gematchte kreis-Werte: {list(unmatched_kreise)}")

if __name__ == "__main__":
    zustaendigkeit = load_csv()
    for filename in GEOJSON_FILES:
        process_geojson(filename, zustaendigkeit)
