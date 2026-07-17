import json
from collections import Counter
from typing import List, Dict, Tuple
import os
import math
import datetime

# Bounding Box für NRW (ungefähre Werte, basierend auf kreise_rr.geojson)
# lon ca. 5.87–7.03, lat ca. 50.32–51.34
NRW_BBOX = (5.87, 50.32, 7.03, 51.34) # (min_lon, min_lat, max_lon, max_lat)

class DataQualityGate:
    def __init__(self, config_path: str = "elwas_raw_data/dataset_quality_config.json",
                 row_counts_path: str = "elwas_raw_data/known_row_counts.json"):
        self.config_path = config_path
        self.row_counts_path = row_counts_path
        self.config = self._load_json(self.config_path)
        self.known_row_counts = self._load_json(self.row_counts_path)

    def _load_json(self, path: str) -> Dict:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _save_json(self, data: Dict, path: str):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def check_row_count_tripwire(self, dataset_key: str, kreis_counts: Dict[str, int], threshold: float = 0.30) -> None:
        """
        Prüft die Zeilenanzahl gegen den letzten bekannten Stand.
        """
        total_new_count = sum(kreis_counts.values())
        baseline_data = self.known_row_counts.get(dataset_key)

        if not baseline_data:
            print(f"INFO: Keine Baseline für '{dataset_key}' gefunden. Tripwire übersprungen.")
            return

        total_baseline_count = baseline_data.get("total", 0)
        if total_baseline_count == 0:
            print(f"INFO: Baseline für '{dataset_key}' hat 0 Zeilen. Tripwire übersprungen.")
            return

        deviation = abs(total_new_count - total_baseline_count) / total_baseline_count

        if deviation > threshold:
            raise RuntimeError(
                f"Datenqualitäts-Gate FAIL: Row-Count-Tripwire für '{dataset_key}' ausgelöst.\n"
                f"Neue Gesamtanzahl: {total_new_count}, Baseline: {total_baseline_count} (Abweichung: {deviation:.2%}).\n"
                f"Bitte manuelle Prüfung der Daten vor dem Scrape."
            )
        print(f"INFO: Row-Count-Tripwire für '{dataset_key}' bestanden (Abweichung: {deviation:.2%}).")

    def check_cardinality(self, features: List[Dict], required_fields: List[str],
                          blacklist_fragments: List[str], mode_ratio_threshold: float = 0.8,
                          min_features_for_check: int = 5) -> Dict:
        """
        Prüft die Kardinalität von Feldern und identifiziert Blacklist-Treffer.
        Gibt ein Dict mit 'quarantine_indices' und 'hard_fail_reason' zurück.
        """
        quarantine_indices = []
        hard_fail_reason = None

        if len(features) < min_features_for_check:
            print(f"INFO: Zu wenige Features ({len(features)}) für Kardinalitätsprüfung.")
            return {"quarantine_indices": [], "hard_fail_reason": None}

        for field in required_fields:
            values = [f["properties"].get(field) for f in features if f["properties"].get(field) is not None]
            
            if not values:
                continue

            # Generische Regel: String-Werte < 2 Zeichen in bestimmten Feldern
            if field in ["name", "betreiber", "gewaesser"]:
                for i, val in enumerate(features):
                    prop_val = val["properties"].get(field)
                    if isinstance(prop_val, str) and len(prop_val) < 2 and i not in quarantine_indices:
                        quarantine_indices.append(i)
                        print(f"WARN: Feature {i} in Quarantäne: Feld '{field}' hat verdächtig kurzen Wert '{prop_val}'.")

            # Blacklist-Fragmente
            for i, val in enumerate(features):
                prop_val = val["properties"].get(field)
                if isinstance(prop_val, str):
                    for fragment in blacklist_fragments:
                        if fragment in prop_val and i not in quarantine_indices:
                            quarantine_indices.append(i)
                            print(f"WARN: Feature {i} in Quarantäne: Feld '{field}' enthält Blacklist-Fragment '{fragment}'.")
                            break
                    # Regex für unknown_.*
                    if prop_val.startswith("unknown_") and i not in quarantine_indices:
                        quarantine_indices.append(i)
                        print(f"WARN: Feature {i} in Quarantäne: Feld '{field}' enthält 'unknown_'-Muster.")

            # Systemischer Fall: häufigster Wert dominiert
            if len(values) >= min_features_for_check:
                value_counts = Counter(values)
                most_common_value, most_common_count = value_counts.most_common(1)[0]
                mode_ratio = most_common_count / len(values)

                if mode_ratio >= mode_ratio_threshold:
                    hard_fail_reason = (
                        f"Datenqualitäts-Gate HARD FAIL: Systemische Kontamination in Feld '{field}'.\n"
                        f"Häufigster Wert '{most_common_value}' tritt in {most_common_count}/{len(values)} Features auf "
                        f"({mode_ratio:.2%}), überschreitet Schwellenwert von {mode_ratio_threshold:.0%}. "
                        f"Ganze Extraktion wahrscheinlich kaputt."
                    )
                    return {"quarantine_indices": [], "hard_fail_reason": hard_fail_reason}

        return {"quarantine_indices": list(set(quarantine_indices)), "hard_fail_reason": hard_fail_reason}

    def check_geofence(self, features: List[Dict], bbox: Tuple[float, float, float, float], buffer_deg: float = 0.05) -> List[int]:
        """
        Prüft Koordinaten gegen eine Bounding Box.
        Gibt eine Liste von Feature-Indizes zurück, die außerhalb des Geofence liegen.
        """
        quarantine_indices = []
        min_lon, min_lat, max_lon, max_lat = bbox

        for i, feature in enumerate(features):
            if "geometry" in feature and "coordinates" in feature["geometry"]:
                lon, lat = feature["geometry"]["coordinates"]
                if not (min_lon - buffer_deg <= lon <= max_lon + buffer_deg and
                        min_lat - buffer_deg <= lat <= max_lat + buffer_deg):
                    quarantine_indices.append(i)
                    print(f"WARN: Feature {i} in Quarantäne: Koordinaten ({lon:.4f}, {lat:.4f}) außerhalb des Geofence.")
        return quarantine_indices

    def update_row_counts_baseline(self, dataset_key: str, total_count: int, per_kreis_counts: Dict[str, int], commit_sha: str):
        """
        Aktualisiert die Baseline für die Zeilenanzahl.
        """
        self.known_row_counts[dataset_key] = {
            "total": total_count,
            "per_kreis": per_kreis_counts,
            "updated": self._get_current_date(),
            "source_commit": commit_sha
        }
        self._save_json(self.known_row_counts, self.row_counts_path)
        print(f"INFO: Baseline für '{dataset_key}' aktualisiert.")

    def _get_current_date(self):
        return datetime.date.today().isoformat()