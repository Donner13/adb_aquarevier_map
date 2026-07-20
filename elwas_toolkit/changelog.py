import json
import os
import hashlib
from datetime import datetime

def write_changelog(layer, id_field, old_features, new_features, changelog_root):
    """
    Diff't old_features gegen new_features per id_field (property-Key oder
    Callable für synthetische IDs), schreibt changelog_root/<layer>/<ts>.json
    und aktualisiert changelog_root/<layer>/index.json (Manifest, neueste zuerst).
    Gibt den geschriebenen Run-Eintrag zurück.
    """
    os.makedirs(os.path.join(changelog_root, layer), exist_ok=True)

    # Generate timestamp
    ts = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%SZ")

    # Process features into dicts keyed by ID
    old_dict = {}
    for f in old_features:
        f_id = id_field(f) if callable(id_field) else f["properties"].get(id_field)
        if f_id is not None:
            old_dict[f_id] = f

    new_dict = {}
    for f in new_features:
        f_id = id_field(f) if callable(id_field) else f["properties"].get(id_field)
        if f_id is not None:
            new_dict[f_id] = f

    added = []
    removed = []
    changed = []

    # If no old features exist, it's a baseline run
    is_baseline = len(old_features) == 0

    if not is_baseline:
        for f_id, new_f in new_dict.items():
            if f_id not in old_dict:
                added.append({"id": f_id, "name": new_f["properties"].get("name"), "properties": new_f["properties"]})
            else:
                old_f = old_dict[f_id]
                f_changes = {}

                # Check properties
                for k, v in new_f["properties"].items():
                    old_v = old_f["properties"].get(k)
                    if old_v != v:
                        f_changes[k] = {"old": old_v, "new": v}

                # Check coordinates (rounded to 5 decimals)
                new_coords = new_f["geometry"]["coordinates"]
                old_coords = old_f["geometry"]["coordinates"]
                new_coords_rounded = [round(c, 5) for c in new_coords]
                old_coords_rounded = [round(c, 5) for c in old_coords]

                if new_coords_rounded != old_coords_rounded:
                    f_changes["coordinates"] = {"old": old_coords, "new": new_coords}

                if f_changes:
                    changed.append({"id": f_id, "name": new_f["properties"].get("name"), "fields": f_changes})

        for f_id, old_f in old_dict.items():
            if f_id not in new_dict:
                removed.append({"id": f_id, "name": old_f["properties"].get("name"), "properties": old_f["properties"]})

    if is_baseline:
        summary = "Erster erfasster Stand (kein Vergleich möglich)"
    else:
        # Generate summary
        summary = f"{len(added)} neu, {len(removed)} entfernt, {len(changed)} geändert"

        # Add details about what changed if there are changes
        if changed:
            all_changed_fields = set()
            for c in changed:
                all_changed_fields.update(c["fields"].keys())
            summary += f" ({', '.join(sorted(all_changed_fields))})."
        else:
            summary += "."

    # Create run entry
    run_entry = {
        "layer": layer,
        "id_field": id_field.__name__ if callable(id_field) else id_field,
        "run_timestamp": ts,
        "baseline": is_baseline,
        "previous_count": len(old_features),
        "new_count": len(new_features),
        "added": added,
        "removed": removed,
        "changed": changed,
        "summary": summary
    }

    # Write detail file
    detail_path = os.path.join(changelog_root, layer, f"{ts}.json")
    with open(detail_path, "w", encoding="utf-8") as f:
        json.dump(run_entry, f, ensure_ascii=False, indent=2)

    # Update manifest
    manifest_path = os.path.join(changelog_root, layer, "index.json")
    manifest = []
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            try:
                manifest = json.load(f)
            except json.JSONDecodeError:
                pass

    manifest_entry = {
        "file": f"{ts}.json",
        "run_timestamp": ts,
        "baseline": is_baseline,
        "added_count": len(added),
        "removed_count": len(removed),
        "changed_count": len(changed),
        "summary": summary
    }

    # Insert at beginning
    manifest.insert(0, manifest_entry)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    return run_entry
