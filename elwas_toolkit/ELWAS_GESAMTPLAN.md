# ELWAS-WEB Gesamtplan & Analyse

Stand: 2026-07-15. Ziel dieses Dokuments: eine vollständige Landkarte davon,
was ELWAS-WEB kann, wie man jeden Teil davon automatisiert abrufen kann, und
was davon bereits gebaut/getestet ist – als Grundlage, um perspektivisch
**jeden** Datensatz der Plattform ziehen zu können, nicht nur die
Industrieeinleiter im Rheinischen Revier.

**Wichtig:** Nichts hiervon berührt die Akteurskarte (`index.html` /
`internal.html`) oder die Live-Seiten (surge.sh). Das ist reine
Daten-/Tooling-Vorbereitung.

---

## 1. Vollständiger Datenkatalog (34 Datensätze, 6 Kategorien)

Jeder Eintrag ist über eine direkte URL erreichbar (Muster:
`https://www.elwasweb.nrw.de/elwas-web/data/<pfad>.xhtml?marea=<X>&mtheme=<Y>&lindex=<Z>&nested=true`,
`jsessionid` kann weggelassen werden – wird pro Sitzung neu vergeben). Volle Liste inkl. exakter Pfade: [`sitemap_links.json`](sitemap_links.json).

### Abwasser (marea=0)
| Datensatz | Bereich | Status |
|---|---|---|
| Einleitende Betriebe | Industrielles Abwasser | ✅ In Arbeit (Rheinisches Revier, s. Abschnitt 4) |
| Kläranlagen | kommunales Abwasser | Katalogisiert, Suchfelder getestet |
| Abwasserbeseitigungskonzepte | kommunales Abwasser | Katalogisiert |
| Regenbecken/-entlastungsanlagen | Niederschlagswasser | Katalogisiert |
| Einleitungsstellen | Einleitungen | Katalogisiert |
| Messstellen | Einleitungen | Katalogisiert |
| Stand der Abwasserbeseitigung | Auswertungen | Katalogisiert |
| Überwachung Direkteinleiter | Auswertungen | Katalogisiert |
| Überwachung Indirekteinleiter | Auswertungen | Katalogisiert |
| amtl. Überwachungswerte für Anlagen | Auswertungen | Katalogisiert |
| Abwasserbeseitigungskonzepte (Auswertung) | Auswertungen | Katalogisiert |

### Grundwasser (marea=1)
| Datensatz | Status |
|---|---|
| Grundwassermessstellen | ✅ Getestet – 41.539 Treffer NRW-weit, **Excel-Export vorhanden** |

### Oberflächengewässer (marea=2)
| Datensatz |
|---|
| Daten der Kartierung (Gewässerstruktur) |
| Bauwerke |
| Stauanlagen |
| Pegel |
| Gebietsniederschläge |
| Niederschlagsstationen |
| Messstellen Chemie und Biologie (Gewässergüte) |
| Messstellen Chemie und Biologie (Auswertungen) |

### Trinkwasser (marea=3)
| Datensatz |
|---|
| Wasserschutzgebiete |
| Zentrale Wasserversorgungsanlagen (Wasserwerke) |
| Versorgungsgebiete |

### WRRL – Wasserrahmenrichtlinie (marea=4)
| Datensatz |
|---|
| Fließwasserkörper |
| Seewasserkörper |
| Grundwasserkörper |
| Maßnahmenprogramm |
| Belastungsfaktoren |
| Bewirtschaftungsziele |
| Zustand der Fließwasserkörper |
| Zustand der Seewasserkörper |

### Weitere Fachdaten (marea=5)
| Datensatz |
|---|
| Zentrale Wasserhaltungen |
| Tiefe Grundwasserkörper |
| Grubenwasseranstiegsmonitoring |
| Suche im Gewässerverlauf |

Zusätzlich existiert eine separate **Kartenanwendung** (`Karte`-Tab, WMS/Leaflet-artig) – andere UI-Schicht als die "Daten"-Anwendung, hier nicht analysiert, da für die Rheinisches-Revier-Aufgabe nicht nötig.

---

## 2. Architektur-Analyse (warum das generalisierbar ist)

Alle 34 Datensätze laufen auf demselben JSF/PrimeFaces-Unterbau. Bestätigt an
3 völlig unterschiedlichen Datensätzen (Einleitende Betriebe, Grundwassermessstellen,
Kläranlagen):

1. **Suchformular**: Selects + Textfelder, IDs folgen dem Muster
   `cContainer:cCommonBodyContainer:...:searchPanel2Col:<feld>`. Ein
   wiederkehrendes Feld ist die **Regionale-Suche** (`BR/Kreis/Gemeinde`),
   dessen Input-Feld immer auf `gemeindeName_idCommon2` endet – in allen drei
   getesteten Datensätzen identisch. D.h. ein einziger Helper
   (`fill_regional_search`) funktioniert überall.
2. **Ergebnistabelle**: `tbody.ui-datatable-data`, paginiert. Bei größeren
   Datensätzen (z.B. Grundwassermessstellen: 41.539 Treffer / 4.154 Seiten)
   gibt es einen **"Excel Export"-Button direkt im Ergebnis-Tab** – das ist
   auch der Weg, wie die bestehenden 7 Kreis-Exporte für Einleitende Betriebe
   entstanden sind (`elwas_export_*.xlsx`). **Regel: Für Listendaten immer
   zuerst den Excel-Export probieren, statt Zeilen einzeln zu scrapen.**
3. **Objektdetails**: Nach Klick auf einen Treffer öffnet sich eine
   Detailseite mit einem Dropdown, das zwischen Unteransichten wechselt
   (z.B. bei Betrieben: Stammdaten/Anfallstelle/Abwasserbehandlungsanlagen/
   Einleitungsstellen/Messstellen/Regenbecken; bei Grundwassermessstellen:
   Stammdaten/Lage/Grundwasserleiter/Ausbau/Wasserstandsganglinie/...).
   **Diese Unteransichten stecken nicht im Excel-Export** – nur hier lohnt
   sich gezieltes Playwright-Scraping (Beispiel: die Abwassermengen unter
   "Anfallstelle").

**Daraus folgt die Zwei-Wege-Strategie für jeden künftigen Datensatz:**
- Reicht die Liste/Summenspalten? → Suchformular ausfüllen → Excel-Export
  klicken → fertig (Minuten, kein Detail-Scraping nötig).
- Braucht man Werte aus einer Unteransicht der Objektdetails (wie bei uns die
  Abwassermengen)? → zusätzlich pro Treffer die Detailseite + richtigen
  Dropdown-Tab ansteuern (das ist der langsame, aber automatisierbare Teil).

---

## 3. Toolkit: [`elwas_client.py`](elwas_client.py)

Wiederverwendbares Playwright-Modul mit den Bausteinen:
- `open_dataset(page, href)` – direkte Deep-Link-Navigation zu jedem der 34
  Kataloge (aus `sitemap_links.json`), inkl. Cookie-/AGB-Dialog.
- `get_frame(page)` – abstrahiert den Unterschied zwischen "über Menü
  geklickt" (Inhalt in `mainDataIframe`) und "Deep-Link direkt geöffnet"
  (Inhalt auf Top-Level).
- `discover_search_fields(frame)` – listet bei einem neuen, noch nicht
  verdrahteten Datensatz automatisch alle Selects (mit Optionen) und
  Textfelder auf. Getestet an 3 Datensätzen, funktioniert ohne Anpassung.
- `fill_regional_search`, `submit_search`, `has_excel_export`,
  `click_excel_export`, `open_detail_row`, `get_detail_tab_options`,
  `switch_detail_tab`, `extract_field` – die generischen Bausteine für den
  Rest des Ablaufs.

**Damit lässt sich ein neuer Datensatz typischerweise in wenigen Minuten
anbinden:** `python elwas_client.py "<Name aus dem Katalog>"` zeigt sofort
die Suchfelder, danach braucht es nur noch ein kurzes Skript im Stil von
`elwas_raw_data/scrape_details.py`, das die konkreten Feld-IDs anspricht.

---

## 4. Laufende Arbeit: Industriebetriebe Rheinisches Revier

(Details/Rohdaten in `../elwas_raw_data/`)

- 101 Betriebe (7 Kreise × Anhänge 28/38/22/55/40/29/3/10) bereits gefiltert
  in `matching_companies.csv` (aus den 7 Kreis-Excel-Exporten).
- `scrape_details.py` (repariert, Pfade korrigiert, erfasst jetzt zusätzlich
  Bezeichnung/Abwasserbeschaffenheit/Anhang pro Anfallstelle) läuft im
  Hintergrund und ergänzt UTM-Koordinaten + Abwassermengen je Anfallstelle.
  Fortschritt wird laufend in `scrape_progress.json` gesichert (resumable).
- Noch offen (nach Abschluss des Scrapes): UTM→WGS84-Umrechnung (pyproj),
  GeoJSON-Bau, danach – nur nach Rücksprache – Layer-Code für
  `index.html`/`internal.html`.

---

## 5. Nicht-Ziele / Grenzen dieses Plans

- Es wurden **nicht** alle 34 Datensätze tatsächlich heruntergeladen – nur
  katalogisiert und das Zugriffsmuster bestätigt. Volles Herunterladen
  (insbesondere Grundwassermessstellen mit 41k Treffern oder Gewässergüte)
  macht nur Sinn, sobald ein konkreter Bedarf dafür besteht.
- Keine Änderung an der Akteurskarte oder den Live-URLs (surge.sh,
  internal.html-Editor). Das bleibt ein separater, später abzustimmender
  Schritt.
- Rechtlich: ELWAS-WEB-Daten stehen unter "Datenlizenz Deutschland –
  Namensnennung – Version 2.0" (Namensnennungspflicht bei Weiterverwendung).
