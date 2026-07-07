# JULES TASK LIST — AquaRevier Dev Map
## Für Jules: Aktuelle Feature-Aufgaben

> **Wichtig**: Dieses Repo ist die **Entwicklungsversion** der AquaRevier Akteurskarte.
> Die Produktionsversion läuft auf https://adb-aquarevier-secure.surge.sh
> Diese Dev-Version wird automatisch auf https://adb-aquarevier-dev.surge.sh deployed (via GitHub Actions).

---

## 🎯 Offene Tasks (Priorität: Hoch)

### TASK-01: Verbesserte Detailansicht / Popup für Akteure
**Status**: `[ ] Offen`

Beim Klick auf einen Marker soll ein moderneres, informationsreiches Popup erscheinen.

**Anforderungen:**
- Größeres, scrollbares Popup mit strukturiertem Layout
- Zeige alle verfügbaren Felder: Name, Organisation, Rolle/Gruppe, E-Mail, Telefon, Institution, Bereich
- Wenn Felder leer sind: elegant ausblenden (kein leeres Label)
- "Zur Website" Button wenn URL vorhanden
- Optional: Karte bleibt zentriert auf dem Marker beim Öffnen
- Mobile-freundliches Popup-Design

**Relevante Datei**: `index.html` — Suche nach `L.popup()` oder `bindPopup`

---

### TASK-02: Kombinierte Filterlogik + URL-Parameter
**Status**: `[ ] Offen`

Die aktuelle Filterlogik soll erweitert werden:

**Anforderungen:**
- Mehrere Filter kombinierbar (z.B. Gruppe + Stichwort gleichzeitig)
- Aktiver Filterzustand in URL-Parametern speichern (`?gruppe=Wissenschaft&q=Aachen`)
- URL teilbar — beim Öffnen werden Filter automatisch wiederhergestellt
- Filter-Reset-Button (alles zurücksetzen)
- Anzahl der gefilterten Ergebnisse anzeigen (`3 von 47 Akteuren`)

**Relevante Datei**: `index.html` — Suche nach `filterContacts()` oder `applyFilter`

---

### TASK-03: Export-Funktion (CSV + PDF)
**Status**: `[ ] Offen`

Nutzer sollen die sichtbaren (gefilterten) Akteure exportieren können.

**Anforderungen:**
- **CSV Export**: Alle sichtbaren Marker als CSV herunterladen (Name, Organisation, Gruppe, E-Mail)
- **PDF Export**: Liste als druckbares PDF (Bibliothek: `jsPDF` via CDN)
- Export-Button in der Sidebar (nur für sichtbare/gefilterte Ergebnisse)
- Datum im Dateinamen: `Akteure_2026-07-07.csv`

**Relevante Datei**: `index.html` — neue Buttons in der Sidebar hinzufügen

---

## ✅ Erledigte Tasks

*(Noch keine)*

---

## 🔧 Setup für Entwicklung

```bash
# Lokaler Dev-Server starten
python server.py
# Browser öffnen: http://localhost:8000

# Deploy auf Dev-Surge (manuell)
npx surge . adb-aquarevier-dev.surge.sh
```

## 📁 Projektstruktur

```
contact_map_dev/
├── index.html          ← Haupt-App (alle Karten-Logik)
├── internal.html       ← Interne Version mit mehr Infos
├── contacts.enc        ← Verschlüsselte Kontaktdaten
├── contacts.geojson    ← Kontaktdaten (GeoJSON)
├── contacts_anonymized.geojson  ← Anonymisierte Version
├── gewaesser.geojson   ← Gewässernetz
├── rur_einzugsgebiet.geojson    ← Einzugsgebiet Rur
├── logos/              ← Institutslogos
└── .github/workflows/deploy-dev.yml  ← Auto-Deploy CI/CD
```

## 🌐 URLs

| | URL |
|---|---|
| **Produktion** | https://adb-aquarevier-secure.surge.sh |
| **Dev/Preview** | https://adb-aquarevier-dev.surge.sh |
| **Prod-Repo** | https://github.com/Dtunder/adb_aquarevier_map |
| **Dev-Repo** | https://github.com/Dtunder/adb_aquarevier_map_dev |
