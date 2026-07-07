"""Spiegelt die produktive contact_map/-Version (main, mit Legende + Hydrologie-Fix)
in den losen Bearbeitungsordner contact_map_dev/, damit dieser nie wieder divergiert
und versehentlich eine schlechtere Version auf die Prod-Domain deployed.

contact_map_dev/tools/deploy_surge.py bleibt auf adb-aquarevier-dev.surge.sh fixiert.
"""
import shutil
from pathlib import Path

PROD = Path(__file__).resolve().parent.parent
DEV = PROD.parent / "contact_map_dev"

# Was wirklich gespiegelt wird: die Karten-Dateien, keine Prod-only-Skripte/Git-Historie.
MIRROR_FILES = [
    "index.html",
    "internal.html",
    "contacts_anonymized.geojson",
    "contacts_2025_anonymized.geojson",
    "contacts.geojson",
]
MIRROR_DIRS = ["logos"]


def main() -> None:
    if not DEV.exists():
        print(f"Ziel {DEV} existiert nicht, Abbruch.")
        return

    for name in MIRROR_FILES:
        src = PROD / name
        if src.exists():
            shutil.copy2(src, DEV / name)
            print(f"gespiegelt: {name}")

    for name in MIRROR_DIRS:
        src_dir = PROD / name
        if src_dir.exists():
            shutil.copytree(src_dir, DEV / name, dirs_exist_ok=True)
            print(f"gespiegelt: {name}/")

    print(f"\nDev-Editor synchronisiert mit Prod-Stand ({PROD}).")


if __name__ == "__main__":
    main()
