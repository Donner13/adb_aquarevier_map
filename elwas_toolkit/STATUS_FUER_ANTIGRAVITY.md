# Status-Uebergabe (Claude -> Antigravity)

Stand: 2026-07-15 abends. Alles unten liegt direkt in diesem Projektordner
(`contact_map/`), also dort wo Antigravity ohnehin schon arbeitet.

**Pfad zu diesem Dokument:**
`C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\elwas_toolkit\STATUS_FUER_ANTIGRAVITY.md`

**Warum diese Uebergabe:** Claude hat heute viel Quota fuer diese Session
verbraucht. Naechste Schritte (siehe Abschnitt 2) soll Antigravity
umsetzen; Claude schaut in einer spaeteren Session drueber (Review, kein
Blocker fuer Antigravity).

---

## 1. Fertig und LIVE (deployed, ueberprueft, Stand heute)

Alle 4 bisherigen ELWAS-Datensaetze sind fertig integriert (nicht mehr nur
teilweise wie in der letzten Version dieses Dokuments):

- **Industrieeinleiter** (101 Betriebe, 7 Kreise, 8 AbwV-Anhaenge) +
  **Einleitungsstellen** (Gewaesser-Verbindungslinien, 8/101 echte
  Direkteinleiter) -> `elwas_einleiter.geojson`.
- **Klaeranlagen** (60, alle 7 Kreise) -> `klaeranlagen.geojson`.
- **Grundwassermessstellen** (4410 aktiv) -> `grundwassermessstellen.geojson`.
- **Pegel** (46, mit NQ/MQ/HQ) -> `pegel.geojson`. NQ heute ergaenzt
  (Spalte 9 in der Pegel-Ergebnistabelle, gleiche Zeile wie MQ=11/HQ=13,
  kein separater Scrape noetig).
- **NEU heute: Einzugsgebiet-Statistik** - echter Spatial Join (shapely,
  Point-in-Polygon) zwischen `elwas_einleiter.geojson` und
  `rur_einzugsgebiet.geojson` (131 Teileinzugsgebiete). Skript:
  `elwas_raw_data/build_catchment_stats.py` -> `rur_einzugsgebiet_stats.geojson`.
  Zeigt Betriebsanzahl + summierte Abwassermenge pro Teilgebiet als
  Choroplethen-Layer (Hover/Popup) in `index.html`/`internal.html`.

Alles committed + gepusht (Commit `4559b46`), live auf
https://adb-aquarevier-secure.surge.sh verifiziert (Playwright,
0 Konsolenfehler). Deploy laeuft ueber die beiden Surge.sh-GitHub-Actions
(Produktion + Dev) - die dritte Action "Deploy Static Content to Pages"
schlaegt fehl (GitHub Pages ist in den Repo-Settings nicht aktiviert),
das ist vorbestehend/unabhaengig von den Inhalten, kein Handlungsbedarf
ausser jemand will das Repo tatsaechlich zusaetzlich ueber GitHub Pages
ausliefern.

## 2. Naechste Schritte: 3 weitere Datensaetze, klar zum Scrapen

Der Nutzer will schrittweise moeglichst viele ELWAS-WEB-Funktionen/Datensaetze
integrieren (nicht wahllos alle 35, siehe Abschnitt 3 fuer die Begruendung
und Priorisierung). Ein Recon-Durchlauf heute (26 parallele Probe-Agents,
volle Rohdaten in `elwas_toolkit/dataset_recon_2026-07-15.json`) hat 3
Datensaetze identifiziert, die **exakt demselben Muster** wie die 4 bereits
integrierten folgen (Standard-Regionalsuche + Koordinaten auf der
Detailseite) - diese sind die naechsten Kandidaten, kein Recon mehr noetig,
direkt umsetzbar nach dem bewaehrten Muster
(`elwas_raw_data/scrape_pegel.py` oder `scrape_klaeranlagen.py` als
Vorlage nehmen):

### a) Stauanlagen
- Href: `/elwas-web/data/ow/anlagen/stauanlagen/stauanlagen.xhtml`
- Standard-Regionalsuche vorhanden (`gemeindeName_idCommon2`).
- **Koordinaten NUR auf der Detailseite**, direkt im Stammdaten-Text (KEIN
  separater "Lage"-Tab wie bei Pegel/Klaeranlagen - die Detail-Tabs sind
  Stammdaten/Betreiber/Absperrbauwerk/Stauwerte/hydrologische
  Kenngroessen/Einzugsgebiet/Nutzungen/Sedimentationsbecken, Ostwert/Nordwert
  stehen direkt im Stammdaten-Default-Tab).
- 10 Treffer bei Duren (Stichprobe), 7-Kreise-Gesamtgroesse nicht geprueft.

### b) Regenbecken/-entlastungsanlagen
- Href: `/elwas-web/data/abw/niedersch/anl/t80Sonderbauwerk.xhtml`
- Standard-Regionalsuche vorhanden. Zusaetzliche Filter: Typ
  (RRB/RKB/RBF/BF/RUET/RUEM/RUEB/SK/RST/AL), Abwasserbereich
  (kommunal/industriell), Entwaesserungsverfahren (Trenn/Misch).
- **Koordinaten**: kein eigener "Lage"-Tab, aber die Stammdaten-Detailseite
  hat eine "Lage"-Unterrubrik mit Ostwert/Nordwert (Beispiel gesehen:
  Merzenich RKB, Ostwert 326731 / Nordwert 5632451).
- Thematisch besonders relevant: verbindet sich inhaltlich direkt mit dem
  Industrieeinleiter-Thema (kommunale vs. industrielle Regenwasserbehandlung).

### c) Bauwerke (Querbauwerke)
- Href: `/elwas-web/data/ow/anlagen/querbauwerk/querbauwerk.xhtml`
- Standard-Regionalsuche vorhanden. Filter: Zustaendige Behoerde,
  Bauwerksart (Fischaufstieg/Querbauwerk/sonstiges Bauwerk/
  Wasserkraftanlage), Bauwerkstyp.
- **Koordinaten** direkt im Stammdaten-Detailtext (kein Tab-Dropdown auf
  der Detailseite bei diesem Datensatz - `get_detail_tab_options` liefert
  eine leere Liste, einfach direkt den Body-Text nach Ostwert/Nordwert
  durchsuchen).
- **Cold-Session-Falle beobachtet**: `discover_search_fields()` direkt nach
  `open_dataset()` kann 0 Selects/Inputs finden, weil das Formular im
  iframe noch nicht fertig gerendert ist. Fix: nach `get_frame()` explizit
  warten z.B. `await frame.wait_for_selector("input[value='Suchen'], select", state="attached", timeout=8000)`,
  bevor man das Formular inspiziert.

**Vorgehen wie gewohnt** (siehe [[aquarevier_collaboration_pattern]] falls
das gelesen werden kann, sonst: Muster aus den 4 bestehenden Skripten
uebernehmen): `scrape_*.py` pro Datensatz -> `build_*_geojson.py`
(UTM 25832 -> WGS84 via pyproj) -> `*.geojson` nach Projekt-Root kopieren
-> Leaflet-Layer in `index.html` UND `internal.html` (beide synchron
halten!) -> lokal mit Playwright testen (Konsolenfehler + Popup-Inhalt
pruefen, nicht nur "keine Exception") -> committen -> pushen (Auto-Deploy)
-> live mit Playwright verifizieren.

## 3. Datensaetze OHNE brauchbare Koordinaten oder mit Sonderfaellen

(Vollstaendige Rohdaten mit allen Beobachtungen: `dataset_recon_2026-07-15.json`)

**Map-Widget-Datensaetze (nicht mit dem Standard-Toolkit scrapbar):**
Messstellen (Abwasser/Einleitung), Messstellen Chemie und Biologie
(Basis-Datensatz), Ueberwachung Direkteinleiter, Ueberwachung
Indirekteinleiter. Diese oeffnen direkt eine Kartenanwendung
("Karte"-Navigationspunkt) statt der ueblichen Formular+Tabelle-Ansicht -
kein `gemeindeName_idCommon2`-Feld, keine `tbody.ui-datatable-data`-Tabelle,
nur ein Orts-Autocomplete zum Verschieben der Karte. Wuerde
Marker-Interaktion im (lazy-loaded) `mapIframe` oder das Reverse-Engineering
der zugrunde liegenden Karten-AJAX-Calls (`mapRequest`/`mapSubmitRequest`)
brauchen - deutlich mehr Aufwand, hier NICHT als naechster Schritt
empfohlen.

**Bereits ueber LANUV-WMS-Layer abgedeckt (keine ELWAS-Extraktion noetig):**
Wasserschutzgebiete, Fliesswasserkoerper, Seewasserkoerper,
Grundwasserkoerper - das sind Flaechen-/Liniengeometrien (kein
Ostwert/Nordwert-Punkt, daher im Recon als "keine Koordinaten" markiert),
aber visuell schon vorhanden ueber die bestehenden WMS-Overlays
("Wasserschutzgebiete (LANUV)", "Einzugsgebiete Hydrologisch (LANUV)",
"Fluesse & Gewaesser (LANUV)", "Gewaessernetz Detailliert (LANUV)") in
`index.html`. Nur relevant, falls Florian explizit ELWAS-spezifische
Sachdaten (nicht nur die Geometrie) zu diesen Objekten braucht.

**Grosse Auswertungs-/Report-Datensaetze, Koordinaten NICHT abschliessend
geklaert (Recon hat bei >20 Treffern die Detailseiten-Pruefung
uebersprungen, das ist eine Recon-Beschraenkung, keine Bestaetigung dass
es wirklich keine Koordinaten gibt):**
- Messstellen Chemie und Biologie (Auswertung) - 4883 Zeilen, zweistufiges
  Vorauswahl-Formular (Fachbereich + Auswertungstyp waehlen -> "Start"
  statt "Suchen"), Ergebnistabelle ist eine Checkbox-Mehrfachauswahl fuer
  Report-Export, kein normaler Detail-Link pro Zeile.
- Zustand der Fliesswasserkoerper - 1684 Zeilen, gleiches
  Vorauswahl-Muster, danach aber ein normales Suchformular mit
  `gemeindeName_idCommon2` verfuegbar.
- Zustand der Seewasserkoerper - 49 Zeilen, gleiches Vorauswahl-Muster,
  aber NUR Checkbox-Zeilen ohne Detail-Link (kein Objektdetails-Zugang
  ueberhaupt).
- Falls diese interessant sind: zuerst pruefen ob ein Excel-Export-Button
  auf der zweiten Stufe existiert (in diesem Recon-Pass nicht geprueft) -
  das waere bei diesen Zeilenzahlen ohnehin sinnvoller als Row-by-Row-Scraping.

**Reine Statistik-/Report-Generatoren (keine Einzelobjekte, keine
Koordinaten, wahrscheinlich uninteressant fuer die Karte):** Stand der
Abwasserbeseitigung, Abwasserbeseitigungskonzepte (+ Auswertung),
Belastungsfaktoren, Bewirtschaftungsziele, Massnahmenprogramm,
Versorgungsgebiete, amtl. Ueberwachungswerte fuer Anlagen, Daten der
Kartierung, Zentrale Wasserversorgungsanlagen. Liefern aggregierte
Zahlen/Konfigurationsdaten, keine Punktobjekte.

**Vermutlich doch Koordinaten, aber nicht geprueft (False Negative
moeglich):** Niederschlagsstationen - hat die Standard-Regionalsuche,
10 Treffer bei Duren, aber die Liste selbst zeigt keine Ostwert/Nordwert-
Spalten und die Detailseiten-Pruefung wurde bei genau 10 Zeilen
uebersprungen (Recon-Schwelle lag bei 1-5 Zeilen fuer den teuren
Detail-Check). Eine Niederschlagsstation ist praktisch sicher ein
Punktobjekt wie ein Pegel - lohnt sich, das mit einem einzelnen
`open_detail_row`-Test nachzupruefen, bevor man es verwirft.

## 4. Wichtige technische Erkenntnisse (gelten uebergreifend)

- Vollstaendiger Katalog aller 35 ELWAS-Datensaetze + Deep-Links:
  `elwas_toolkit/sitemap_links.json`.
- Wiederverwendbares Playwright-Toolkit: `elwas_toolkit/elwas_client.py`.
- Regionalsuche "BR/Kreis/Gemeinde" (Feld-ID endet auf
  `gemeindeName_idCommon2`): AJAX-Ergebnistabelle erscheint nach dem
  Tippen, man MUSS den Link "Uebernehmen" klicken (nicht nur tippen +
  absenden). Kein `.fill('')` vor dem Tippen (loest Refresh aus, Feld wird
  detached). Namen ohne "Kreis"-Praefix: "Heinsberg", "Duesseldorf" etc.
  ausser "Rhein-Kreis Neuss"/"Rhein-Erft-Kreis" (Praefix ist Teil des
  Eigennamens).
- **PrimeFaces-IDs mit Doppelpunkt**: `frame.locator(f'#{id}')` schlaegt
  fehl, wenn die ID einen (unescapten) Doppelpunkt enthaelt (haeufig bei
  PrimeFaces). Stattdessen `select[id='...']`-Attribut-Selektor oder
  `.nth()`-Index verwenden.
- **Cold-Session-Formular-Race**: `discover_search_fields()` direkt nach
  `open_dataset()`/`get_frame()` kann 0 Felder finden, weil das iframe-
  Formular noch per AJAX nachlaedt. Erst auf `input[value='Suchen'], select`
  warten (`state="attached"`, ~8s Timeout), dann inspizieren.
- **Zweistufige "Vorauswahl"-Datensaetze** (WRRL-Auswertungen, Messstellen
  Chemie/Biologie-Auswertung): erste Seite hat KEIN
  `input[value='Suchen']`, sondern `input[value='Start']` nach Wahl von
  Fachbereich/Auswertungstyp. `submit_search()` aus dem Toolkit greift da
  nicht direkt.
- **Kartenanwendungs-Seiten** (statt Formular+Tabelle): erkennbar an
  fehlendem `gemeindeName_idCommon2`, 0 `<select>`-Elementen, und einem
  einzelnen Autocomplete-Input mit `mapSubmitRequest`/`mapRequest` im DOM.
  Aktuelles Toolkit ist dafuer nicht ausgelegt.
- Excel-Export-Button existiert bei manchen Datensaetzen, hat sich aber in
  frueheren Tests (Grundwassermessstellen, Klaeranlagen) im headless
  Playwright nicht zuverlaessig ausloesen lassen - Detailseiten-Scraping
  war robuster.

## 5. Vorschlag fuer die Reihenfolge

1. Stauanlagen, Regenbecken/-entlastungsanlagen, Bauwerke (Querbauwerke) -
   direkt umsetzbar, gleiche Vorlage wie bisher.
2. Niederschlagsstationen kurz nachpruefen (1 Detailseiten-Test reicht).
3. Erst danach ueber die Auswertungs-/Kartenanwendungs-Datensaetze
   nachdenken (deutlich mehr Aufwand pro Datensatz) - mit dem Nutzer
   ruecksprechen, ob die ueberhaupt gebraucht werden, bevor viel Zeit
   reingeht.

## 6. Update von Antigravity (2026-07-15)

In dieser Session wurden die Vorbereitungen für die drei neuen Datensätze abgeschlossen, bevor der Nutzer den Laptop mitnehmen musste:

### Was wurde erledigt?
1. **Scraper- & Builder-Skripte erstellt:**
   - [scrape_stauanlagen.py](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/elwas_raw_data/scrape_stauanlagen.py) (Koordinaten direkt aus dem Stammdaten-Text extrahiert; Fix für ID- und Name-Auslesung).
   - [scrape_regenbecken.py](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/elwas_raw_data/scrape_regenbecken.py) (Robuster Extraktions-Fallback für `Ostwert`/`Nordwert` enthalten).
   - [scrape_querbauwerke.py](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/elwas_raw_data/scrape_querbauwerke.py) (Wartet explizit auf Rendering-Settle bei Cold-Sessions).
   - Die entsprechenden GeoJSON-Builder in `elwas_raw_data/build_<name>_geojson.py` mit `pyproj`-Transformation (EPSG:25832 -> EPSG:4326).
2. **Stauanlagen teilweise gescraped:**
   - 37 Stauanlagen (Aachen, Heinsberg, Mönchengladbach, Rhein-Kreis Neuss und Düren) wurden erfolgreich gescraped.
   - [stauanlagen.geojson](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/stauanlagen.geojson) enthält bereits diese 37 Datensätze mit korrekten WGS84-Koordinaten.
3. **Template-GeoJSONs erstellt:**
   - Für die noch nicht gescrapten Datensätze wurden leere GeoJSONs ([regenbecken.geojson](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/regenbecken.geojson) und [querbauwerke.geojson](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/querbauwerke.geojson)) angelegt, um 404-Fehler in den HTML-Seiten zu vermeiden.
4. **Leaflet-Karten-Integration synchronisiert:**
   - In [index.html](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/index.html) und [internal.html](file:///C:/Users/user/.gemini/antigravity-ide/scratch/contact_map/internal.html) wurden die 3 Layer (`stauanlagenLayer`, `regenbeckenLayer`, `querbauwerkeLayer`) mit passenden CSS-Farben (Orange/Cyan/Violett), Symbolen (⛰️/🌧️/🧱) und aufbereiteten Info-Popups integriert und in `overlayMaps` registriert.

### Was ist noch offen?
- **Rest-Scrape durchführen:**
  - Sobald der Laptop wieder online ist, können die restlichen Kreise für Stauanlagen geladen werden (einfach `python elwas_raw_data/scrape_stauanlagen.py` laufen lassen, es überspringt bereits vorhandene Datensätze automatisch).
  - Skripte für Regenbecken (`scrape_regenbecken.py`) und Querbauwerke (`scrape_querbauwerke.py`) ausführen.
  - Anschließend die GeoJSON-Builder erneut ausführen, damit die Karten-Layer vollständig befüllt werden.

