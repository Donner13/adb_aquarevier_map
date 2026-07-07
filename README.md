# AquaRevier Akteurskarte — Dev Version

> 🔵 **Dev-Preview**: https://adb-aquarevier-dev.surge.sh (auto-deployed bei jedem Push)
> 🟢 **Produktion**: https://adb-aquarevier-secure.surge.sh
> 📦 **Prod-Repo**: https://github.com/Dtunder/adb_aquarevier_map

---

## Über das Projekt

Interaktive Karte der Akteure im Aachener Wassereinzugsgebiet (AquaRevier / ADB-Projekt).
Zeigt Forschungseinrichtungen, Behörden und Partner auf einer Leaflet.js-Karte mit Filterfunktion.

**Hauptdatei**: `index.html` — alle Karten-Logik, Filter, Marker-Rendering in einer Datei (Vanilla JS + Leaflet.js).

---

## 📋 Offene Feature-Aufgaben für Jules

### TASK-01 — Verbesserte Detailansicht / Popup für Akteure

**Ziel**: Beim Klick auf einen Marker erscheint ein moderneres, informationsreiches Popup.

**Anforderungen:**
- Größeres, scrollbares Popup mit strukturiertem Layout (kein reines `<b>Name</b><br>`)
- Zeige alle verfügbaren Felder: Name, Organisation, Rolle/Gruppe, E-Mail, Telefon, Institution, Bereich
- Felder, die leer/null sind: **nicht anzeigen** (kein leeres `E-Mail: —`)
- `"Zur Website"` Button, wenn URL-Feld vorhanden
- Popup bleibt beim Öffnen kartenzentriert auf dem Marker
- Mobile-freundliches Popup-Design (max-width, scrollbar)

**Wo in index.html suchen**: `bindPopup`, `L.popup()`, `popupContent`

---

### TASK-02 — Kombinierte Filterlogik + URL-Parameter

**Ziel**: Aktiven Filterzustand in der URL speichern, mehrere Filter kombinierbar machen.

**Anforderungen:**
- Mehrere Filter gleichzeitig anwendbar (z.B. Gruppe **und** Freitext-Suche)
- Filterzustand in URL-Parameter schreiben: `?gruppe=Wissenschaft&q=Aachen`
- Beim Seitenaufruf mit URL-Parametern → Filter automatisch wiederherstellen
- Filter-Reset-Button: `×` oder `Alle zurücksetzen`
- Counter in der Sidebar: `3 von 47 Akteuren`

**Wo in index.html suchen**: `filterContacts`, `applyFilter`, Sidebar-HTML

---

### TASK-03 — Export-Funktion (CSV + PDF)

**Ziel**: Nutzer können die aktuell **sichtbaren (gefilterten)** Akteure exportieren.

**Anforderungen:**
- **CSV Export**:
  - Button `⬇ CSV` in der Sidebar
  - Spalten: Name, Organisation, Gruppe, E-Mail, Telefon, Ort
  - Dateiname: `Akteure_YYYY-MM-DD.csv` (Datum auto)
  - Nur die aktuell sichtbaren/gefilterten Marker exportieren
- **PDF Export**:
  - Button `⬇ PDF` in der Sidebar
  - Bibliothek: [`jsPDF`](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) via CDN
  - Liste der Akteure als druckbares PDF (Name + Organisation + Gruppe + E-Mail)
  - Dateiname: `AquaRevier_Akteure_YYYY-MM-DD.pdf`

**Wo in index.html suchen**: Sidebar-HTML, `filterContacts`, `visibleMarkers` oder ähnliche Variable

---

## 🔄 Auto-Deploy Workflow

```
git commit + git push origin main
        ↓
GitHub Actions (.github/workflows/deploy-dev.yml)
        ↓
surge deploy → https://adb-aquarevier-dev.surge.sh
        ↓ (~30 Sekunden)
Live-Preview aktualisiert ✅
```

## 🚀 Lokale Entwicklung

```bash
# Python-Server (einfachste Option)
python tools/server.py
# → http://localhost:8000

# Oder mit Node.js
npx serve .
# → http://localhost:3000
```

## 📁 Projektstruktur

```
adb_aquarevier_map_dev/
├── index.html                      ← ⭐ Haupt-App (Leaflet-Karte, alle Logik)
├── internal.html                   ← Interne Version mit vollständigen Kontakten
├── JULES_TASKS.md                  ← Aufgabenliste (detailliert)
├── README.md                       ← Diese Datei
│
├── contacts.enc                    ← Verschlüsselte Kontaktdaten (AES)
├── contacts.geojson                ← Vollständige Kontaktdaten (intern)
├── contacts_anonymized.geojson     ← Öffentliche Version (ohne E-Mail etc.)
├── contacts_2025_anonymized.geojson
│
├── gewaesser.geojson               ← Gewässernetz
├── rur_einzugsgebiet.geojson       ← Rur-Einzugsgebiet (Polygon)
├── rur_einzugsgebiet_outline.geojson
├── untersuchungsgebiet.geojson     ← Untersuchungsgebiet
├── tg_natuerlich.geojson           ← Natürliche Teilgebiete
├── tg_kanalisiert.geojson          ← Kanalisierte Teilgebiete
│
├── logos/                          ← Institutslogos (PNG/SVG)
│   ├── rwth_isa.svg
│   └── ...
│
├── tools/                          ← Hilfsskripte (nicht für Produktion)
│   ├── server.py                   ← Lokaler Dev-Server
│   ├── import_contacts.py
│   └── ...
│
└── .github/
    └── workflows/
        └── deploy-dev.yml          ← Auto-Deploy zu Surge.sh
```

## Technologie-Stack

| Technologie | Verwendung |
|---|---|
| **Leaflet.js** | Interaktive Karte |
| **OpenStreetMap** | Kartentiles |
| **GeoJSON** | Geodaten (Akteure, Gewässer, Grenzen) |
| **Vanilla JS / HTML / CSS** | Keine Build-Tools nötig |
| **Surge.sh** | Hosting (statisch) |
| **GitHub Actions** | CI/CD Auto-Deploy |

## 🌐 URLs

| | URL |
|---|---|
| **Dev-Preview** | https://adb-aquarevier-dev.surge.sh |
| **Produktion** | https://adb-aquarevier-secure.surge.sh |
| **Dev-Repo** | https://github.com/Dtunder/adb_aquarevier_map_dev |
| **Prod-Repo** | https://github.com/Dtunder/adb_aquarevier_map |
| **Actions** | https://github.com/Dtunder/adb_aquarevier_map_dev/actions |
