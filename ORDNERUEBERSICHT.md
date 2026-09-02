# Live-Webseiten & Ordnerübersicht

## 🌐 Live-Webseiten Links
- **Öffentliche Karte (Anonymisiert)**: [https://adb-aquarevier-secure.surge.sh/](https://adb-aquarevier-secure.surge.sh/)
- **Interne Verwaltungskarte (Vollzugriff & Editor)**: [https://adb-aquarevier-secure.surge.sh/internal.html](https://adb-aquarevier-secure.surge.sh/internal.html)
- **Lokale Entwicklungsumgebung**: `http://localhost:8000` (Öffentlich) und `http://localhost:8000/internal.html` (Intern)

---

## 📁 Ordnerstruktur und wichtigste Dateien

### 📄 Haupt-Webseiten & Konfiguration
- `index.html` - Öffentliche, anonymisierte Kartenansicht.
- `internal.html` - Interne Kartendarstellung mit Bearbeitungsmöglichkeiten und detaillierten Kontaktdaten.
- `package.json` & `package-lock.json` - Npm-Konfiguration und Abhängigkeiten.
- `playwright.config.js` - Konfiguration für UI-Regressionstests mit Playwright.
- `server.py` - Lokaler Python-Webserver.
- `manifest.json` / `oembed.json` - Web-App-Manifest und oEmbed-Konfiguration für Einbettungen.

### 📂 Verzeichnisse
- `css/` - Stylesheets für das Design und Layout der Anwendung.
- `js/` - Frontend JavaScript-Logik (z. B. `app.js`, `layers-loader.js`, `layers-config.js`, `ai-assistant.js`, `mascot.js`, `gemeinde-steckbrief.js`).
- `docs/` - Projektdokumentation und weiterführende Anleitungen.
- `tools/` - Python- und Node.js-Skripte für Datenverarbeitung, Build-Prozesse und Deployment (`deploy_surge.py`, `synthetic_watchdog.py`, etc.).
- `tests/` - Playwright UI-Regressionstests (`tests/ui-regression/`).
- `vendor/` - Externe CSS/JS-Bibliotheken (z. B. Leaflet, Tippy.js).
- `scripts/` - Hilfsskripte zur Datenaufbereitung.
- `legal/` - Rechtliche Dokumente (Datenschutz, Impressum).
- `logos/` - Logo- und Grafikelemente.
- `changelog/` - Änderungshistorie des Projekts.
- `editor_backend/` - Backend-Komponenten für den Editor-Modus.
- `elwas_raw_data/` & `elwas_toolkit/` - Rohdaten und Hilfswerkzeuge für ELWAS-Gewässerdaten.

### 🗺️ GeoJSON-Geodaten
- `contacts.geojson` - Vollständige Akteursdatenbank für die interne Ansicht.
- `contacts_anonymized.geojson` - Anonymisierte Akteursdatenbank für die öffentliche Ansicht.
- `pegel.geojson` - Messstellen und Wasserstände (ELWAS).
- `klaeranlagen.geojson` - Kläranlagen-Datensatz.
- `grundwassermessstellen.geojson` - Grundwassermessstellen.
- `gewaesser.geojson` / `gewaesser_rur_official.geojson` - Gewässernetze.
- `kreise_scorecard.geojson` / `kreise_rr.geojson` - Kreisgrenzen und Choroplethen-Daten.
- `stauanlagen.geojson`, `regenbecken.geojson`, `querbauwerke.geojson` - Weitere wasserwirtschaftliche Infrastrukturdaten.

### 📚 Dokumentation
- `README.md` - Hauptprojektdokumentation.
- `FLORIAN_ANLEITUNG.md` & `FLORIAN_ANLEITUNG.pdf` - Anleitung zur Verwaltung der Karte.
- `Aquarevier_Map_Backlog.md` - Backlog und Anforderungsspezifikation.
- `ORDNERUEBERSICHT.md` - Diese Datei (Übersicht der Links und Ordnerinhalte).
