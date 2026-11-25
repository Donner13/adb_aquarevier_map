#!/usr/bin/env python3
"""Baut das oeffentliche Release-Verzeichnis ``dist_public/``.

Wird von ``deploy_surge.py`` (Repo-Root) und dem Workflow
``.github/workflows/deploy-secure.yml`` aufgerufen. Das Skript kopiert nur
Dateien, die die oeffentliche Karte (``index.html``) braucht, und bricht ab,
sobald etwas Internes oder Personenbezogenes im Ergebnis landen wuerde.

Regeln:
  * Allowlist fuer Wurzeldateien (HTML, JS, Manifest, SVG/PNG, GeoJSON) und
    Verzeichnisse (css, js, vendor, logos, legal).
  * Denylist hat Vorrang (contacts.geojson, contacts.enc, internal.html,
    editor_backend, Tests, Skripte, Rohdaten ...).
  * Sicherheits-Gate: In keiner kopierten *.geojson darf eine E-Mail-Adresse
    ausser den 7 funktionalen Behoerdenpostfaechern (ALLOWED_EMAILS) stehen; sonst Exit-Code 1.

Aufruf:  python tools/build_public_release.py [--out dist_public]
"""
import argparse
import fnmatch
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PUBLIC_DIRS = ["css", "js", "vendor", "logos", "legal"]
PUBLIC_ROOT_GLOBS = [
    "*.html", "*.geojson", "manifest.json", "oembed.json", "sw.js",
    "glossar.js", "*.svg", "*.png", "*.jpg",
]
# Hat Vorrang vor allem anderen.
DENY_GLOBS = [
    "contacts.geojson", "contacts.enc", "contacts*.bak", "*.bak", "*.broken_backup",
    "internal.html", "index.html.broken_backup", "temp.svg",
]
DENY_NAMES = {"__pycache__", ".git", ".github", "node_modules", ".DS_Store", "Thumbs.db"}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# Funktionale Behoerdenpostfaecher der 7 Kreise (Stichprobe 2026-11-25: genau
# diese 7 Adressen stehen in den Fachdaten-Layern, keine personenbezogenen).
ALLOWED_EMAILS = {
    "amt66@kreis-dueren.de",
    "umwelt@moenchengladbach.de",
    "umwelt@rhein-kreis-neuss.de",
    "umweltamt@kreis-heinsberg.de",
    "umweltamt@staedteregion-aachen.de",
    "umweltschutzamt@rhein-erft-kreis.de",
    "wasserwirtschaft@kreis-euskirchen.de",
}


def denied(path: Path) -> bool:
    if any(part in DENY_NAMES for part in path.parts):
        return True
    return any(fnmatch.fnmatch(path.name, g) for g in DENY_GLOBS)


def collect() -> list:
    files = []
    for g in PUBLIC_ROOT_GLOBS:
        for p in sorted(ROOT.glob(g)):
            if p.is_file() and not denied(p.relative_to(ROOT)):
                files.append(p)
    for d in PUBLIC_DIRS:
        base = ROOT / d
        if not base.is_dir():
            continue
        for p in sorted(base.rglob("*")):
            if p.is_file() and not denied(p.relative_to(ROOT)):
                files.append(p)
    return sorted(set(files))


def check_no_emails(files) -> list:
    problems = []
    for p in files:
        if p.suffix != ".geojson":
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        hits = [m for m in EMAIL_RE.findall(text) if m.lower() not in ALLOWED_EMAILS]
        if hits:
            problems.append((p.name, len(hits)))
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default="dist_public")
    args = ap.parse_args()
    out = (ROOT / args.out).resolve()
    if ROOT not in out.parents:
        print(f"Ausgabeverzeichnis muss unterhalb des Repos liegen: {out}")
        return 1

    files = collect()
    problems = check_no_emails(files)
    if problems:
        print("ABBRUCH: nicht freigegebene E-Mail-Adressen in oeffentlichen GeoJSON-Dateien:")
        for name, n in problems:
            print(f"  {name}: {n} Treffer")
        return 1
    for required in ("index.html", "legal/datenschutz.md", "legal/impressum.md"):
        if ROOT / required not in files:
            print(f"ABBRUCH: Pflichtdatei fehlt im Release: {required}")
            return 1

    if out.exists():
        shutil.rmtree(out)
    total = 0
    for p in files:
        dest = out / p.relative_to(ROOT)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dest)
        total += p.stat().st_size
    manifest = {"files": len(files), "bytes": total}
    print(f"dist_public: {manifest['files']} Dateien, {total / 1e6:.1f} MB -> {out}")
    print(json.dumps(manifest))
    return 0


if __name__ == "__main__":
    sys.exit(main())
