# Implementation Plan: ELWAS-WEB Datenintegration in AquaRevier-Karte

Dieses Vorhaben beschreibt die Integration von industriellen Abwassereinleitern aus der NRW-Landesdatenbank ELWAS-WEB in die bestehende AquaRevier-Webkarte.

## Vorgehen & Technische Umsetzung

Da die manuelle Extraktion über den Browser vermieden werden soll, wird ein automatisiertes Python-Skript entwickelt, das die Daten direkt von ELWAS-WEB abruft, verarbeitet und in die bestehende Webkarte integriert.

### 1. Datenbeschaffung (Headless Scraper)
* Wir erstellen ein Python-Skript (z. B. `scrape_elwas.py`), welches:
  * Entweder direkt über HTTP-Anfragen (POST-Requests auf die JSF/XHTML-Schnittstellen von ELWAS-WEB) oder mittels eines headless Browsers (z. B. Playwright im Hintergrund) die Suche ausführt.
  * Nach den 7 Kreisen filtert: Aachen (05334), Heinsberg (05370), Mönchengladbach (05116), Rhein-Kreis-Neuss (05162), Düren (05358), Rhein-Erft-Kreis (05362), Euskirchen (05366).
  * Nach Einleitungsart filtert: Direkt- und Indirekteinleiter.
* Das Skript liest die Ergebnisseite aus und klickt (headless) auf jeden einzelnen Betrieb, um die Detailseiten zu laden und unter „Anfallstellen“ nach den maximalen Abwassermengen (z. B. `m³/a` oder `m³/d`) zu suchen.

### 2. Datenfilterung & Aufbereitung
Die Betriebe werden nach den gewünschten Industriezweigen gefiltert, indem das Feld „Anhang der Abwasserverordnung (AbwV)“ ausgewertet wird:
* **Papierindustrie:** Anhang 28
* **Textilindustrie:** Anhang 38
* **Chemieindustrie:** Anhang 22, Anhang 55
* **Metallindustrie:** Anhang 40, Anhang 29
* **Lebensmittelindustrie:** Anhang 3, Anhang 10

Die gefilterten Daten werden in einer strukturierten GeoJSON-Datei (`elwas_einleiter.geojson`) gespeichert. Jeder Punkt enthält:
* Name des Betriebs
* Koordinaten (georeferenziert)
* Industriezweig / AbwV-Anhang
* Einleitungsart (direkt / indirekt)
* Maximale Abwassermenge (falls vorhanden)

### 3. Integration in die Webkarte (Frontend)
* Die Datei `elwas_einleiter.geojson` wird im Projektverzeichnis abgelegt.
* In [index.html](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/index.html) und [internal.html](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/internal.html) integrieren wir einen neuen Vektor-Layer (z. B. *„ELWAS Industrie-Einleiter“*), der über die Layer-Steuerung oben rechts ein- und ausgeblendet werden kann.
* Die Popups der Punkte auf der Karte werden so gestaltet, dass sie die spezifischen ELWAS-Daten (Einleitungsart, AbwV-Anhang, Abwassermengen) übersichtlich und modern anzeigen.
* Wir fügen Filtersteuerungen in der Sidebar hinzu, damit Florian nach den 5 Industriezweigen filtern kann.

---

## User Review Required

> [!IMPORTANT]
> Da ELWAS-WEB eine JSF-basierte Anwendung (`.xhtml`) mit Sitzungsstatus ist, sind reine HTTP-Requests oft instabil. Die Verwendung eines headless Python-Skripts mit `playwright` (das im Hintergrund ohne sichtbares Browser-Fenster läuft) ist die robusteste Lösung. Hierzu müssten wir einmalig `playwright` in der virtuellen Umgebung installieren:
> ```powershell
> .\.venv\Scripts\python -m pip install playwright
> .\.venv\Scripts\python -m playwright install chromium
> ```

---

## Verification Plan

### Automated Steps
1. Skript `scrape_elwas.py` ausführen und prüfen, ob die Datei `elwas_einleiter.geojson` korrekt erzeugt wird und Betriebe enthält.
2. Prüfen, ob die Koordinaten im Rheinischen Revier liegen und valide GeoJSON-Syntax aufweisen.

### Manual Verification
1. Öffnen der lokalen Karte `http://localhost:8000` und Prüfen, ob der neue Layer geladen wird.
2. Testen der Filter für die 5 Branchen und Klick auf die Marker, um die Popups mit den Abwassermengen zu verifizieren.
