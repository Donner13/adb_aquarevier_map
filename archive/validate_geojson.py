import argparse
import json
import os
from typing import Dict, List

from elwas_raw_data.data_quality_gate import DataQualityGate, NRW_BBOX

def get_git_commit_sha() -> str:
    try:
        import subprocess
        return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode('utf-8').strip()
    except Exception:
        return "unknown"

def main():
    parser = argparse.ArgumentParser(description="Validiert GeoJSON-Dateien auf Datenqualität.")
    parser.add_argument("--dataset", type=str, help="Name des zu validierenden Datensatzes (z.B. querbauwerke).")
    parser.add_argument("--all", action="store_true", help="Alle in der Konfiguration definierten Datensätze validieren.")
    args = parser.parse_args()

    gate = DataQualityGate()
    config = gate.config
    current_commit_sha = get_git_commit_sha()

    datasets_to_validate = []
    if args.all:
        datasets_to_validate = config.keys()
    elif args.dataset:
        if args.dataset in config:
            datasets_to_validate.append(args.dataset)
        else:
            print(f"FEHLER: Datensatz '{args.dataset}' nicht in dataset_quality_config.json gefunden.")
            exit(1)
    else:
        parser.print_help()
        exit(1)

    overall_exit_code = 0

    for dataset_key in datasets_to_validate:
        print(f"\n--- Validierung für Datensatz: {dataset_key} ---")
        dataset_config = config[dataset_key]
        geojson_path = dataset_config["geojson_path"]
        full_geojson_path = os.path.join(os.path.dirname(__file__), geojson_path)
        quarantine_geojson_path = os.path.join(os.path.dirname(__file__), geojson_path.replace(".geojson", ".quarantine.geojson"))

        if not os.path.exists(full_geojson_path):
            print(f"WARN: GeoJSON-Datei '{full_geojson_path}' nicht gefunden. Überspringe.")
            continue

        with open(full_geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)

        features = geojson_data.get("features", [])
        initial_feature_count = len(features)

        quarantined_features = []
        valid_features = []
        quarantine_indices = set()

        # 1. Kardinalitätsprüfung
        cardinality_result = gate.check_cardinality(
            features=features,
            required_fields=dataset_config["required_fields"],
            blacklist_fragments=dataset_config["blacklist_fragments"]
        )
        if cardinality_result["hard_fail_reason"]:
            print(cardinality_result["hard_fail_reason"])
            overall_exit_code = 1
            continue # Nächster Datensatz oder Exit
        quarantine_indices.update(cardinality_result["quarantine_indices"])

        # 2. Geofence-Prüfung
        geofence_quarantine = gate.check_geofence(features=features, bbox=NRW_BBOX)
        quarantine_indices.update(geofence_quarantine)

        # Trennung in valide und Quarantäne-Features
        for i, feature in enumerate(features):
            if i in quarantine_indices:
                reason = []
                if i in cardinality_result["quarantine_indices"]:
                    reason.append("blacklist/cardinality")
                if i in geofence_quarantine:
                    reason.append("geofence")
                feature["properties"]["_quarantine_reason"] = "; ".join(reason)
                quarantined_features.append(feature)
            else:
                valid_features.append(feature)
        
        # Zähle Features pro Kreis
        kreis_counts = {}
        for feature in valid_features:
            kreis = feature.get("properties", {}).get("kreis")
            if kreis:
                kreis_counts[kreis] = kreis_counts.get(kreis, 0) + 1

        # Row-Count-Tripwire (Post-Scrape-Check, nur wenn keine Hard-Fails)
        try:
            gate.check_row_count_tripwire(dataset_key, len(valid_features), kreis_counts, threshold=0.30)
        except RuntimeError as e:
            print(e)
            overall_exit_code = 1
            continue

        # Ergebnisse schreiben
        if quarantined_features:
            print(f"WARN: {len(quarantined_features)} Features in Quarantäne für '{dataset_key}'.")
            quarantine_geojson_data = {"type": "FeatureCollection", "features": quarantined_features}
            with open(quarantine_geojson_path, 'w', encoding='utf-8') as f:
                json.dump(quarantine_geojson_data, f, indent=2, ensure_ascii=False)
            print(f"Quarantäne-Features in '{quarantine_geojson_path}' geschrieben.")
            # Wenn Quarantäne-Features existieren, wird die Baseline NICHT aktualisiert
            # und der Exit-Code bleibt 0, aber es wird eine Warnung ausgegeben.
        else:
            if os.path.exists(quarantine_geojson_path):
                os.remove(quarantine_geojson_path)
                print(f"INFO: Keine Quarantäne-Features. '{quarantine_geojson_path}' entfernt.")
            
            # Nur wenn alles sauber ist (keine Quarantäne, kein Hard-Fail), wird die Baseline aktualisiert.
            if overall_exit_code == 0:
                gate.update_row_counts_baseline(dataset_key, len(valid_features), kreis_counts, current_commit_sha)

        # Ursprüngliche GeoJSON-Datei aktualisieren (nur mit validen Features)
        geojson_data["features"] = valid_features
        with open(full_geojson_path, 'w', encoding='utf-8') as f:
            json.dump(geojson_data, f, indent=2, ensure_ascii=False)
        print(f"Valide Features für '{dataset_key}' in '{full_geojson_path}' geschrieben ({len(valid_features)} von {initial_feature_count}).")

    exit(overall_exit_code)

if __name__ == "__main__":
    main()