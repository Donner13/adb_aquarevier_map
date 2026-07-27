---
project: Aquarevier_Map_Backlog
status: active
path: G:\Meine Ablage\Antigravity\10_Projects\Aquarevier_Map_Backlog.md
last_updated: 2026-07-17
---

# AquaRevier — Konsolidierter Vorschlags-Backlog & Ideation (Volltext)

Dieses Dokument enthält den vollständigen Text inklusive aller Antigravity-Aufträge für Runde 1 und Runde 2 sowie die Entwürfe für Runde 3.

---

# Runde 1 (Volltext)

# AquaRevier — 15 weitere Vorschläge + Antigravity-Aufträge

Generiert aus 39 Rohvorschlägen (5 Perspektiven: Hydrologie, Stakeholder, Daten, UX, Performance), auf 15 verdichtet und priorisiert nach Mehrwert für Florians Strukturwandel-Stakeholder-Zweck.

Jeder Abschnitt enthält einen vollständigen, copy-paste-fertigen Auftrag für Antigravity — inkl. Explorationsschritten, exaktem Website-Verhalten und Pflicht zum echten Daten-Spotcheck vor der 'fertig'-Meldung.

---

## Inhaltsverzeichnis

1. [Daten-Transparenz-Panel pro Layer (Quelle, Stand, Validierungsstatus)](#1-daten-transparenz-panel-pro-layer-quelle-stand-validierungsstatus) — *Stakeholder*
2. [Automatisiertes Datenqualitäts-Gate (Pre- und Post-Scrape)](#2-automatisiertes-datenqualitaets-gate-pre--und-post-scrape) — *Daten*
3. [Gemeinde-Steckbrief ("Was bedeutet das für uns?")](#3-gemeinde-steckbrief-"was-bedeutet-das-fuer-uns?") — *Stakeholder*
4. [Grundwassergleichenplan (Isolinien statt Einzelpunkte)](#4-grundwassergleichenplan-isolinien-statt-einzelpunkte) — *Hydrologie*
5. [Historische Grundwasserstands-Zeitraffer-Animation](#5-historische-grundwasserstands-zeitraffer-animation) — *Hydrologie*
6. [Kreis-Choropleth + Vergleichsscorecard mit Bevölkerungsbezug](#6-kreis-choropleth-+-vergleichsscorecard-mit-bevoelkerungsbezug) (ERLEDIGT) — *Stakeholder*
7. [Präsentations-/Beamer-Modus mit geführter Klickfolge](#7-praesentations-beamer-modus-mit-gefuehrter-klickfolge) (ERLEDIGT) — *Stakeholder*
8. [Laien-Glossar-Modus](#8-laien-glossar-modus) (ERLEDIGT) — *UX*
9. [Wasserschutzgebiete (Trinkwasserschutzzonen I/II/III) als Overlay](#9-wasserschutzgebiete-trinkwasserschutzzonen-iiiiii-als-overlay) (ERLEDIGT) — *Hydrologie*
10. [Config-getriebene Layer-Architektur mit durchgängigem Lazy-Loading](#10-config-getriebene-layer-architektur-mit-durchgaengigem-lazy-loading) (ERLEDIGT) — *Performance*
11. [Hochwasser- und Starkregengefahrenkarten](#11-hochwasser--und-starkregengefahrenkarten) (ERLEDIGT) — *Hydrologie*
12. [Geometrie-Vereinfachung als Build-Step vor dem Deploy](#12-geometrie-vereinfachung-als-build-step-vor-dem-deploy) (ERLEDIGT) — *Performance*
13. [Offline-Feldmodus (PWA + Tile-Caching)](#13-offline-feldmodus-pwa-+-tile-caching) (ERLEDIGT) — *UX*
14. [Barrierefreiheit: Tastatur/Screenreader-Zugänglichkeit + Kontrastmodus](#14-barrierefreiheit:-tastaturscreenreader-zugaenglichkeit-+-kontrastmodus) (ERLEDIGT) — *UX*
15. [Golden-Sample-Regressionstest für Extraktionslogik](#15-golden-sample-regressionstest-fuer-extraktionslogik) (ERLEDIGT) — *Daten*

---

## 1. Daten-Transparenz-Panel pro Layer (Quelle, Stand, Validierungsstatus) (ERLEDIGT)

**Kategorie:** Stakeholder

**Mehrwert:** Nach dem Querbauwerke/Stauanlagen-Vorfall (2026-07-15) ist Datenglaubwürdigkeit selbst ein Präsentationsargument gegenüber Politik/Industrie/Gremien. ELWAS-WEB zeigt weder Herkunft noch Aktualität noch Validierungsstatus einer Zeile — genau das untergräbt Florians Position, wenn Zahlen hinterfragt werden. Verschmilzt die Rohvorschläge Transparenzpanel, Metadaten+Changelog, Staleness-Anzeige und Qualitäts-Footer zu einer einzigen sichtbaren Vertrauens-Komponente.

**Technischer Ansatz (Kurzfassung):** Pro Layer ein kompaktes Info-Panel/Fußzeile, gespeist aus Build-Metadaten (scraped_at, source_url, Objektanzahl, Diff zum Vorlauf via diff_geojson.py, Validierungsstatus aus dem Quality-Gate). Wird automatisch in den bestehenden PDF/PNG-Export übernommen; bei Warnstatus sieht Florian vor jeder Präsentation sofort, welchen Layer er lieber nicht ungeprüft zeigt.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag für Antigravity: Daten-Transparenz-Panel pro Layer (Quelle, Stand, Validierungsstatus)

KONTEXT
Repo: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (github.com/Dtunder/adb_aquarevier_map, Branch main). Push auf origin/main deployt automatisch via GitHub Actions (.github/workflows/deploy-secure.yml) auf https://adb-aquarevier-secure.surge.sh (index.html = öffentliche Karte). internal.html ist Florians Editor-Tool, strukturell meist identisch zu index.html — beide müssen synchron geändert werden. Mehrere Agents (Claude + du) arbeiten am selben Checkout: git pull VOR Start, bei Push-Konflikten pull/rebase + retry, NIEMALS force-push.

Anlass: Am 2026-07-15 stellte sich heraus, dass bei den ELWAS-Layern Querbauwerke/Stauanlagen/Regenbecken Felder wie betreiber/gewaesser/name zu 100% falsch waren (z.B. name="e" bei allen 70 Querbauwerke-Features), obwohl die Scraper "fertig" gemeldet hatten — Details in elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md Abschnitt 7+8. Der Fix erfolgte, aber Florian hat aktuell KEINE Möglichkeit, auf der Karte selbst zu sehen, welchem Layer er vertrauen kann, woher die Daten stammen und wie alt sie sind. Das soll dieses Feature beheben.

WICHTIG: Dies ist ein reines Metadaten-/Transparenz-Feature. NICHT die bestehenden Scraper-Regexe in elwas_raw_data/scrape_*.py anfassen, NICHT neu scrapen, sofern nicht unter Punkt 3 explizit nötig.

============================================================
1. EXPLORATION (zuerst, bevor irgendwas geändert wird)
============================================================
Führe aus und lies die Treffer, bevor du irgendwas änderst — Zeilennummern unten sind Stand des Aufnahme-Checkouts und können durch andere Agents leicht abweichen, IMMER frisch grep statt dich auf Zeilennummern zu verlassen:

- grep -n "overlayMaps = {" index.html internal.html  (Layer-Registry, ~Zeile 1982 in index.html: enthält u.a. "🏭 Industrieeinleiter (ELWAS)", "🚰 Kläranlagen (ELWAS)", "💧 Grundwassermessstellen (ELWAS, 3700+)", "📏 Pegel (ELWAS)", "⛰️ Stauanlagen (ELWAS)", "🌧️ Regenbecken/-entlastungsanlagen (ELWAS)", "🧱 Querbauwerke (ELWAS)")
- grep -n "data-layer-name=" index.html internal.html  (Sidebar-Filter-Buttons, Block "🗺️ Fachdaten & Layer" ~Zeile 938-1008 in index.html — Achtung: Industrieeinleiter und Kläranlagen tauchen dort evtl. NICHT als eigener Sidebar-Button auf, das musst du selbst verifizieren statt es anzunehmen)
- grep -n "Quelle:" index.html internal.html  (bestehende Popup-Zeile "Quelle: ELWAS-WEB (Land NRW), Datenlizenz..." — pro ELWAS-Layer ein `layer.bindPopup(html)`-Block, ~9 Treffer in index.html zwischen Zeile 1400-1965)
- grep -n "generate-report-btn" index.html internal.html  (der PDF/PNG-Berichtsgenerator, ~Zeile 2818 in index.html: nutzt html2canvas + jsPDF.autoTable, baut bereits eine "Analysedaten im Kartenausschnitt"-Seite)
- diff <(sed -n '900,1010p' index.html) <(sed -n '900,1010p' internal.html)  als grober Drift-Check zwischen beiden Dateien im Sidebar-Bereich — wenn stark abweichend, beide Dateien separat aber analog anpassen

Property-Keys der 7 betroffenen GeoJSON-Layer (alle haben bereits ein "quelle"-Property, aber KEIN Zeitstempel/Validierungsstatus):
- elwas_einleiter.geojson: betriebs_nr, name, einleitungsart, gemeinde, kreis, anhang_codes, branchen, ..., quelle
- klaeranlagen.geojson: anlagen_nr, name, gemeinde, kreis, betreiber, gewaesser, ausbaugroesse_ew, quelle
- grundwassermessstellen.geojson: name, gemeinde, kreis, eigentuemer, messstellenart, genauigkeit, quelle
- pegel.geojson: pegel_nr, name, kreis, gewaesser, betreiber, einzugsgebiet_km2, nq_m3s, mq_m3s, hq_m3s, quelle
- stauanlagen.geojson: anlagen_nr, name, kreis, betreiber, gewaesser, typ, quelle
- regenbecken.geojson: anlagen_nr, name, kreis, gemeinde, betreiber, typ, abwasserbereich, quelle
- querbauwerke.geojson: anlagen_nr, name, kreis, bauwerksart, typ, gewaesser, quelle

Scope: NUR diese 7 ELWAS-Fachdatenlayer bekommen das Transparenz-Panel (sie haben "quelle" + eine Baupipeline in elwas_raw_data/build_*.py). Contacts/WMS/Grenzen/Hydrologie-Layer NICHT anfassen — die haben kein vergleichbares Metadatenmodell und sind nicht Teil dieses Auftrags.

============================================================
2. DATENMODELL & BUILD-PIPELINE (neue Dateien, in elwas_raw_data/ bzw. Repo-Root)
============================================================
Es gibt aktuell KEIN scraped_at, KEIN diff_geojson.py, KEIN Quality-Gate — das musst du neu bauen, nicht "wiederverwenden".

a) `elwas_raw_data/diff_geojson.py` — CLI-Tool:
   `python diff_geojson.py <alt.geojson> <neu.geojson> --key <property_name>`
   Matched Features über den Key (z.B. anlagen_nr, pegel_nr, betriebs_nr — bei grundwassermessstellen fehlt eine stabile ID, dort Key aus name+gemeinde zusammensetzen). Gibt JSON aus: {"added": [...ids], "removed": [...ids], "changed": {id: [geänderte Feldnamen]}, "unchanged_count": N}. "alt" kommt aus `git show HEAD:<pfad>` (letzter committeter Stand), nicht aus einer separaten Backup-Datei.

b) `elwas_raw_data/validate_layer_quality.py` — heuristisches Quality-Gate, das GENAU das Bug-Muster vom 2026-07-15-Vorfall erkennt: für die "identitätstragenden" Textfelder eines Layers (name, betreiber, gewaesser — NICHT typ/bauwerksart/kreis/messstellenart, die sind legitim niedrig-kardinal) prüfen, ob EIN einzelner nicht-leerer Wert ≥90% der Features abdeckt (bei ≥10 Features). Wenn ja: Layer-Status "warnung" mit Klartext-Notiz, z.B. "Feld 'name' ist bei 70/70 Features identisch ('e') — vermutlich Extraktionsfehler wie am 2026-07-15". Zusätzlich: Koordinaten-Sanity-Check (müssen im Rheinischen Reviers liegen, grob lat 50.5-51.2, lon 5.9-7.0 — bei Verletzung ebenfalls "warnung").

c) `data_validation_status.json` (Repo-Root) — manuelle Validierungs-Ledger, von dir mit den bekannten Fakten aus elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md Abschnitt 8 vorbefüllen:
   - stauanlagen, regenbecken, querbauwerke: status "geprueft", validated_at "2026-07-15", note mit Kurzverweis auf den Fix + Werteverteilungs-Check (56/70/70 Features, siehe Abschnitt 8 "Validierung der extrahierten Daten")
   - elwas_einleiter, klaeranlagen, grundwassermessstellen, pegel: status "ungeprueft" — setze das NICHT eigenmächtig auf "geprueft", außer du führst unter Punkt 4 selbst einen echten Spotcheck durch UND dokumentierst ihn hier mit Datum+Stichprobe
   Dieses File wird von build_layer_meta.py gelesen und mit dem automatischen Gate aus (b) gemerged — ein automatischer Warnung-Treffer überschreibt IMMER "geprueft" (Regressionsschutz: falls ein künftiger Re-Scrape den 2026-07-15-Bug wieder einschleppt, darf der alte "geprueft"-Status das nicht verstecken).

d) `elwas_raw_data/build_layer_meta.py` — Orchestrator, pro Layer:
   - scraped_at: NICHT die Scraper anfassen. Stattdessen mtime der zugrundeliegenden Rohdaten-Datei nehmen (elwas_einleiter → scrape_progress.json / scrape_progress_einleitungsstellen.json, jeweils neueste mtime; klaeranlagen → klaeranlagen.json; grundwassermessstellen → grundwassermessstellen.json; pegel → pegel.json; stauanlagen → stauanlagen.json; regenbecken → regenbecken.json; querbauwerke → querbauwerke.json — alle in elwas_raw_data/)
   - source_url: nachschlagen in elwas_toolkit/sitemap_links.json (Feld "href" für den passenden Datensatznamen) — NICHT raten. Für stauanlagen/querbauwerk stehen die hrefs bereits in STATUS_FUER_ANTIGRAVITY.md Abschnitt 4/6 als Referenz.
   - feature_count: len(features) aus dem jeweiligen .geojson
   - diff_since_last_build: Aufruf von diff_geojson.py gegen `git show HEAD:<datei>`
   - validation: Merge aus (b) automatisch + (c) manuell (siehe Regressionsregel oben)
   - Output: `layer_meta.json` (Repo-Root, gleiche Ebene wie index.html), ein Objekt pro Layer-Key (nutze denselben String wie in overlayMaps, z.B. "⛰️ Stauanlagen (ELWAS)"), Struktur: {source_url, scraped_at (ISO), feature_count, diff_since_last_build, validation_status: "geprueft"|"ungeprueft"|"warnung", validation_note, quelle, generated_at}
   Lauf-Konvention: `python elwas_raw_data/build_layer_meta.py` nach jedem Build eines der 7 Layer erneut ausführen, bevor committet wird — analog zu bestehenden build_*_geojson.py-Skripten in elwas_raw_data/.

============================================================
3. NEUE ELWAS-DATEN NÖTIG? (nur falls Spotcheck in Punkt 4 einen Layer als kaputt entlarvt)
============================================================
Für dieses Feature ist strenggenommen KEIN neuer Scrape nötig (alle 7 Layer sind schon gescraped). ABER: falls dein Pflicht-Spotcheck aus Punkt 4 bei klaeranlagen/pegel/grundwassermessstellen/elwas_einleiter dasselbe Korruptionsmuster wie beim 2026-07-15-Vorfall findet, gilt: NICHT stillschweigend "ungeprueft" stehen lassen, sondern reparieren. Vorgehen dafür (reuse-Pattern, nicht neu erfinden):
- elwas_toolkit/elwas_client.py stellt die wiederverwendbaren Playwright-Bausteine bereit: new_browser/open_dataset/get_frame/fill_regional_search/submit_search/has_excel_export/click_excel_export/open_detail_row/get_detail_tab_options/switch_detail_tab/get_detail_text/extract_field
- Als Vorlage die zuletzt reparierten Scraper nehmen: elwas_raw_data/scrape_stauanlagen.py und scrape_querbauwerke.py (Fix vom 2026-07-15: `[ \t]*` statt `\s*` in Regex-Grenzen, gezielte Tab-Umschaltung für Betreiber, Feld-Extraktion über eindeutige Labels statt body-weite Freitext-Regex — siehe STATUS_FUER_ANTIGRAVITY.md Abschnitt 8 für die exakte Diff-Logik)
- Nach jedem Re-Scrape: den zugehörigen build_<name>_geojson.py-Skript neu laufen lassen, DANN build_layer_meta.py, DANN den Pflicht-Spotcheck aus Punkt 4 wiederholen, bevor du den Status in data_validation_status.json auf "geprueft" hebst.
Falls kein Korruptionsmuster gefunden wird: Punkt 3 ist erledigt, kein Scraping nötig.

============================================================
4. FRONTEND: was NACH der Umsetzung sichtbar/anders sein muss
============================================================
Ändere index.html UND internal.html identisch (analoge Anpassung, falls Struktur abweicht).

a) Sidebar, Block "🗺️ Fachdaten & Layer" (und wo auch immer Industrieeinleiter/Kläranlagen aktuell umgeschaltet werden — von dir in Schritt 1 verifizieren): jede der 7 filter-btn-Zeilen bekommt rechts neben dem bestehenden counter-badge einen neuen kleinen Button `<button class="layer-info-btn" data-info-layer="stauanlagen" title="Datenherkunft & Qualität">ℹ️</button>` — Klick darauf ruft `event.stopPropagation()` auf (darf NICHT den Layer-Toggle auslösen) und öffnet ein kompaktes Popover/Tooltip, verankert am Button, mit:
   - "Quelle: ELWAS-WEB (Land NRW)" als Link auf source_url
   - "Stand: {relatives Datum, z.B. 'vor 3 Tagen (12.07.2026)'}"
   - "Objekte: {feature_count}" + falls diff ungleich 0: "(±{delta} seit letztem Build)"
   - Status-Badge: 🟢 Geprüft / 🟡 Ungeprüft / 🔴 Warnung: Datenqualität — bei 🟡/🔴 zusätzlich die validation_note als Klartext
   Popover schließt bei Klick außerhalb. Layer mit scraped_at älter als 90 Tage bekommen ZUSÄTZLICH ein permanent sichtbares ⏳-Badge direkt an der filter-btn-Zeile (ohne Klick sichtbar, analog zum bestehenden swatch-Farbpunkt-Muster).
   CSS: bestehende Variablen/Klassen wiederverwenden (--border-color, filter-btn, counter-badge) und body.light-theme-Gegenstück für den Popover mitstylen — die Karte unterstützt Light+Dark, neue UI-Elemente dürfen das nicht brechen.

b) Popup pro Feature (die ~9 `layer.bindPopup(html)`-Blöcke): direkt unter der bestehenden "Quelle: ..."-Zeile eine neue Zeile im selben kleinen grauen Stil ergänzen: "Stand: {scraped_at-Datum} · {Status-Emoji} {Status-Label}". Der Status ist layer-weit (aus layer_meta.json), nicht pro Feature.

c) PDF-Bericht ("📊 Bericht generieren", NICHT der einfache "📑 PDF Export"-Button — der bleibt unverändert, reiner Kontakte-Export): neue Sektion/Seite am Ende "Datenqualität & Quellen" mit einer autoTable-Tabelle (Spalten: Layer | Quelle | Stand | Objekte | Status), eine Zeile pro Layer, der beim Export gerade aktiv/sichtbar ist (map.hasLayer(...)-Check, analog zum bestehenden visibleEinleiter-Muster in generate-report-btn).

BEISPIEL-KLICKPFAD (so muss es nach dem Deploy live funktionieren):
1. https://adb-aquarevier-secure.surge.sh öffnen
2. Sidebar → Block "🗺️ Fachdaten & Layer" → Zeile "Querbauwerke"
3. Auf das neue ℹ️-Icon rechts neben dem Counter-Badge klicken (NICHT auf den Zeilentext selbst, das würde den Layer togglen)
4. Popover erscheint: Quelle-Link zu ELWAS-WEB, "Stand: ...", "Objekte: 70", grüner "🟢 Geprüft"-Badge mit Verweis auf den 2026-07-15-Fix
5. Klick außerhalb → Popover schließt
6. Auf einen Querbauwerke-Marker auf der Karte klicken → Popup zeigt unter "Quelle: ..." jetzt zusätzlich "Stand: ... · 🟢 Geprüft"
7. "📊 Bericht generieren" klicken → generiertes PDF öffnen → letzte Seite/Sektion "Datenqualität & Quellen" enthält eine Zeile für Querbauwerke mit denselben Werten

============================================================
5. TEST-/VERIFIKATIONSPFLICHT — ECHTER DATEN-SPOTCHECK, NICHT NUR "KEINE KONSOLENFEHLER"
============================================================
Referenzfall: Beim Querbauwerke/Stauanlagen-Vorfall waren betreiber/gewaesser-Felder zu 100% falsch, obwohl die vorherige Prüfung nur auf JS-Fehler achtete und "fertig" meldete. Das im Repo bereits vorhandene test_live_errors.py prüft AUSSCHLIESSLICH auf pageerror/console-Fehler — das ist GENAU das unzureichende Verfahren, das den Vorfall nicht verhindert hat. Für dieses Feature reicht das NICHT.

Pflicht-Checkliste (alle Punkte, keine Abkürzung):
1. Pro der 7 betroffenen Layer mindestens 5 zufällige Features inhaltlich gegen die zugrundeliegenden Rohdaten (elwas_raw_data/*.json bzw. bei Zweifel direkt live gegen ELWAS-WEB) prüfen: ergibt betreiber/gewaesser/name einen plausiblen, lesbaren Wert (echter Firmenname/Gewässername), keine Label-Textfragmente, keine 100%-Wiederholung eines Werts?
2. Für mindestens 2 Layer: layer_meta.json manuell nachrechnen — stimmt feature_count exakt mit len(features) im .geojson überein? Ist scraped_at plausibel zur echten Datei-mtime?
3. Echter End-to-End-Test von diff_geojson.py: eine Kopie eines .geojson nehmen, künstlich 1 Feature entfernen, diff laufen lassen, prüfen dass "removed" exakt dieses eine Feature zeigt (nicht nur Code lesen und für plausibel halten).
4. validate_layer_quality.py gegen die BEKANNT KAPUTTE alte Version (falls im Git-Verlauf auffindbar, z.B. vor Commit 6032729/0dc1522) laufen lassen und verifizieren, dass es tatsächlich "warnung" ausgibt — sonst ist das Gate nutzlos.
5. Im Browser (lokal, z.B. python -m http.server oder server.py): den kompletten Klickpfad aus Abschnitt 4 tatsächlich durchklicken, Popover-Inhalt und Popup-Zusatzzeile visuell prüfen, Screenshot machen (take_screenshot.py/get_dom.py im Repo können dafür als Ausgangspunkt dienen, ggf. erweitern).
6. Generiertes PDF wirklich öffnen und die neue Sektion "Datenqualität & Quellen" inhaltlich lesen (nicht nur prüfen, dass die Datei entsteht).
7. Denselben Klickpfad nach dem Live-Deploy nochmal auf https://adb-aquarevier-secure.surge.sh UND (falls erreichbar) internal.html wiederholen.
8. Light- UND Dark-Theme kurz gegenprüfen (Popover/Badges lesbar in beiden).
test_live_errors.py kann als ZUSÄTZLICHER, aber nicht hinreichender Check ergänzend laufen.

============================================================
6. COMMIT-KONVENTION & WORKFLOW
============================================================
Stil wie bisheriger Git-Log (Conventional Commits, kurz, imperativ): `feat: ...` / `fix: ...`. Vorschlag für die Commit-Reihenfolge (mehrere kleine Commits statt einem riesigen, KEIN --amend, immer neue Commits):
1. `feat: Layer-Metadaten-Pipeline (scraped_at, diff, Quality-Gate) fuer ELWAS-Fachdatenlayer`
2. `feat: Daten-Transparenz-Panel pro Layer in Sidebar und Popups (index/internal.html)`
3. `feat: Datenqualitaets-Sektion im PDF-Bericht`
(bei Bedarf zusätzlich `fix: ...`, falls Punkt 3 einen kaputten Layer repariert)

Ablauf (autonom, ohne Rückfrage sobald Scope klar ist — dieser Prompt ist die Freigabe für den gesamten Umfang oben):
git pull (Pflicht, Parallelarbeit mit Claude) → Build lokal (python elwas_raw_data/build_layer_meta.py, ggf. betroffene build_*_geojson.py) → lokal im Browser testen (Klickpfad Abschnitt 4) → PFLICHT-Datenspotcheck Abschnitt 5 komplett durchführen und Ergebnisse kurz in der finalen Zusammenfassung nennen → gezielt committen (git add <konkrete Dateien>, NICHT git add -A wegen der vielen Lock-/Cache-/Log-Dateien im Repo-Root) → push auf main → bei Push-Konflikt: pull/rebase + retry, NIEMALS force-push → GitHub Actions (deploy-secure.yml) abwarten → live auf https://adb-aquarevier-secure.surge.sh verifizieren (echten Klickpfad wiederholen, nicht nur grüner Actions-Status) → kurze Abschlussnotiz analog STATUS_FUER_ANTIGRAVITY.md-Stil (was wurde geändert, was ergab der Spotcheck konkret, welche Layer stehen jetzt auf "geprueft" vs. "ungeprueft" und warum).
```

</details>

---

## 2. Automatisiertes Datenqualitäts-Gate (Pre- und Post-Scrape) (ERLEDIGT)

**Kategorie:** Daten

**Mehrwert:** Der Querbauwerke-Vorfall wurde nur durch manuelle Zufallsprüfung entdeckt; ohne automatisches Gate wäre kontaminierter Datenmüll live gegangen. Bei 31 weiteren geplanten ELWAS-Datensätzen wiederholt sich das Muster ohne Automatisierung garantiert. Bündelt Value-Frequency-Check, Schema/Regex-Blacklist, Geofence-Sanity-Check und Row-Count-Tripwire zu einer CI-Pipeline-Stufe.

**Technischer Ansatz (Kurzfassung):** validate_geojson.py prüft vor jedem Deploy: (a) Row-Count-Tripwire gegen letzten bekannten Stand (>30% Abweichung stoppt vor dem teuren Vollscrape), (b) Cardinality-Check pro Pflichtfeld gegen Blacklist bekannter Tab-Label-Fragmente, (c) Geofence-Check der Koordinaten gegen Kreis-Bounding-Box (Ausreißer in Quarantäne-Datei statt stillem Fehlplot). Als Git-Pre-Commit-Hook bzw. GitHub-Actions-Schritt vor surge.sh-Push, analog zum bestehenden Secret-Scan-Hook.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
## Auftrag für Antigravity: Automatisiertes Datenqualitäts-Gate (Pre- und Post-Scrape)

**Root:** `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map` (git, branch `main`, Remote `origin` = `github.com/Dtunder/adb_aquarevier_map`). Push auf `origin/main` triggert automatisch `.github/workflows/deploy-secure.yml` + `deploy-dev.yml` (Surge.sh, kein Approval-Schritt dazwischen) — das ist genau der Grund, warum dieses Gate gebraucht wird. **Zuerst `git pull` / bei Konflikten `pull --rebase` + retry, niemals force-push** — Claude arbeitet parallel am selben Checkout.

### Hintergrund (warum das gebraucht wird — bitte wirklich lesen, nicht überspringen)

In `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md`, Abschnitt 7 ("Code-Review von Claude") steht der Vorfall im Detail: Du (Antigravity) hattest `stauanlagen.geojson`/`regenbecken.geojson`/`querbauwerke.geojson` gescraped, mit Playwright verifiziert ("0 Konsolenfehler"), als fertig gemeldet und gepusht. Tatsächlich war bei Querbauwerke `name` bei **70/70** Features exakt der eine Buchstabe `"e"`, `anlagen_nr` bei **70/70** der Fallback `unknown_<Kreis>_<idx>`. Bei Stauanlagen war `betreiber` bei **56/56** Features wörtlich `"Absperrbauwerk"` (ein Tab-Name der Detailseite, keine Firma) und `gewaesser` bei **56/56** wörtlich `"stationierungskarte"` (ein Linktext-Fragment). Bei Regenbecken hatten **70/70** Features mind. ein kontaminiertes Feld (`betreiber` begann mit `"Zustellanschrift\t..."`, `name` hatte Präfix-Fragmente wie `"/-entlastungsanlagen: ..."`). Ursache: die Extraktion las `frame.locator("body").inner_text()` (kompletter flacher Seitentext) und suchte per Regex nach "Label ... Wert", was bei mehrdeutigem Text (Tab-Namen, Adress-Labels, Spaltenüberschriften) die falsche Stelle traf. Das ist erst durch eine **manuelle** Value-Frequency-Stichprobe (Counter über alle Feature-Werte pro Feld) aufgefallen — nicht durch die Playwright-Konsolenfehler-Prüfung, die bereits vorher "grün" gemeldet hatte (siehe `test_live_errors.py` im Root — genau dieses Muster, "keine Runtime-Errors" ⇒ "fertig gemeldet", ist die Lücke).

Bei 31 weiteren geplanten ELWAS-Datensätzen (Kandidaten + Priorisierung in Abschnitt 2/3/5 desselben Dokuments) passiert das garantiert wieder, wenn es kein automatisches Gate gibt. Deine Aufgabe: dieses Gate bauen, EINMAL, wiederverwendbar für alle künftigen Datensätze — nicht nur für die 3 aktuellen.

---

### 1. Schritt-für-Schritt-Anleitung

**1.1 Lesen/Verstehen (Pflicht vor dem Schreiben):**
- `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` Abschnitt 7+8 (oben zusammengefasst — die exakten Kontaminationsmuster sind deine Blacklist-Startwerte, siehe 1.3).
- `elwas_toolkit/elwas_client.py` — insbesondere `get_result_row_count(frame)` (Zeile ~147, zählt Ergebniszeilen der Regionalsuche, BEVOR Detailseiten geöffnet werden — das ist der Haken für den Pre-Scrape-Tripwire) und `open_detail_row()`/`submit_search()` (der teure Teil, den der Tripwire vermeiden soll).
- `elwas_raw_data/scrape_stauanlagen.py`, `scrape_regenbecken.py`, `scrape_querbauwerke.py` — aktuelles Scrape-Pattern (pro Kreis: `fill_regional_search` → `submit_search` → Ergebniszeilen durchgehen → pro Zeile `open_detail_row` + Feld-Extraktion). Genau nach dem `submit_search`-Schritt, vor der Zeilen-Schleife, kommt der neue Tripwire-Call rein.
- `elwas_raw_data/build_querbauwerke_geojson.py` als Referenz-Schema (Properties: `anlagen_nr`, `name`, `kreis`, `bauwerksart`/`typ`, `gewaesser`, `quelle`) — die anderen `build_*_geojson.py` haben analoge, leicht unterschiedliche Property-Sets; grep kurz `properties.*=.*{` in jeder `build_*_geojson.py` um die Pflichtfelder pro Dataset zu bestätigen, nicht raten.
- `kreise_rr.geojson` (Root) — 7 Kreis-Polygone (Düren, Euskirchen, Heinsberg, Mönchengladbach, Rhein-Erft-Kreis, Rhein-Kreis Neuss, Städteregion Aachen). Bounding Box daraus (zur Orientierung, selbst neu berechnen statt hart zu kodieren): lon ca. 5.87–7.03, lat ca. 50.32–51.34.
- `.github/workflows/deploy-secure.yml` + `deploy-dev.yml` — beide bestehen aktuell NUR aus Checkout → Node/Surge-Install → `surge . <domain>`, ohne jeden Validierungsschritt. `.git/hooks/` ist aktuell leer (keine vorhandenen Hooks in diesem Repo trotz der Analogie im Auftrag — du baust den Pre-Commit-Hook neu, orientiert am Muster "Secret-Scan-Hook blockt Staged-Diff" aus der allgemeinen Agent-Infra, aber es gibt hier keine existierende Datei zum Kopieren).

**1.2 Neue Dateien anlegen:**
- `elwas_raw_data/data_quality_gate.py` — Kernmodul, importierbar sowohl von `validate_geojson.py` (Root) als auch von den `scrape_*.py`-Skripten. Enthält:
  - `check_row_count_tripwire(dataset_key: str, kreis_counts: dict[str,int], threshold: float = 0.30) -> None`: lädt `elwas_raw_data/known_row_counts.json`, vergleicht `sum(kreis_counts.values())` (und optional pro Kreis) gegen den letzten bekannten Gesamtwert für `dataset_key`. Bei Abweichung >30% → `raise RuntimeError(...)` mit klarer Diagnose (alt vs. neu, pro Kreis wenn möglich). Gibt es noch **keinen** Baseline-Eintrag für `dataset_key` (erster Scrape eines neuen Datensatzes) → NICHT blockieren, nur INFO-Print — der Baseline-Eintrag wird erst von `validate_geojson.py` NACH einem erfolgreichen Post-Scrape-Durchlauf geschrieben (nie vom Scraper selbst, sonst kann sich der Tripwire durch aufeinanderfolgende kaputte Runs selbst kaputt-baselinen).
  - `check_cardinality(features: list, required_fields: list[str], blacklist_fragments: list[str], mode_ratio_threshold: float = 0.8, min_features_for_check: int = 5) -> dict`: pro Pflichtfeld einen `Counter` über alle Werte bilden. (a) Wenn ein Wert **exakt** in `blacklist_fragments` vorkommt → dieses Feature einzeln als "blacklist"-Treffer markieren (Ausreißer-Fall, Quarantäne für DIESES Feature). (b) Wenn bei ≥`min_features_for_check` Features der häufigste Wert (`Counter.most_common(1)`) einen Anteil >`mode_ratio_threshold` an ALLEN Werten dieses Felds hat → das ist der systemische Fall aus dem Querbauwerke-Vorfall (70/70 = 100% ratio) → HARD FAIL für das gesamte Dataset (nicht nur Quarantäne einzelner Features — bei 100%/70 ist offensichtlich die ganze Extraktion kaputt, nicht ein Ausreißer).
  - `check_geofence(features: list, bbox: tuple, buffer_deg: float = 0.05) -> list`: Koordinaten je Feature gegen `bbox` (± `buffer_deg`) prüfen, Liste der Ausreißer-Feature-Indizes zurückgeben (Quarantäne-Fall, kein Dataset-weiter Fail — ein einzelner Ausreißer-Punkt blockt nicht 69 valide Punkte).
  - Start-Blacklist (aus dem dokumentierten Vorfall, siehe 1.3 unten) als Default in einer `elwas_raw_data/dataset_quality_config.json` ablegen, NICHT hart im Python-Code — pro Datensatz: `{geojson_path, required_fields, blacklist_fragments, row_count_baseline_key}`. Das ist der Erweiterungspunkt für die kommenden 31 Datensätze (neuer Eintrag = kein Codeänderung nötig für den Regelfall).
- `elwas_raw_data/known_row_counts.json` — `{dataset_key: {total: int, per_kreis: {...}, updated: "YYYY-MM-DD", source_commit: "<sha>"}}`. Initial befüllen mit den AKTUELLEN echten Werten aus `stauanlagen.geojson` (56), `regenbecken.geojson` (70), `querbauwerke.geojson` (70) — das sind die bereits manuell verifizierten "guten" Stände aus Abschnitt 8 des Status-Dokuments.
- `validate_geojson.py` (**Root**, exakt dieser Name/Pfad, damit CI/Hook simpel bleiben) — CLI: `python validate_geojson.py --dataset querbauwerke` (ein Dataset) oder `python validate_geojson.py --all` (alle in `dataset_quality_config.json` konfigurierten). Lädt config + geojson, ruft `check_cardinality` + `check_geofence` aus `data_quality_gate.py` auf. Verhalten:
  - HARD FAIL (systemische Kontamination oder Row-Count-Abweichung >30% ggü. Baseline) → Exit-Code 1, druckt genau welches Feld/welcher Wert/welche Ratio, schreibt NICHTS in die Baseline, lässt die bestehende `<name>.geojson` im Root unangetastet (kein kaputter Stand überschreibt den letzten guten).
  - Ausreißer (einzelne Features per Blacklist oder Geofence) → diese Features aus dem Output entfernt, stattdessen in `<name>.quarantine.geojson` (Root, gleiche Struktur wie das Original + zusätzliches Property `_quarantine_reason`, z.B. `"geofence: 42km ausserhalb Kreis-Bbox"` oder `"blacklist: betreiber == 'Absperrbauwerk'"`) geschrieben. Restliche Features normal in `<name>.geojson`. Exit-Code 0 (Deploy geht durch), aber Warn-Summary auf stdout.
  - Alles sauber → Exit 0, aktualisiert `known_row_counts.json` mit dem neuen Gesamtwert als neue Baseline (nur bei komplett sauberem Durchlauf, keine Quarantäne-Datei vorhanden → strikter: nur updaten wenn 0 Quarantäne-Features UND kein Hard-Fail, sonst bleibt die alte Baseline stehen).
- `tools/git-hooks/pre-commit` (POSIX-Shell, läuft unter Git Bash — das Environment hat das bereits): ermittelt `git diff --cached --name-only`, filtert auf `.geojson`-Dateien, deren Basename in `dataset_quality_config.json` als `geojson_path` konfiguriert ist, ruft für jede `python validate_geojson.py --dataset <key>` auf. Nicht-Null-Exit ⇒ Commit abbrechen (`exit 1`) mit klarer Fehlermeldung. Bei erzeugten `*.quarantine.geojson`-Dateien: diese automatisch mit `git add` zum selben Commit hinzufügen und eine Warnung ausgeben (Commit geht trotzdem durch).
- Einmalig aktivieren: `git config core.hooksPath tools/git-hooks` (im README oder in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` als Setup-Hinweis für Claude/Florian dokumentieren, da `.git/hooks/` selbst nicht versioniert wird und jeder Checkout das einmal lokal setzen muss).

**1.3 Start-Blacklist** (direkt aus dem dokumentierten Vorfall, als Ausgangspunkt in `dataset_quality_config.json` eintragen, pro Dataset wo passend): `"Absperrbauwerk"`, `"stationierungskarte"`, `"Seiteninhalt"`, Werte die mit `"Zustellanschrift"` oder `"/"` beginnen, Werte die exakt dem Regex `^unknown_.*` entsprechen (ID-Fallback-Marker), sowie generisch: jeder String-Wert mit Länge <2 Zeichen in einem `name`/`betreiber`/`gewaesser`-Feld ist automatisch verdächtig (fängt den `"e"`-Fall unabhängig von einer expliziten Blacklist-Liste ab — als generische Regel in `check_cardinality`, nicht nur als Blacklist-Eintrag).

**1.4 Scraper-Integration (Pre-Scrape-Gate):** In `scrape_stauanlagen.py`, `scrape_regenbecken.py`, `scrape_querbauwerke.py` (und als Konvention für alle künftigen `scrape_*.py`): direkt nach `submit_search()` pro Kreis `await get_result_row_count(frame)` aufrufen, in ein `kreis_counts`-Dict sammeln. NACHDEM alle 7 Kreise durchlaufen sind (also der günstige Teil), aber BEVOR die Schleife über `open_detail_row()` pro Zeile beginnt (der teure Teil — hunderte Tab-Switches/Detailseiten-Navigationen) → `data_quality_gate.check_row_count_tripwire(...)` aufrufen. Bei Abweichung >30% bricht das Skript kontrolliert ab, ohne die teure Detail-Extraktion überhaupt zu starten.

**1.5 Betroffene Dateien (Zusammenfassung):** neu: `elwas_raw_data/data_quality_gate.py`, `elwas_raw_data/dataset_quality_config.json`, `elwas_raw_data/known_row_counts.json`, `validate_geojson.py` (Root), `tools/git-hooks/pre-commit`. Geändert: `scrape_stauanlagen.py`, `scrape_regenbecken.py`, `scrape_querbauwerke.py`, `.github/workflows/deploy-secure.yml`, `.github/workflows/deploy-dev.yml` (neuer Step vor "Deploy to Surge"), `index.html` UND `internal.html` (UI-Badge, siehe Abschnitt 2), `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` (neuer Abschnitt 10, Fortsetzung der Nummerierung, dokumentiert was gebaut wurde — nach demselben Muster wie Abschnitt 6/8 dort).

---

### 2. Sichtbare Änderungen auf der Webseite NACH Umsetzung

**Wichtigster Effekt (unsichtbar, aber der eigentliche Punkt):** Ein systemisch kaputter Datensatz wie der Querbauwerke-Vorfall (100% eines Feldes falsch) kann ab jetzt gar nicht mehr committet/deployt werden — der Pre-Commit-Hook UND die GitHub-Action-Stufe blocken das, bevor es live geht. Das ist die primäre Erfolgsmessung, nicht die UI.

**Sichtbares UI-Element:** In `index.html` und `internal.html` existiert bereits das Sidebar-Layer-Panel mit `<span class="counter-badge" id="cnt-layer-querbauwerke">(0/0)</span>` etc. (Zeilen ~948–977 in `index.html`, analoge Stelle in `internal.html` per Grep auf `cnt-layer-querbauwerke` finden). Direkt neben diesem bestehenden Counter-Badge kommt ein neues, standardmäßig verstecktes Element dazu, z.B.:
```html
<span class="quality-badge" id="qbadge-layer-querbauwerke" title="" hidden>⚠️</span>
```
JS-Verhalten (in derselben Funktion, die aktuell `#cnt-layer-querbauwerke` befüllt): zusätzlich `fetch('querbauwerke.quarantine.geojson')` versuchen (404/kein File = alles sauber, Badge bleibt versteckt). Existiert die Datei mit >0 Features: Badge einblenden, Text/Title z.B. `"3 in Quarantäne"` bzw. Tooltip `"⚠️ 3 Objekte automatisch in Quarantäne (Datenqualitäts-Gate) — Stand 2026-07-17"`.

**In `internal.html` zusätzlich (Florians Editor-Tool, hier lohnt sich die Detailansicht):** Klick auf das Badge öffnet ein kleines Panel/Popup (kann ein einfaches `<div>` im bestehenden Popup-Stil sein, kein neues UI-Framework nötig) mit einer Liste der Quarantäne-Features: ihre wichtigsten Identifikationsfelder + `_quarantine_reason`. In `index.html` (öffentliche Karte) reicht die reine Anzeige des Badges mit Tooltip, kein Klick-Panel nötig (keine internen QA-Details öffentlich ausbreiten).

**Beispiel-Klickpfad (Verifikation nach Deploy):**
1. Florian öffnet `internal.html` auf `https://adb-aquarevier-secure.surge.sh/internal.html` (oder lokal `localhost:8000/internal.html`).
2. Klickt in der Sidebar auf den Bereich mit den ELWAS-Layer-Filterbuttons (Grundwassermessstellen/Pegel/Stauanlagen/Regenbecken/Querbauwerke).
3. Sieht neben `"Querbauwerke (67/70)"` zusätzlich ein gelbes ⚠️-Badge mit `"3 in Quarantäne"`.
4. Klickt das Badge → Panel öffnet sich: `"Bauwerk unknown_Dueren_12 — Grund: geofence: 42km ausserhalb Kreis-Bbox"`, `"Bauwerk XY — Grund: blacklist: betreiber == 'Absperrbauwerk'"`.
5. Florian weiß jetzt genau, welche 3 Objekte er in ELWAS-WEB manuell nachschlagen sollte — die anderen 67 sind normal, unverändert auf der Karte sichtbar wie vorher.
6. Im Normalfall (keine Ausreißer im aktuellen Scrape) bleibt das Badge komplett unsichtbar — die Sidebar sieht optisch identisch aus wie vor diesem Feature.

---

### 3. Neue ELWAS-Daten nötig?

**Nein**, für den Kern dieses Features wird kein neuer ELWAS-Datensatz gescraped — es ist ein Validierungs-Layer über bereits vorhandene Daten (`stauanlagen.geojson`, `regenbecken.geojson`, `querbauwerke.geojson`, plus optional rückwirkend `elwas_einleiter.geojson`, `klaeranlagen.geojson`, `grundwassermessstellen.geojson`, `pegel.geojson`). Die einzige Berührung mit dem Scraping-Toolkit ist die in 1.4 beschriebene Integration von `elwas_client.get_result_row_count(frame)` (bereits vorhandene Funktion, keine neue Playwright-Logik nötig) in die drei bestehenden `scrape_*.py`-Skripte für den Pre-Scrape-Tripwire. Falls im Rahmen der Arbeit einer der nächsten 3 geplanten Datensätze (Stauanlagen/Regenbecken/Querbauwerke sind es ja bereits — die nächsten wären laut `STATUS_FUER_ANTIGRAVITY.md` Abschnitt 3/5 z.B. Niederschlagsstationen) parallel angegangen werden soll: NICHT tun, das ist außerhalb des Scopes dieses Auftrags — Fokus bleibt auf dem Gate selbst.

---

### 4. Test-/Verifikationsschritte (PFLICHT, nicht überspringbar)

**Ausdrückliche Anforderung:** "Keine Konsolenfehler" ist bei früheren Antigravity-Datensätzen (Stauanlagen/Regenbecken) KEIN Beweis für korrekte Daten gewesen — `betreiber`/`gewaesser` waren dort zu 100% falsch, obwohl das Konsolenfehler-Check (siehe `test_live_errors.py`) grün war und "fertig" gemeldet wurde. Für dieses Feature gilt deshalb zusätzlich zwingend:

1. **Smoke-Test auf sauberen Daten:** `python validate_geojson.py --all` gegen die aktuellen (bereits reparierten, laut Abschnitt 8 manuell verifizierten) `stauanlagen.geojson`/`regenbecken.geojson`/`querbauwerke.geojson` laufen lassen → muss Exit 0, 0 Quarantäne-Features, 0 Hard-Fails liefern. Wenn hier bereits etwas anschlägt, ist entweder die Baseline falsch befüllt oder der Gate-Code fehlerhaft — beides klären bevor es weitergeht.
2. **Adversarial-Test (der Gate muss den ECHTEN Vorfall erkennen):** eine kleine synthetische Test-Geojson bauen, die exakt das Kontaminationsmuster aus dem Vorfall reproduziert (z.B. 10 Features, `name` bei allen `"e"`, `betreiber` bei allen `"Absperrbauwerk"`). `validate_geojson.py` DARAUF laufen lassen → muss Exit 1 liefern, mit einer Diagnose-Ausgabe die exakt das kontaminierte Feld + den Wert + die Ratio nennt. Wenn das nicht fehlschlägt, ist der Gate wirkungslos — nicht als "fertig" melden.
3. **Geofence-Test:** eine Kopie eines echten Datensatzes nehmen, ein synthetisches Feature mit Koordinaten weit außerhalb NRW einfügen (z.B. Berlin), `validate_geojson.py` laufen lassen → das synthetische Feature muss in `<name>.quarantine.geojson` landen, NICHT im Haupt-Output, alle echten Features müssen unverändert im Haupt-Output bleiben (Anzahl prüfen: `original_count - 1`).
4. **Row-Count-Tripwire-Test:** `known_row_counts.json` testweise mit einem stark abweichenden Wert (z.B. Baseline auf 10 setzen, echte Anzahl ist 70) versehen, `check_row_count_tripwire()` direkt (ohne echten Live-Scrape) mit den aktuellen echten Kreis-Counts aufrufen → muss `RuntimeError` werfen. Danach Baseline wieder auf den echten Wert zurücksetzen.
5. **Hook-Test ohne Historien-Verschmutzung:** die Adversarial-Fixture aus Schritt 2 stagen (`git add`), `tools/git-hooks/pre-commit` DIREKT ausführen (nicht über einen echten `git commit`, um keinen Test-Commit in der Historie zu hinterlassen), Exit-Code prüfen (muss ≠0 sein), danach `git reset` die Fixture wieder unstagen und die Test-Datei löschen.
6. **Reale UI-Verifikation:** lokal `python server.py`, `internal.html` im Browser (oder Playwright) öffnen, mit einer testweise erzeugten `querbauwerke.quarantine.geojson` (aus Schritt 2/3, danach wieder entfernen bevor committet wird) prüfen, dass das ⚠️-Badge tatsächlich erscheint und das Klick-Panel die richtigen Reasons zeigt. Playwright-Screenshot als Beleg.
7. **Echter Daten-Spotcheck (explizit gefordert, nicht optional):** nach dem eigentlichen Feature-Commit UNABHÄNGIG von den Gate-Tests selbst noch einmal manuell 5–10 reale Features aus `querbauwerke.geojson`/`stauanlagen.geojson`/`regenbecken.geojson` inhaltlich durchsehen (`name`, `betreiber`, `gewaesser`, Koordinaten plausibel auf der Karte?) — nicht nur "Gate meldet grün", sondern echte Werte lesen, exakt der Schritt der beim letzten Mal übersprungen wurde.
8. **Nach dem Live-Deploy:** `gh run list`/`gh run view` prüfen, dass der neue Validierungs-Step in der GitHub Action tatsächlich gelaufen (nicht übersprungen/falsch konfiguriert) und grün ist. Danach `https://adb-aquarevier-secure.surge.sh` (und `/internal.html`) live mit Playwright aufrufen, Konsolenfehler UND das neue Badge-Verhalten prüfen.

---

### 5. Commit-Konvention & Workflow

Mehrere kleine, thematisch saubere Commits statt eines Mega-Commits, Stil wie bisher im Log (`feat:`/`fix:`/`docs:` + kurze Beschreibung, z.B.):
- `feat: data quality gate core (row-count tripwire, cardinality/blacklist check, geofence quarantine)`
- `feat: wire data quality gate into scrapers + git pre-commit hook + GitHub Actions`
- `feat: quality badge UI for quarantined ELWAS features in index/internal sidebar`
- `docs: STATUS_FUER_ANTIGRAVITY.md — Abschnitt 10, Datenqualitäts-Gate Uebergabe`

**Workflow autonom, ohne Rückfrage bei jedem Einzelschritt** (Scope ist mit diesem Auftrag klar): `git pull` → bauen → lokal mit allen Tests aus Abschnitt 4 verifizieren (inkl. echtem Daten-Spotcheck) → committen → pushen → `gh run` der Actions abwarten/prüfen → live auf `adb-aquarevier-secure.surge.sh` verifizieren (Playwright + manueller Spotcheck). Einzige Stelle an der du stoppen und Rückmeldung geben sollst, statt einfach weiterzumachen: falls der neue Gate beim ersten echten Lauf gegen die aktuellen `stauanlagen.geojson`/`regenbecken.geojson`/`querbauwerke.geojson` (Schritt 4.1) tatsächlich einen Hard-Fail oder unerwartete Quarantäne-Treffer liefert — das würde bedeuten, die als "sauber" dokumentierten Daten aus Abschnitt 8 sind es doch nicht vollständig, das ist dann ein eigener Befund wert statt stillschweigend die Schwellwerte so lange zu lockern bis es grün wird.
```

</details>

---

## 3. Gemeinde-Steckbrief ("Was bedeutet das für uns?") (ERLEDIGT)

**Kategorie:** Stakeholder

**Mehrwert:** Politiker und Gemeinderäte fragen bei Terminen zuerst nach dem lokalen Bezug, nicht nach Rohdaten. Aktuell müsste Florian vor jedem Gemeinde-Termin die Zahlen manuell zusammensuchen — eine automatische Klartext-Zusammenfassung pro Ort macht die Karte auch ohne Vorbereitung präsentationsfähig.

**Technischer Ansatz (Kurzfassung):** Bestehende Unified Global Search als Trigger nutzen: bei Ortsauswahl Punkte-in-Polygon-Abfrage (Turf.js) gegen alle aktiven Layer innerhalb der Gemeindegrenze, daraus automatisch generierter Klartext ("In [Gemeinde]: 4 Industrieeinleiter, 1 Kläranlage bei 78% Auslastung, nächster Pegel [X]") als Popup/Sidebar-Panel.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG FÜR ANTIGRAVITY: Feature "Gemeinde-Steckbrief" ("Was bedeutet das für uns?")

KONTEXT
Repo: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (github.com/Dtunder/adb_aquarevier_map, Branch main). Push auf origin/main deployt automatisch via GitHub Actions -> Surge.sh (https://adb-aquarevier-secure.surge.sh = index.html, öffentliche Karte; internal.html = Florians Editor-Tool, strukturell fast identisch). Mehrere KI-Agenten (Claude + du, Antigravity) arbeiten am selben Checkout. VOR JEDEM Schritt: `git pull` (bei Konflikten `git pull --rebase` + Retry, NIEMALS force-push). Arbeite diesen Auftrag eigenständig ab, ohne bei jedem Teilschritt nachzufragen — Scope ist unten vollständig spezifiziert.

ZIEL
Bei Auswahl einer Gemeinde in der bestehenden "Unified Global Search" (Suchfeld oben links auf der Karte, Placeholder "Alles durchsuchen…") öffnet sich zusätzlich zum bisherigen Zoom/Popup-Verhalten ein Gemeinde-Steckbrief-Panel mit automatisch generiertem Klartext ("In X: N Industrieeinleiter, N Kläranlage(n), nächster Pegel Y (Z km)…"), damit Florian bei Gemeinde-Terminen ohne Vorbereitung präsentationsfähig ist.

============================================================
SCHRITT 1 — REPO-EXPLORATION (grep zuerst, dann gezielt lesen)
============================================================
Die relevante Logik liegt in EINEM selbstständigen IIFE pro Datei ("Unified Global Search"), NICHT verteilt über viele Stellen. Lokalisiere es in BEIDEN Dateien per grep (nicht über feste Zeilennummern arbeiten, die verschieben sich):

    grep -n "function buildUnifiedSearchIndex" index.html internal.html
    grep -n "function addAgg" index.html internal.html
    grep -n "const gemeindeAgg = new Map" index.html internal.html
    grep -n "function executeSelect" index.html internal.html
    grep -n "cat: 'gemeinde'" index.html internal.html

Betroffene Dateien für dieses Feature:
- index.html (öffentliche Karte) — Haupt-Änderung
- internal.html (Editor) — SPIEGELGLEICHE Änderung (siehe README.md: beide Dateien sind separate, nicht geteilte HTML-Dateien; JEDE Änderung an der Suchlogik muss in BEIDEN Dateien vorgenommen werden, sonst laufen sie auseinander)
- KEINE Python-Dateien in elwas_raw_data/*.py oder elwas_toolkit/* nötig für v1 (Begründung siehe Schritt 3)

Lies dir NUR den Abschnitt zwischen `function buildUnifiedSearchIndex` und dem Ende des IIFE (Suchfeld-Control-Wiring, `map.addControl(new UnifiedSearchControl())`) einmal komplett durch — das ist der komplette relevante Kontext (~350-400 Zeilen), nicht die ganze 3500/4400-Zeilen-Datei lesen.

Bereits vorhanden (wichtig, NICHT neu bauen):
- `addAgg(map_, name, lat, lng)` sammelt pro Punkt-Layer die Koordinaten unter dem `gemeinde`-Attribut in eine `Map<name, [lat,lng][]>`.
- Am Ende von `buildUnifiedSearchIndex()` wird pro Gemeinde bereits ein Search-Record `{cat: 'gemeinde', label: name, sub: 'N Objekt(e)', kind: 'aggregate', points, popupHtml}` erzeugt — das ist der Trigger-Punkt, den du erweiterst.
- `executeSelect(rec)` behandelt `rec.kind === 'aggregate'` bereits generisch (fitBounds + flashPoints + Standard-Popup). Du hängst hier NICHT den Callflow um, sondern fügst einen Spezialfall für `rec.cat === 'gemeinde'` hinzu, der zusätzlich das neue Steckbrief-Panel öffnet.

============================================================
SCHRITT 2 — DATENREALITÄT (VERIFIZIERT, vor dem Coden gegencheck via python)
============================================================
Verifiziere folgende Fakten selbst nochmal gegen den aktuellen Checkout-Stand (Daten können sich zwischen Sessions ändern), bevor du irgendetwas an Text-Templates schreibst:

    python -c "
    import json, collections
    files = {'einleiter':'elwas_einleiter.geojson','klaeranlage':'klaeranlagen.geojson','gwm':'grundwassermessstellen.geojson','regenbecken':'regenbecken.geojson'}
    for cat, fn in files.items():
        d = json.load(open(fn, encoding='utf-8'))
        has_gem = sum(1 for f in d['features'] if f['properties'].get('gemeinde'))
        print(cat, 'total:', len(d['features']), 'mit gemeinde-Attribut:', has_gem)
    "

Erwartetes Ergebnis (Stand dieser Recherche): einleiter 101/101 mit gemeinde, klaeranlage 60/60 mit gemeinde, gwm 3746/3746 mit gemeinde, regenbecken 0/70 mit gemeinde (Feld existiert, ist aber IMMER null). D.h.:

a) Nur 3 Layer sind über das existierende `gemeinde`-Attribut sauber gruppierbar: Industrieeinleiter (elwas_einleiter.geojson), Kläranlagen (klaeranlagen.geojson), Grundwassermessstellen (grundwassermessstellen.geojson). Regenbecken hat KEIN nutzbares gemeinde-Attribut (0% Coverage) — NICHT ins Steckbrief-Aggregat aufnehmen, sonst zeigt jede Gemeinde "0 Regenbecken" obwohl das schlicht nicht erhoben ist. Kommentar im Code dazu ergänzen.

b) pegel.geojson, stauanlagen.geojson, querbauwerke.geojson haben GAR KEIN `gemeinde`-Feld im Schema (nur `kreis`). Für "nächster Pegel" (siehe Beispieltext im Auftrag) brauchst du eine reine Abstands-Berechnung vom Gemeinde-Zentrum aus (siehe Schritt 3b) — NICHT eine Zugehörigkeits-Zählung "Pegel in dieser Gemeinde" (das wäre bei 46 Pegeln über das ganze Gebiet meist 0 pro Gemeinde und würde falsch wirken).

c) contacts_anonymized.geojson (Akteure/Institutionen-Layer) hat NUR `name`, `group`, `color` — KEINERLEI Orts-Attribut. Akteure können in v1 NICHT pro Gemeinde gezählt werden (dafür bräuchte es echte Punkt-in-Polygon-Prüfung gegen eine Gemeinde-Grenzgeometrie, die es im Repo nicht gibt — siehe Schritt 5). Akteure NICHT im Steckbrief-Text erwähnen, außer als optionalen "im übergeordneten Kreis"-Hinweis (siehe d).

d) kreise_rr.geojson enthält NUR 7 Polygone auf KREIS-Ebene (Feld `GN` = Kreisname, z.B. "Heinsberg", "Rhein-Erft-Kreis", "Städteregion Aachen"), NICHT auf Gemeinde-Ebene. Es gibt aktuell KEINEN Gemeinde-Grenz-Polygon-Layer im Repo. Das ist auch der Grund, warum v1 dieses Features attributbasiert (String-Matching auf `gemeinde`) und NICHT via echtem Turf.js-Punkt-in-Polygon gegen eine Gemeindegrenze läuft — es gibt schlicht keine Gemeindegrenzen-Geometrie zum Testen. Das attributbasierte Verfahren ist an dieser Stelle sogar präziser als eine Turf.js-Lösung gegen die einzige vorhandene Polygon-Datei (die wäre nur Kreis-genau, viel zu grob für "Gemeinde").

e) KRITISCH — KEINE erfundenen Kennzahlen: klaeranlagen.geojson hat ein Feld `ausbaugroesse_ew` (Bemessungsgröße in Einwohnerwerten, z.B. "48.000" — Achtung, deutsches Tausenderpunkt-Format, NICHT Dezimalpunkt! Vor jeder numerischen Verwendung zwingend `str.replace('.', '').replace(',', '.')` bzw. im JS `.replace(/\./g, '').replace(',', '.')` VOR `parseFloat`). Es gibt KEIN Feld für eine aktuelle Auslastung in Prozent. Der Beispieltext im Auftrag ("Kläranlage bei 78% Auslastung") ist NUR eine Illustration des gewünschten TONS, keine reale Kennzahl — baue KEINE "X% Auslastung"-Aussage, die du nicht aus echten Daten belegen kannst. Verwende stattdessen z.B. "Kläranlage {name} (Ausbaugröße: {ew} Einwohnerwerte)" — nur mit real vorhandenem Feld. Das ist exakt die Klasse Fehler, die bei früheren Antigravity-Datensätzen (Stauanlagen/Regenbecken: betreiber/gewaesser zu 100% falsch trotz "fertig"-Meldung) schon einmal passiert ist — nur weil auf JS-Fehlerfreiheit statt auf Daten-Korrektheit geprüft wurde.

============================================================
SCHRITT 3 — IMPLEMENTIERUNG (in index.html UND internal.html, identisch)
============================================================

3a) Datenmodell erweitern: `addAgg` trägt aktuell nur `[lat, lng]` pro Punkt. Erweitere die Funktion (oder führe eine parallele Variante ein) so, dass pro Gemeinde-Eintrag auch Kategorie + relevante Properties mitgeführt werden, z.B.:

    function addAggDetailed(map_, name, entry) {
        if (!name) return;
        const key = String(name).trim();
        if (!key) return;
        if (!map_.has(key)) map_.set(key, []);
        map_.get(key).push(entry); // entry = { cat, lat, lng, props }
    }

Rufe das zusätzlich (parallel zum bestehenden `addAgg` für die Zoom/Highlight-Punkte, den NICHT anfassen) an den 3 relevanten Stellen auf: Industrieeinleiter-Block (`if (p.gemeinde) addAgg(gemeindeAgg, p.gemeinde, lat, lng);` — dort danebensetzen), Kläranlagen-Block, Grundwassermessstellen-Block. NICHT im Regenbecken-Block (siehe 2a).

3b) Nächster-Pegel-Berechnung: Nach Aufbau von `gemeindeAgg`, beim Erzeugen des `cat: 'gemeinde'`-Search-Records, berechne den Zentroid der Gemeinde-Punkte (`L.latLngBounds(points).getCenter()`, exakt wie in `executeSelect` bereits für den Zoom verwendet) und finde daraus den nächstgelegenen Pegel per einfacher Distanzberechnung — KEIN Turf.js nötig, Leaflet kann das nativ:

    function nearestPegel(centerLatLng, pegelList) {
        let best = null, bestDist = Infinity;
        pegelList.forEach(p => {
            const d = centerLatLng.distanceTo(L.latLng(p.lat, p.lng)); // Meter
            if (d < bestDist) { bestDist = d; best = p; }
        });
        return best ? { ...best, distanceKm: (bestDist / 1000).toFixed(1) } : null;
    }

`pegelList` sammelst du parallel im Pegel-Fetch-Block (dort wird aktuell nur `gewaesserAgg` befüllt) als einfaches Array `{ name, kreis, lat, lng }`.

3c) Klartext-Generator: eine reine Funktion, die aus den gesammelten Daten den Satz baut, z.B.:

    function buildSteckbriefText(gemeindeName, detail, pegel) {
        const parts = [];
        if (detail.einleiter) parts.push(`${detail.einleiter} Industrieeinleiter`);
        if (detail.klaeranlage) parts.push(`${detail.klaeranlage} Kläranlage${detail.klaeranlage > 1 ? 'n' : ''}`);
        if (detail.gwm) parts.push(`${detail.gwm} Grundwassermessstelle${detail.gwm > 1 ? 'n' : ''}`);
        let text = `In ${gemeindeName}: ${parts.join(', ') || 'keine erfassten Anlagen in diesen Kategorien'}.`;
        if (pegel) text += ` Nächster Pegel: ${pegel.name} (${pegel.distanceKm} km entfernt).`;
        return text;
    }

Zähl-Logik (`detail`) aus dem in 3a gesammelten Array pro Kategorie aggregieren (`.filter(e => e.cat === 'klaeranlage').length` etc.), NICHT hardcoden.

3d) UI-Panel: neues DOM-Element, visuell konsistent mit bestehenden `.popup-card`/`.popup-title`/`.popup-group`/`.popup-detail`-Klassen (`grep -n "\.popup-card {" index.html`) und den vorhandenen CSS-Variablen (`--bg-surface`, `--border-color`, `--text-primary`, `--text-secondary`, `--accent-primary`, inkl. `body.light-theme`-Override-Pattern — dieses Projekt unterstützt Light/Dark, NICHT vergessen). Platzierung: festes Panel rechts (`position: fixed; right: 16px; top: 80px; max-width: 340px; max-height: 70vh; overflow-y: auto; z-index: <über Karten-Controls, unter evtl. Modals>`), mit Schließen-Button (X). Responsive: bestehende Breakpoints wiederverwenden (`grep -n "@media" index.html` → 480px und 640px vorhanden), auf schmalen Screens Panel als volle Breite unten andocken statt rechts überlappend.

Panel-Inhalt: Titel "📋 Gemeinde-Steckbrief: {Name}", der generierte Klartext-Satz aus 3c, darunter eine kompakte Liste (Icon + Zahl + Kategorie), keine erfundene Auslastungs-%-Zeile (siehe 2e).

3e) Hook: in `executeSelect(rec)`, im Zweig `rec.kind === 'aggregate'`, ergänze eine Bedingung `if (rec.cat === 'gemeinde') { openGemeindeSteckbrief(rec); }` zusätzlich zum bestehenden Verhalten (fitBounds/flashPoints/Popup bleiben unverändert bestehen — das Panel ist additiv, kein Ersatz).

3f) Identische Änderung 1:1 in internal.html durchführen (gleiche Funktionsnamen/Variablennamen wie in index.html verwenden, damit künftige Diffs zwischen beiden Dateien nachvollziehbar bleiben).

============================================================
SCHRITT 4 — SICHTBARES ERGEBNIS NACH DER UMSETZUNG (konkret, Beispiel-Klickpfad)
============================================================
Vorher: Suche nach einer Gemeinde in der Suchleiste zoomt auf die Punkte und öffnet ein simples Popup "Gemeinde XY — N Objekt(e) gefunden".

Nachher, Beispiel-Klickpfad zum manuellen Testen (lokal via `python server.py` oder `python tools/server.py`, dann http://localhost:8000):
1. Karte öffnen, oben links ins Suchfeld "Erkelenz" tippen (Kläranlage "Erkelenz-Mitte" existiert dort laut Daten).
2. Im Dropdown erscheint ein Treffer mit Tag "Gemeinde" und Label "Erkelenz".
3. Treffer anklicken.
4. Sichtbar: Karte zoomt/pannt wie bisher auf die Punkte in Erkelenz, kurzes Puls-Highlight auf den Markern (bestehendes Verhalten, unverändert).
5. NEU: rechts erscheint zusätzlich das Steckbrief-Panel mit Titel "📋 Gemeinde-Steckbrief: Erkelenz", einem Klartext-Satz nach Muster "In Erkelenz: N Industrieeinleiter, 1 Kläranlage, N Grundwassermessstellen. Nächster Pegel: {Name} ({X} km entfernt).", darunter eine Zahlen-Liste je Kategorie.
6. Klick auf das X im Panel schließt es, die Karte bleibt gezoomt (Panel-Schließen darf NICHT die Kartenansicht zurücksetzen).
7. Erneute Gemeinde-Suche ersetzt den Panel-Inhalt (kein Stapeln mehrerer Panels).

============================================================
SCHRITT 5 — NEUE DATEN NÖTIG? NEIN für v1 (explizit begründet)
============================================================
Für dieses Feature ist KEIN neuer ELWAS-Scrape nötig. Begründung: alle benötigten Kennzahlen (Industrieeinleiter, Kläranlagen, Grundwassermessstellen — alle mit `gemeinde`-Attribut) sind bereits im Repo vorhanden (elwas_einleiter.geojson, klaeranlagen.geojson, grundwassermessstellen.geojson). `elwas_toolkit/sitemap_links.json` (alle 34 ELWAS-Datensätze) enthält KEINEN Verwaltungsgrenzen/Gemeindegrenzen-Datensatz — ELWAS-WEB ist ein Wasserwirtschafts-Fachportal, keine Quelle für Verwaltungsgeometrie. `elwas_toolkit/elwas_client.py` (Playwright-Automatisierung, u.a. `fill_regional_search()` für das "BR/Kreis/Gemeinde"-Suchfeld) ist NICHT relevant für dieses Feature — dieses Feld dient nur zum Filtern INNERHALB eines ELWAS-Datensatzes, liefert aber keine Grenz-Polygone.

Falls in einer SPÄTEREN Iteration eine echte Punkt-in-Polygon-Prüfung gegen echte Gemeindegrenzen gewünscht wird (z.B. um auch Akteure/Institutionen ohne `gemeinde`-Attribut korrekt zuzuordnen, oder um die Gemeindegrenze selbst wie beim bestehenden Kreis-Layer (`kreise_rr.geojson`, Style: gestrichelte schwarze Linie) auf der Karte einzuzeichnen): Quelle wäre NICHT ELWAS, sondern offene Verwaltungsgrenzen-Geodaten NRW (z.B. Geobasis NRW / OpenNRW opendata.nrw.de, Datensatz "Verwaltungsgebiete NRW", Gemeinde-Ebene, WFS/GeoJSON, freie Lizenz) oder ersatzweise OpenStreetMap/Overpass (`admin_level=8`). Das ist explizit AUSSERHALB des Scopes dieses Auftrags — nur als Kommentar/TODO im Code vermerken, NICHT umsetzen.

============================================================
SCHRITT 6 — TEST- UND VERIFIKATIONSPFLICHT (ECHTER DATEN-SPOTCHECK, PFLICHT)
============================================================
"Keine Konsolenfehler" ist NICHT ausreichend und gilt NICHT als "fertig". Bei früheren Antigravity-Datensätzen (Stauanlagen/Regenbecken) waren Felder wie `betreiber`/`gewaesser` zu 100% falsch, obwohl "fertig" gemeldet wurde — das darf sich hier nicht wiederholen. Zwingend vor "fertig"-Meldung:

1. JS-Konsole öffnen, Suche testen, KEINE Fehler — das ist nur die Minimalbedingung, nicht der Test selbst.
2. Für MINDESTENS 3 unterschiedliche Gemeinden (z.B. "Erkelenz", "Aachen", "Baesweiler" — unterschiedliche Größenordnungen) die im Panel angezeigten Zahlen manuell gegen die Rohdaten gegenchecken, z.B.:

    python -c "
    import json
    gemeinde = 'Erkelenz'
    for fn, cat in [('elwas_einleiter.geojson','einleiter'), ('klaeranlagen.geojson','klaeranlage'), ('grundwassermessstellen.geojson','gwm')]:
        d = json.load(open(fn, encoding='utf-8'))
        n = sum(1 for f in d['features'] if f['properties'].get('gemeinde') == gemeinde)
        print(cat, n)
    "

   Diese Python-Ausgabe MUSS exakt mit den im UI angezeigten Zahlen übereinstimmen (nicht "ungefähr passt", exakt). Bei Abweichung: Bug im Aggregations-Code, nicht in den Rohdaten — nachbessern.
3. Nächster-Pegel-Berechnung für dieselben 3 Gemeinden manuell plausibilisieren: Gemeinde auf der Karte anschauen, den angezeigten Pegel-Namen suchen (Suchfeld), Luftlinie grob mit dem Leaflet-Zoom-Maßstab abschätzen und mit der angezeigten km-Zahl vergleichen (Größenordnung muss stimmen, nicht auf den Meter genau).
4. Sicherstellen, dass für eine Gemeinde OHNE Kläranlagen-Eintrag (z.B. eine kleine Gemeinde) der Satz grammatikalisch sauber bleibt (kein "In X: , 3 Grundwassermessstellen." mit führendem Komma) und NICHT "0 Kläranlagen" erfunden erscheint, wo eigentlich schlicht keine Daten vorliegen — Unterschied zwischen "0 gezählt" und "keine Daten" beachten, insbesondere weil Regenbecken laut Schritt 2a systematisch 0% Coverage hat und deshalb komplett weggelassen werden muss (nicht als "0 Regenbecken" auftauchen).
5. Screenshot/DOM-Check des Panels in BEIDEN Dateien (index.html UND internal.html) sowie in Light- UND Dark-Theme (Theme-Toggle testen) — Kontrast/Lesbarkeit prüfen.
6. Mobile-Breite testen (Browser-DevTools, <480px) — Panel darf die Suchleiste/den Filter-Sidebar nicht verdecken.

============================================================
SCHRITT 7 — COMMIT & WORKFLOW
============================================================
Workflow (autonom, ohne Rückfrage sobald Scope wie oben klar ist): build → lokal testen (Schritt 6 vollständig durchlaufen) → committen → pushen → live auf https://adb-aquarevier-secure.surge.sh verifizieren (Deploy dauert ca. 1-2 Minuten nach Push, GitHub Actions Status prüfen).

Vor jedem Commit: `git pull` (bzw. `git pull --rebase` bei Konflikten, dann Retry — niemals `--force` pushen).

Commit-Message-Konvention (siehe `git log --oneline`, Präfix-Stil dieses Repos):
`feat: Gemeinde-Steckbrief bei Ortsauswahl in Unified Search (Klartext-Zusammenfassung)`

Body optional mit Stichpunkten zu den wichtigsten Entscheidungen (attributbasiert statt Turf.js, Regenbecken/Akteure bewusst ausgeklammert wegen fehlender Gemeinde-Zuordnung in den Rohdaten). Nach dem Push: GitHub-Actions-Deploy abwarten, dann https://adb-aquarevier-secure.surge.sh live im Browser öffnen und Schritt 4 (Klickpfad) dort NOCHMAL nachvollziehen — ein rein lokaler Test gilt nicht als abgeschlossen.
```

</details>

---

## 4. Grundwassergleichenplan (Isolinien statt Einzelpunkte) (ERLEDIGT)

**Kategorie:** Hydrologie

**Mehrwert:** 3746 Grundwassermessstellen als Einzelpunkte zeigen keine räumliche Struktur. Stakeholder müssen verstehen, wo der Grundwasserspiegel wie tief liegt und wohin er strömt — der hydrogeologische Standard-Blick, den ELWAS-WEB nicht liefert und der das Flaggschiff-Dataset der Karte erst wirklich lesbar macht.

**Technischer Ansatz (Kurzfassung):** IDW- oder Kriging-Interpolation (scipy/pykrige) auf Basis aktueller Grundwasserstände, Ausgabe als Contour-GeoJSON (turf.js isobands), als toggle-bare Overlay mit Farbverlauf; Neuberechnung batchartig bei Datenupdate.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG FÜR ANTIGRAVITY: Grundwassergleichenplan (Isolinien-Layer) für die Akteurskarte

KONTEXT
- Repo-Root: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (git, github.com/Dtunder/adb_aquarevier_map, Branch main)
- Vor Start: git pull. Bei Push-Konflikten (parallele Agenten arbeiten am selben Checkout): pull/rebase + retry, KEIN force-push.
- Push auf origin/main triggert automatisch GitHub Actions -> Deploy auf Surge.sh:
  - index.html -> https://adb-aquarevier-secure.surge.sh (öffentlich, anonymisiert)
  - internal.html -> Florians Editor-Tool (strukturell fast identisch zu index.html, lädt aber contacts.geojson statt contacts_anonymized.geojson)
- Arbeite den gesamten Auftrag EIGENSTÄNDIG und AUTONOM ab, ohne bei jedem Teilschritt nachzufragen. Nur bei einem echten Blocker (siehe Schritt 2, Datenverfügbarkeit) innehalten und dokumentieren statt zu raten oder Platzhalterdaten zu erfinden.
- Etablierter Workflow in diesem Repo (einhalten): Build-Skript(e) laufen lassen -> Output lokal prüfen -> Frontend-Code ändern -> lokal im Browser testen (server.py) -> committen -> pushen -> auf der LIVE-Domain verifizieren.

ZIEL
Ein neuer, toggle-barer Kartenlayer "Grundwassergleichenplan", der die ~4400 Grundwassermessstellen im Rheinischen Revier NICHT mehr nur als Einzelpunkte zeigt, sondern als flächige Isolinien/Isobänder (Grundwasserstand in m ü. NHN), berechnet per IDW- oder Kriging-Interpolation. Vorbild für "vorberechneter Flächenlayer" im Repo ist der bestehende catchmentStatsLayer (Choroplethenkarte, siehe Schritt 1).

---

## SCHRITT 1: Bestandsaufnahme (erst grep/lesen, dann handeln)

Lies NICHT ganze Dateien unstrukturiert ein. Grep gezielt nach folgenden Ankern (Zeilennummern verschieben sich, gilt nur als Orientierung, Stand dieses Auftrags):

1. `grundwassermessstellen.geojson` (Root, ~1.5MB) und `elwas_raw_data/grundwassermessstellen.geojson` (identischer Inhalt) ansehen (`python -c "import json; d=json.load(open('grundwassermessstellen.geojson',encoding='utf-8')); print(len(d['features'])); print(d['features'][0]['properties'])"`).
   WICHTIG: Aktuell enthalten die Properties NUR `name, gemeinde, kreis, eigentuemer, messstellenart, genauigkeit, quelle` – KEIN Grundwasserstand-Wert. Das ist der zentrale Grund, warum Schritt 3 (neuer Scrape) nötig ist.
2. `elwas_raw_data/build_gwm_geojson.py` – bestehendes Build-Skript, das die anonymisierten UTM-Koordinaten (Dekameter-Fix beachten, ist im Docstring dokumentiert!) nach WGS84 konvertiert.
3. `elwas_raw_data/scrape_grundwassermessstellen.py` – bestehender Scraper (Tabellen-Scrape über alle 7 Kreise, Pagination via "Seite X von Y", KEIN Excel-Export nutzbar). Liefert nur Stammdaten, keine Messwerte.
4. `elwas_toolkit/elwas_client.py` – wiederverwendbares Playwright-Toolkit (siehe Schritt 3).
5. `elwas_toolkit/ELWAS_GESAMTPLAN.md` und `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` – dokumentieren u.a., dass die Grundwassermessstellen-Detailseite ein Dropdown mit Unteransichten hat: Stammdaten/Lage/Grundwasserleiter/Ausbau/Wasserstandsganglinie/... . Genau dort müssen die Wasserstandswerte herkommen.
6. In `index.html`: grep nach `loadGwmLayer`, `gwmLayer`, `catchmentStatsLayer`, `overlayMaps`, `cnt-layer-gwm`, `data-layer-name="💧 Grundwassermessstellen`, `updateSidebarCounters`. Das sind die exakten Stellen, an denen sich der neue Layer einklinken muss (siehe Schritt 5).
7. Dieselben Anker in `internal.html` gegenprüfen (fast identischer Code, aber NICHT blind annehmen, dass Zeilennummern gleich sind – dort ebenfalls grep-basiert vorgehen).
8. `elwas_raw_data/build_regenbecken_geojson.py`, `build_stauanlagen_geojson.py`, `build_querbauwerke_geojson.py` – neuere Build-Skripte enden mit `shutil.copy(OUT_PATH, ROOT_PATH)`, um das fertige GeoJSON automatisch nach Root zu kopieren (von wo es index.html/internal.html per relativem `fetch()` laden). Diesem Muster folgen.
9. Verfügbare Python-Libs prüfen: `scipy`, `numpy`, `shapely`, `pyproj` sind bereits installiert; `pykrige` ist es NICHT. Daher: Standardweg ist IDW via `scipy.spatial.cKDTree` (kein neues Dependency). Kriging (pykrige, `pip install pykrige`) nur als Option, falls IDW-Ergebnis zu artefaktbehaftet aussieht – dann eigenständig nachinstallieren, keine Rückfrage nötig.

Betroffene Dateien (wahrscheinlich, nicht abschließend):
- `index.html`, `internal.html` (Frontend-Integration)
- `elwas_raw_data/scrape_grundwassermessstellen.py` (ggf. erweitert) oder neuer Scraper `elwas_raw_data/scrape_gwm_stand.py`
- `elwas_raw_data/build_gwm_geojson.py` (erweitert um Wert-Property)
- neues Skript `elwas_raw_data/build_grundwassergleichen.py` (Interpolation + Isobänder)
- neue Root-Datei `grundwassergleichen.geojson` (Output, wird von der Karte geladen)
- `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` (Doku-Eintrag ergänzen, wie bei allen bisherigen ELWAS-Datensätzen üblich)

---

## SCHRITT 2: Feasibility-Check BEVOR der volle Scrape läuft (kritisch!)

Bevor du 4400 Messstellen-Detailseiten scrapst, verifiziere an 3-5 Stichproben-Messstellen (unterschiedliche Kreise), ob und wie an einen aktuellen Grundwasserstand heranzukommen ist. Öffne dazu z.B. via `elwas_client.py` (`open_dataset` + `open_detail_row` + `get_detail_tab_options` + `switch_detail_tab(frame, "Wasserstandsganglinie")`) eine echte Detailseite und prüfe:

a) Gibt es im Tab "Wasserstandsganglinie" eine zugrunde liegende DATENTABELLE (scrapbar) oder ist es NUR ein Chart/SVG/Canvas-Graph (nicht direkt scrapbar)?
b) Falls Tabelle vorhanden: Ist der jüngste Wert klar als "aktuell" identifizierbar (Datum + Wert in m ü. NHN oder m unter Flur)? Notiere die Einheit exakt – das entscheidet, ob du noch die Geländehöhe (Tab "Ausbau" oder "Lage") brauchst, um auf m ü. NHN umzurechnen.
c) Falls NUR Chart ohne Tabelle: Prüfe, ob es einen Tooltip/Hover-Datenpunkt im DOM gibt (manche Chart-Libs rendern die Werte als `data-*`-Attribute oder in einem verstecken `<table>` neben dem Canvas) – kurz im DOM inspizieren (`page.content()` oder `frame.evaluate`).
d) Prüfe zusätzlich, ob die ERGEBNISTABELLE (die bereits gescrapte Listenansicht) noch weitere Spalten jenseits der bisher gespeicherten Indizes 0-6/12 hat (die alten Scraper haben nur ausgewählte `row[i]`-Indizes gespeichert – ggf. steckt ein "aktueller Grundwasserstand" bereits als Tabellenspalte drin, was den kompletten Detail-Scrape unnötig machen würde). Das wäre der deutlich günstigere Weg – zuerst prüfen!

Ergebnis dieser Prüfung bestimmt den Umfang von Schritt 3. Falls sich herausstellt, dass Wasserstandswerte bei diesem Datensatz gar nicht in vertretbarem Aufwand/Zuverlässigkeit zu bekommen sind: KEINE Platzhalter- oder Zufallswerte erzeugen. Stattdessen ehrlich in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` dokumentieren, was geprüft wurde und warum es nicht geht, und den Isolinien-Teil des Features als "nicht umsetzbar mangels Datengrundlage" markieren statt ihn mit Fake-Daten "fertig" zu melden.

---

## SCHRITT 3: Neuer/erweiterter ELWAS-Scrape (nur falls Schritt 2 grünes Licht gibt)

- Wiederverwende `elwas_toolkit/elwas_client.py` konsequent (keine neue Playwright-Boilerplate): `new_browser`, `open_dataset` (Sitemap-Eintrag "Grundwassermessstellen" aus `elwas_toolkit/sitemap_links.json`), `fill_regional_search`, `submit_search`, `open_detail_row`, `get_detail_tab_options`, `switch_detail_tab`, `extract_field`.
- Neues Skript: `elwas_raw_data/scrape_gwm_stand.py`. Iteriert über die bereits bekannten 4410 aktiven Messstellen aus `elwas_raw_data/grundwassermessstellen.json` (gruppiert nach den 7 Kreisen wie im bestehenden Scraper), öffnet pro Messstelle die Detailseite, wechselt in den relevanten Tab (Wasserstandsganglinie bzw. den in Schritt 2 identifizierten Tab) und liest den jüngsten Wert + Datum aus.
- ZWINGEND wie bei allen bestehenden ELWAS-Scrapern: inkrementell/resumable speichern (Fortschritt nach jedem Kreis oder alle N Messstellen in eine JSON-Datei schreiben, z.B. `elwas_raw_data/grundwassermessstellen_stand.json`, und beim Neustart bereits erledigte Einträge überspringen – Muster siehe `scrape_grundwassermessstellen.py`).
- Bei 4400 Detailseiten-Aufrufen ist mit mehreren Stunden Laufzeit zu rechnen (auch als Background-Bash laufen lassen, nicht blockierend warten). Wenn die Vollständigkeit zeitlich/technisch nicht sauber erreichbar ist: lieber ein sauberes Teilergebnis mit klar dokumentierter Abdeckung (z.B. "3100 von 4410 Messstellen mit Wert, Rest ohne aktuellen Messwert – wird bei der Interpolation als fehlend behandelt, NICHT interpoliert-vorgetäuscht") als ein sauber wirkendes aber unvollständig/falsch befülltes Ergebnis.
- Merge das Ergebnis in `elwas_raw_data/build_gwm_geojson.py`: jedes Feature bekommt zusätzlich `grundwasserstand_m_nhn` (float, null falls kein Wert) und `stand_datum` (ISO-Datum des Messwerts, null falls unbekannt). Danach `python elwas_raw_data/build_gwm_geojson.py` neu laufen lassen und wie die neueren Build-Skripte per `shutil.copy` nach Root synchronisieren.

---

## SCHRITT 4: Interpolation + Isoband-GeoJSON (Python, batch, analog zu build_catchment_stats.py)

Neues Skript: `elwas_raw_data/build_grundwassergleichen.py`.

- Input: `grundwassermessstellen.geojson` (mit den neuen Wert-Properties aus Schritt 3), gefiltert auf Features mit `grundwasserstand_m_nhn != null`.
- Interpolation: IDW über `scipy.spatial.cKDTree` (Standard, kein neues Dependency) auf einem regelmäßigen Gitter über die Bounding Box des Rheinischen Reviers (siehe `rur_einzugsgebiet_outline.geojson` / `kreise_rr.geojson` für die Referenzgeometrie). Alternativ Kriging via `pykrige` (`pip install pykrige`), falls das visuell plausiblere Isolinien liefert – deine Entscheidung, kein Rückfrage-Punkt.
- KRITISCHER Korrektheits-Punkt: Gitterpunkte, die weiter als ein vernünftiger Schwellwert (z.B. 3-5 km, oder außerhalb der Convex Hull / eines Buffers um die realen Messstellen) von der nächsten echten Messstelle entfernt liegen, MÜSSEN maskiert/ausgeschnitten werden (NaN, kein Isoband dort). Sonst entstehen an den Rändern (v.a. außerhalb des Rheinischen Reviers) frei erfundene Extrapolations-Artefakte, die wie echte Messwerte aussehen – das ist der gleiche Fehlertyp wie die dokumentierten Vorfälle bei Stauanlagen/Regenbecken, nur eine Ebene tiefer (nicht falsches Feld, sondern falsch aussehende Fläche).
- Isobänder aus dem Gitter extrahieren (z.B. `matplotlib.pyplot.contourf` mit `Agg`-Backend, Pfade der `QuadContourSet` auslesen und zu Shapely-Polygonen/GeoJSON konvertieren – KEIN Live-Rendering, nur Pfad-Extraktion). Sinnvolle Klassenbreite wählen (z.B. alle 2,5 oder 5 m ü. NHN, je nach Wertespanne im Rheinischen Revier).
- Output-Schema pro Isoband-Feature (Polygon/MultiPolygon, EPSG:4326): `level_min`, `level_max` (float, m ü. NHN), `unit` = "m ü. NHN", `methode` ("IDW" oder "Kriging"), `stand_datum` (Erzeugungsdatum des Layers, nicht Messdatum), `n_stationen` (Anzahl der für die Interpolation verwendeten Messstellen), `quelle` = "ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung - Version 2.0, interpoliert (IDW)".
- Output-Datei: `grundwassergleichen.geojson`, per `shutil.copy` nach Root (analog `build_regenbecken_geojson.py`).
- Kommentar-Header im Skript (Deutsch, wie im gesamten Repo üblich) mit Methodik + Datenstand + bekannten Einschränkungen (z.B. maskierte ~100m-Koordinatengenauigkeit der Eingabepunkte, s. `build_gwm_geojson.py`-Docstring).
- Dieses Skript soll wiederholt ausführbar sein (Neuberechnung bei Datenupdate laut Aufgabenstellung) – keine Handarbeit/manuelle Schritte im Ablauf.

---

## SCHRITT 5: Frontend-Integration (index.html UND internal.html, beide identisch anpassen)

Folge exakt dem bestehenden Muster von `gwmLayer`/`loadGwmLayer()` (Lazy-Load per `map.on('overlayadd', ...)`) und `catchmentStatsLayer` (Flächen-Choroplethe mit `style: function(feature) {...}` nach Werte-Farbskala). Konkret:

1. Neue Layer-Variable (z.B. `gwIsoLayer = L.layerGroup()`), Lazy-Load-Funktion `loadGwIsoLayer()` die `grundwassergleichen.geojson` per `fetch()` lädt, in eine modulweite Variable `gwIsoGeoData` schreibt (für Counter, siehe Punkt 4) und via `L.geoJSON(data, { style: ..., onEachFeature: ... }).addTo(gwIsoLayer)` rendert. Hook per `map.on('overlayadd', function(e) { if (e.layer === gwIsoLayer) loadGwIsoLayer(); })`, exakt wie bei `gwmLayer`.
2. Farbskala: sequenzielle, farbenblind-sichere Skala (das Repo nutzt bereits eine Okabe-Ito-Palette für Marker, siehe bestehende Farbcodes wie `#56B4E9`, `#0072B2`, `#009E73` – konsistent bleiben, z.B. Blauverlauf hell->dunkel oder ein etabliertes Sequential-Farbschema). `style: function(feature) { return { fillColor: colorForLevel(feature.properties.level_min), fillOpacity: 0.55, color: '<Randfarbe>', weight: 0.5 }; }`.
3. Neuer Sidebar-Button im Block "🗺️ Fachdaten & Layer" (nach dem Grundwassermessstellen-Button einfügen, gleiche Struktur):
   ```html
   <button class="filter-btn" data-layer-name="🌊 Grundwassergleichenplan (Isolinien)" title="Interpolierter Grundwasserstand als Flächenkarte (IDW/Kriging auf ELWAS-Messstellen)">
       <span class="swatch" style="background: linear-gradient(90deg, <hell>, <dunkel>);"></span>
       <span class="filter-label">Grundwassergleichen</span>
       <span class="counter-badge" id="cnt-layer-gwiso">(0/0)</span>
   </button>
   ```
   Standardmäßig AUS (kein `active`-Klasse), analog zum Grundwassermessstellen-Punktelayer, um die Karte nicht zuzukleistern.
4. In `overlayMaps` (JS-Objekt, das Button-Label auf Leaflet-Layer mappt) den neuen Eintrag `"🌊 Grundwassergleichenplan (Isolinien)": gwIsoLayer` ergänzen (identischer String wie `data-layer-name`!).
5. In `updateSidebarCounters()`, Abschnitt "3. Layer counters": neuen `else if (layerName.includes("Grundwassergleichen")) geoData = gwIsoGeoData;`-Zweig ergänzen. Die bestehende Zähllogik verarbeitet Polygon-Geometrien bereits generisch (siehe `Einzugsgebiet-Statistik`-Layer) – keine neue Zählmethode nötig, nur die Variable verdrahten.
6. Popup/Tooltip pro Isoband-Fläche: Wertebereich ("115–120 m ü. NHN"), Methodik-Hinweis ("Interpoliert aus N Messstellen, keine Einzelmessung – siehe Grundwassermessstellen-Layer für Rohdaten"), Datenstand, Quelle (analog zum bestehenden Quellenzeilen-Stil in den anderen Popups, z.B. `catchmentStatsLayer`).
7. Legende: neues kleines, floatendes Panel (eigene `div`, z.B. `#gwiso-legend`, unten links, damit es sich nicht mit der bestehenden `L.control.layers`-Box oben rechts beißt), das die Farbskala mit Achsenbeschriftung in "m ü. NHN" zeigt. Wird zusammen mit dem Layer ein-/ausgeblendet (gleicher `overlayadd`/`overlayremove`-Hook wie der Layer selbst, plus `overlayremove`-Fall zum Ausblenden). Hinweis: Es gibt aktuell KEINE generelle Legende mehr auf der öffentlichen Karte (wurde bewusst entfernt, Commit `7f5f19f`) – diese neue Legende ist layer-spezifisch und darf NICHT permanent sichtbar sein, nur wenn der Layer aktiv ist.
8. `<script src=".../leaflet.markercluster...">`-Block NICHT anfassen – für Flächen-Isobänder wird kein Clustering gebraucht, normales `L.geoJSON`/`L.layerGroup` reicht (wie bei `catchmentStatsLayer`).
9. KEIN turf.js/Client-seitige Contour-Berechnung einbauen – die Isobänder kommen fertig berechnet aus Schritt 4 (Python, batch), das Frontend rendert nur fertiges GeoJSON. Das ist konsistent mit dem bestehenden Precompute-Muster (`build_catchment_stats.py` -> `rur_einzugsgebiet_stats.geojson`) und vermeidet ein neues CDN-Dependency.
10. PDF/PNG-Report-Generator (`add_export_logic.js` u.ä.) NICHT erweitern müssen – das ist für Kontakt-/Abwasseraggregation gebaut und für einen Flächenlayer kein sinnvoller Fit. Nur sicherstellen, dass ein aktivierter Grundwassergleichen-Layer den bestehenden Export nicht zum Absturz bringt (kurzer Test: Layer an, Export klicken, keine Konsolenfehler).

---

## SICHTBARES ERGEBNIS AUF DER WEBSEITE NACH UMSETZUNG (exakter Klickpfad zur eigenen Kontrolle)

1. Öffne https://adb-aquarevier-secure.surge.sh (bzw. lokal http://localhost:8000 während der Entwicklung).
2. In der linken Sidebar, Block "🗺️ Fachdaten & Layer": ein NEUER Button "Grundwassergleichen" mit Farbverlauf-Swatch und Counter-Badge "(0/0)", zwischen "Grundwassermessstellen" und "Flusspegel" (oder direkt danach).
3. Klick auf diesen Button: Button wird `active` (visuell hervorgehoben wie die anderen aktiven Layer-Buttons), auf der Karte über dem Rheinischen Revier erscheinen farbige, ineinander übergehende Flächenbänder (kein Einzelpunkte-Gewusel), Counter-Badge aktualisiert sich auf eine echte Zahl (z.B. Anzahl Isoband-Polygone oder genutzte Messstellen, ungleich "0/0").
4. Unten links erscheint gleichzeitig ein kompaktes Legenden-Panel mit der Farbskala und Beschriftung in "m ü. NHN".
5. Klick/Hover auf eine Fläche: Popup/Tooltip mit Wertebereich (z.B. "120–125 m ü. NHN"), Hinweis "interpoliert", Quellenangabe.
6. Zusätzlich den bestehenden Button "Grundwassermessstellen" aktivieren: die Original-Messpunkte erscheinen zusätzlich zur Fläche (zur visuellen Plausibilitätsprüfung, dass die Isolinien grob zu den Punktwerten passen).
7. Klick auf "Grundwassergleichen"-Button erneut: Fläche UND Legende verschwinden wieder vollständig, Counter zurück auf "(0/0)".
8. Kein Effekt auf andere Layer, Filter, Suche oder den bestehenden PDF/PNG-Export (die bleiben unverändert funktionsfähig).

---

## TEST-/VERIFIKATIONSPFLICHT (nicht optional, nicht nur "keine Konsolenfehler")

```
test: add golden-sample regression fixtures for ELWAS extraction (stauanlagen/regenbecken/querbauwerke)
```

Body optional, z.B. kurz erwähnen, dass dies den 2026-07-15-Regex-Kontaminations-Bug (`STATUS_FUER_ANTIGRAVITY.md` Abschnitt 7) offline abgedeckt hätte.

Workflow (autonom durchziehen, keine Rückfrage bei jedem Schritt, sobald Scope klar ist — er ist es):
1. `git pull` (Konflikt → rebase + retry, kein force-push)
2. bauen (Abschnitt 1)
3. lokal testen inkl. Pflicht-Mutationstest (Abschnitt 4)
4. `git add elwas_toolkit/fixtures elwas_toolkit/tests elwas_toolkit/capture_fixtures.py` (gezielt, NICHT `git add -A` — dirty tree von anderen Agents nicht mit einsammeln)
5. committen mit obiger Message
6. `git push origin main` (bei Reject: `git pull --rebase`, dann erneut pushen, kein `--force`)
7. Auto-Deploy abwarten, kurzer Live-Smoke-Check (Abschnitt 4.5)
8. Kurzes Update an `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` anhängen (neuer Abschnitt, analog zu den bisherigen Antigravity-Updates dort): was gebaut wurde, Pfad zur Testsuite, Ergebnis des Mutationstests, der optionale `extract_field`-Fund aus Abschnitt 3.
```

</details>

---


---

# Runde 2 (Volltext)

# AquaRevier — Runde 2: 15 weitere Vorschläge + Antigravity-Aufträge

Dritte Ideation-Runde insgesamt, dieses Mal strikt gegen alle vorherigen ~26 Vorschläge (Runde 1-3 + Live-Features) dedupliziert. 53 Rohvorschläge aus 7 Perspektiven (inkl. neu: Governance/Recht/Datenschutz, Öffentlichkeitsarbeit/Community), auf 15 verdichtet.

⚠️ **Wichtigster Fund dieser Runde (Priorität 5, aber kein Feature-Wunsch):** Impressum &amp; Datenschutzerklärung fehlen auf der Live-Seite komplett — bei einer öffentlichen Karte mit personenbezogenen Kontaktdaten ein echtes Compliance-Risiko (§5 DDG, Art. 13 DSGVO), nicht optional.

---

## Inhaltsverzeichnis

1. [Gewässergüte-Layer: Chemischer & ökologischer Zustand nach EU-WRRL](#1-gewaesserguete-layer-chemischer--oekologischer-zustand-nach-eu-wrrl) — *Fachdaten/Hydrologie*
2. [Automatisierte Sprechzettel- & Beschlussvorlagen-Generierung aus Kartenzustand](#2-automatisierte-sprechzettel---beschlussvorlagen-generierung-aus-kartenzustand) — *Stakeholder-Kommunikation*
3. [Nährstoff-/Nitratbelastung im Grundwasser](#3-naehrstoff--nitratbelastung-im-grundwasser) — *Fachdaten/Hydrologie*
4. [Zuständigkeits-/Ansprechpartner-Layer](#4-zustaendigkeits--ansprechpartner-layer) — *Stakeholder-Kommunikation*
5. [Impressum & Datenschutzerklärung als Pflichtseiten](#5-impressum--datenschutzerklaerung-als-pflichtseiten) — *Recht/Compliance*
6. [Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking](#6-nutzer-feedback-kanal-fuer-datenfehler-mit-status-tracking) — *Datenqualität*
7. [Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf](#7-struktureller-daten-audit-trail-change-feed-pro-scrape-lauf) — *Datenqualität*
8. [Playwright-basierte UI-Regressionssuite (Visual + Funktional)](#8-playwright-basierte-ui-regressionssuite-visual-+-funktional) — *Qualitätssicherung/Testing*
9. [Update-Radar: Was hat sich seit dem letzten Besuch geändert?](#9-update-radar-was-hat-sich-seit-dem-letzten-besuch-geaendert?) — *UX*
10. [Offener Datenexport (GeoJSON/CSV) für Dritte mit Lizenz- und Versionsstempel](#10-offener-datenexport-geojson-csv-fuer-dritte-mit-lizenz--und-versionsstempel) — *Daten-Infrastruktur/Open Data*
11. [Synthetic Uptime-Watchdog für externe WMS-/ELWAS-Quellen](#11-synthetic-uptime-watchdog-fuer-externe-wms--elwas-quellen) — *Zuverlässigkeit/Ops*
12. [Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis](#12-coverage-anomalie-erkennung-ueber-record-counts-pro-layer-kreis) — *Datenqualität*
13. [Rollenbasiertes Onboarding mit Kontext-Tour](#13-rollenbasiertes-onboarding-mit-kontext-tour) — *UX/Onboarding*
14. [Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung)](#14-oekologische-durchgaengigkeit-an-querbauwerken-fischwanderung) — *Fachdaten/Hydrologie*
15. [Embed-Widget-Generator für Drittseiten (iframe/oEmbed)](#15-embed-widget-generator-fuer-drittseiten-iframe-oembed) — *Öffentlichkeitsarbeit*
16. [Cross-Layer-Korrelation Industrielast/Pegel-Abfluss](#16-cross-layer-korrelation-industrielastpegel-abfluss) — *Fachdaten/Hydrologie*
17. [Grundwasserwiederanstieg-Layer](#17-grundwasserwiederanstieg-layer) — *Fachdaten/Hydrologie*
18. [Niedrigwasser-Trend](#18-niedrigwasser-trend) — *Fachdaten/Hydrologie*
19. [Risiko-Ampel pro Einleiter](#19-risiko-ampel-pro-einleiter) — *Datenqualität*
20. [Fördergebiete-Overlay](#20-foerdergebiete-overlay) — *Stakeholder-Kommunikation*
21. [teilbare Filter-Links](#21-teilbare-filter-links) — *UX*
22. [Kläranlagen-Kapazitätsreserve](#22-klaeranlagen-kapazitaetsreserve) — *Fachdaten/Hydrologie*

---

## 1. Gewässergüte-Layer: Chemischer & ökologischer Zustand nach EU-WRRL

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** ELWAS bewertet alle Oberflächenwasserkörper nach WRRL (chemisch: gut/nicht gut; ökologisch: sehr gut bis schlecht) - bisher zeigt die Karte nur Mengen-/Pegeldaten, keine Qualitätsklassifizierung. Beantwortet die in Stakeholder-Gesprächen häufigste Frage ('ist unser Gewässer gut oder schlecht?') erstmals direkt und liefert damit einen fundamentalen Fakten-Baustein für Politik- und Wasserverbandsgespräche.

**Technischer Ansatz (Kurzfassung):** Neuer Vektor-Layer je Fließgewässerabschnitt, 5-Klassen-Ampel in Okabe-Ito-Palette, Datenquelle ELWAS-Bewirtschaftungsplan/LANUV-Fachdaten; Tooltip mit Zustandsklasse + Bewertungszyklus (2015/2021/2027).

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag für Antigravity: Gewässergüte-Layer (chemischer & ökologischer Zustand nach EU-WRRL)

Repo: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (github.com/Dtunder/adb_aquarevier_map, branch main). WICHTIG, da parallel mit Claude am selben Checkout gearbeitet wird: als allererstes `git pull` ausführen. Bei Push-Konflikt NIEMALS force-push, sondern `git pull --rebase` und erneut versuchen. Arbeite diesen Auftrag eigenständig und autonom ab (kein Zwischen-Feedback nötig, der Scope unten ist vollständig) bis inkl. Live-Verifikation.

## Ziel
Neuer Vektor-Layer, der pro Fließgewässerabschnitt (Oberflächenwasserkörper, OWK/FWK) die WRRL-Bewertung zeigt: chemischer Zustand (2 Klassen: gut / nicht gut) und ökologischer Zustand bzw. ökologisches Potenzial (5 Klassen: sehr gut / gut / mäßig / unbefriedigend / schlecht), farblich in der bereits im Projekt etablierten Okabe-Ito-Palette (siehe Commit e4609b2 "colorblind-safe Okabe-Ito marker palette"). Tooltip zeigt Zustandsklasse(n) + Bewertungszyklus.

---

## 1. Schritt-für-Schritt

### 1.1 Datenlage klären (Recon zuerst, nicht blind loslegen)
Zwei mögliche Datenquellen, PRIMÄR und FALLBACK — welche tatsächlich nutzbar ist, musst du selbst durch Herunterladen/Inspizieren feststellen, nicht raten:

**PRIMÄR (wahrscheinlich der direktere Weg): LANUV/Open.NRW Geometrie-Datensatz "Oberflächenwasserkörper NRW (Auflage 3D)"**
- Metadaten-Seite: https://open.nrw/dataset/a71583b3-ea2e-4a41-980d-143d0c18b8b9
- Direkter Download-Ordner (Datenlizenz Deutschland – Zero – Version 2.0, frei nutzbar, kein Login): https://www.opengeodata.nrw.de/produkte/umwelt_klima/wasser/wrrl/owk3d
- Öffne diese URL (Playwright oder requests) und liste den Verzeichnisinhalt — der exakte Dateiname ist nicht vorab bekannt, wahrscheinlich ein Shapefile-Satz (.shp/.dbf/.shx/.prj) oder ein Zip. Lade herunter, öffne mit `pyshp`/`shapefile` (bereits Projekt-Dependency, siehe `convert_hydrology.py`/`convert_shapefiles.py` als Vorlage für das Einlese-Pattern inkl. EPSG:25832→EPSG:4326 via `pyproj`).
- Die Metadaten-Beschreibung erwähnt "zugehörige Fachdaten des Bewirtschaftungsplans" als Teil des Pakets — prüfe als ALLERERSTES die Feldnamen der Attributtabelle (`sf.fields`). Wenn dort bereits Felder für chemischen/ökologischen Zustand + Bewertungszyklus/Bewirtschaftungsplan-Jahr enthalten sind (Namen nicht raten, tatsächlich auslesen), ist das die komplette Datenquelle für dieses Feature — kein ELWAS-Scrape nötig.

**FALLBACK (falls das Shapefile nur Geometrie+ID ohne Bewertungsfelder liefert): ELWAS-WEB "Zustand der Fließwasserkörper"**
- Href (aus `elwas_toolkit/dataset_recon_2026-07-15.json`, Eintrag "Zustand der Fließwasserkörper"): `/elwas-web/data/wrrl/ausw/zustandFwk/auswZustandFwk.xhtml`
- Wiederverwende `elwas_toolkit/elwas_client.py` (siehe `new_browser`, `open_dataset`, `get_frame`, `discover_search_fields`). ACHTUNG, Abweichung vom Standard-Muster (Pegel/Kläranlagen/Stauanlagen): das ist ein zweistufiges "Vorauswahl"-Formular, `submit_search()` aus dem Toolkit greift NICHT (kein `input[value='Suchen']` auf Stufe 1). Stattdessen: zwei Pflicht-Selects "Fachbereich" (Biologie/Chemie) und "Auswertung" (Report-Typ) wählen, dann `input[value='Start']` klicken. Die verfügbaren Auswertung-Optionen wurden im Recon nur mit Default-Werten gesehen — vor dem Scrapen per `discover_search_fields`/`.locator('select').nth(1).locator('option').all_text_contents()` die ECHTEN Optionslabels auslesen (gesucht: eine "Gesamtbewertung"-Option je Fachbereich, z.B. sinngemäß "Chemie Gesamtbewertung FWK" für den 2-Klassen-Chemiestatus und die entsprechende ökologische Gesamtbewertung für die 5 Klassen — exakte Strings verifizieren, nicht raten). Stufe 2 zeigt danach eine vorbefüllte Ergebnistabelle mit Spalten "FWK ID / Bezeichnung FWK / Gewässername" + Bewertungsspalte(n) — das ist dein Join-Key (FWK-ID) zur Geometrie aus 1.1 PRIMÄR (ggf. dort trotzdem das Geometrie-Shapefile laden, nur ohne dessen Bewertungsfelder, und die Klassifikation separat per Join andocken).
- Falls auf Stufe 2 ein Excel-Export-Button existiert: bevorzugen (siehe `has_excel_export`/`click_excel_export` im Toolkit) statt Row-by-Row, bei vermutlich ~1684 Zeilen NRW-weit deutlich robuster.

### 1.2 Geometrie aufs Projektgebiet zuschneiden
Der Datensatz ist NRW-weit — das Projekt deckt nur das Rur-Einzugsgebiet/7 Kreise ab (Düren, Euskirchen, Heinsberg, Mönchengladbach, Rhein-Erft-Kreis, Rhein-Kreis Neuss, Städteregion Aachen). Mit `shapely` (bereits genutzt in `elwas_raw_data/build_catchment_stats.py`) gegen `rur_einzugsgebiet_outline.geojson` (oder `rur_einzugsgebiet.geojson`) filtern/clippen, analog zum bestehenden Spatial-Join-Pattern. Nicht die volle NRW-Geometrie ungefiltert ausliefern (Performance — im Projekt bereits als Backlog-Punkt bekannt: `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` Abschnitt 9 "Performance").

### 1.3 Build-Skript
Neues Skript `elwas_raw_data/build_gewaesserguete_geojson.py`, nach Vorlage von `elwas_raw_data/build_catchment_stats.py` bzw. `build_pegel_geojson.py`. Output-Properties je Feature mindestens: `fwk_id`, `name`/`gewaesser`, `chemischer_zustand` (Wertebereich "gut"/"nicht gut"/null), `oekologischer_zustand` (einer aus: "sehr gut","gut","mäßig","unbefriedigend","schlecht", oder "höchstes"/"gutes"/"mäßiges"/"unbefriedigendes"/"schlechtes Potenzial" falls künstlicher/erheblich veränderter Wasserkörper — Unterscheidung im Quelldatensatz beachten, nicht künstlich gleichsetzen), `bewertungszyklus`/`bewirtschaftungsplan` (das tatsächlich im Datensatz vorhandene Zyklusjahr, NICHT alle drei Jahre 2015/2021/2027 erfinden falls nur ein aktueller Stand vorliegt — wenn nur ein Zyklus verfügbar ist, genau den anzeigen). Datei final nach Projekt-Root kopieren als `gewaesserguete.geojson` (Konvention: alle Layer-Dateien liegen im Root, `elwas_raw_data/` nur als Werkstatt, siehe `stauanlagen.geojson` vs. `elwas_raw_data/stauanlagen.geojson`).

### 1.4 Frontend-Integration — index.html UND internal.html (beide synchron halten!)
Vorlage: der Choroplethen-Layer `catchmentStatsLayer` in `index.html` (grep danach — Lazy-Load via `map.on('overlayadd', ...)`, `style:`-Callback mit Farbfunktion, `onEachFeature` mit `bindTooltip`+`bindPopup`). Für Linien-Geometrie (LineString/MultiLineString) funktioniert dasselbe `L.geoJSON({style, onEachFeature})`-Pattern, nur mit `weight` statt `fillColor` als Haupt-Stilmittel.
- Lazy-Load wie `loadGwmLayer`/`loadCatchmentStatsLayer` (Layer NICHT eager beim Pageload, Konvention wegen bekanntem Performance-Backlog-Punkt), Layer-Group standardmäßig NICHT `.addTo(map)` bei Initialisierung.
- Farben: 5-Klassen-Ampel in Okabe-Ito, aufsteigend nach Zustandsqualität, VORSCHLAG (in dieser Reihenfolge damit farbenblindensicher UND intuitiv von "gut" zu "schlecht" gestuft): sehr gut `#0072B2`, gut `#009E73`, mäßig `#F0E442`, unbefriedigend `#E69F00`, schlecht `#D55E00`. Kein-Daten-Fall: `#94a3b8` (bestehende Konvention aus `catchmentStatsColor`, gleiche Grau-Farbe wiederverwenden). ACHTUNG Kollisionscheck: `#D55E00` ist aktuell die Punktfarbe für Stauanlagen, `#E69F00` für Querbauwerke, `#CC79A7` für Regenbecken (grep `stauanlagenLayer`/`querbauwerkeLayer`/`regenbeckenLayer` zur Bestätigung) — da es sich um Linien- statt Punkt-Symbole handelt ist die Doppelverwendung optisch vertretbar, aber prüfe beim lokalen Test, ob mehrere gleichzeitig aktive Layer verwirrend aussehen; bei echtem Konflikt stattdessen eine 5-stufige Sequenz ausschließlich aus den bislang UNBENUTZTEN Okabe-Ito-Werten + einer manuell interpolierten Zwischenstufe wählen.
- Der chemische Zustand (nur 2 Klassen) lässt sich nicht in derselben Linienfarbe wie der ökologische unterbringen: Linienfarbe/`weight` = ökologischer Zustand (das ist die explizit gewünschte "5-Klassen-Ampel"), chemischer Zustand zusätzlich als Text/Icon in Tooltip UND Popup (z.B. "✅ chemisch gut" / "⚠️ chemisch nicht gut" / "— nicht bewertet").
- Tooltip (sticky, wie beim Vorbild): Gewässername + beide Zustandsklassen + Bewertungszyklus, kurz (analog `tooltipHtml` bei `catchmentStatsLayer`).
- Popup (`popup-card`/`popup-group`/`popup-title`/`popup-detail`-Klassen wiederverwenden, wie bei allen anderen ELWAS-Layern z.B. `stauanlagenLayer`): Gewässername, FWK-ID, chemischer Zustand, ökologischer Zustand/Potenzial, Bewertungszyklus, Quellenzeile ("Quelle: LANUV/Open.NRW WRRL-Bewirtschaftungsplan" bzw. "ELWAS-WEB" je nachdem welche Quelle in 1.1 tatsächlich verwendet wurde).
- In `overlayMaps` (grep danach, `const overlayMaps = {`) einen neuen Eintrag registrieren, z.B. `"💧 Gewässergüte (WRRL, Chemie/Ökologie)": gewaesserguetLayer`. Layer-Steuerung/Sidebar in diesem Projekt hat einen bekannten Stolperstein: Commit `5a91acb` musste `overlayadd`/`overlayremove`-Events reparieren, die beim Sidebar-Refactor (Commit `6b29768`) gekappt wurden — stelle sicher, dass dein neuer Eintrag über denselben zentralen Sidebar-Toggle-Mechanismus läuft wie die bestehenden Layer (grep `overlayMaps[name]` um die Toggle-Handler zu finden), NICHT einen eigenen Sonderweg baut, sonst reißt du dieselbe Klasse Bug wieder auf.
- Eine kurze Legende (Farbe→Klassenname) analog zur bestehenden Marker-Legende ergänzen, damit die Ampel ohne Klick verständlich ist.
- Beide Dateien (`index.html`, `internal.html`) müssen die Integration identisch enthalten (Standard-Konvention in diesem Repo laut Projekt-Kontext).

---

## 2. Sichtbares Ergebnis nach Umsetzung (konkret)

- Im Layer-Control/der Sidebar (dort wo aktuell z.B. "⛰️ Stauanlagen (ELWAS)", "🧱 Querbauwerke (ELWAS)" stehen) erscheint ein neuer Eintrag, z.B. "💧 Gewässergüte (WRRL, Chemie/Ökologie)", standardmäßig AUS (wie die anderen lazy-geladenen Layer).
- Beispiel-Klickpfad:
  1. Öffentliche Karte (https://adb-aquarevier-secure.surge.sh) öffnen.
  2. Sidebar-Layer-Liste öffnen, Häkchen bei "💧 Gewässergüte (WRRL, Chemie/Ökologie)" setzen.
  3. Auf der Karte erscheinen entlang der Fließgewässer im Rur-Einzugsgebiet farbige Linienabschnitte (blau/grün/gelb/orange/rot je nach ökologischem Zustand), zusätzlich eine kleine Legende mit den 5 Farb-Klassen.
  4. Maus über einen Gewässerabschnitt bewegen → Tooltip erscheint sofort mit Gewässername + ökologischem Zustand + chemischem Zustand + Bewertungszyklus, ohne Klick.
  5. Klick auf den Abschnitt → Popup mit denselben Infos ausführlicher plus Quellenangabe.
  6. Häkchen wieder entfernen → Layer verschwindet vollständig, keine Rest-Elemente/Legende bleiben sichtbar.
  7. Dasselbe auf `internal.html` (Florians Editor-Ansicht) wiederholen — identisches Verhalten.

---

## 3. Datenquelle — Zusammenfassung
Kein reines Frontend-Feature — es werden neue Daten gebraucht. Siehe 1.1: primär ein Geometrie+Fachdaten-Download von opengeodata.nrw.de (LANUV/Open.NRW, DL-DE-Zero-2.0, kein Scraping nötig falls die Bewertungsfelder im Shapefile stecken), Playwright-Toolkit (`elwas_client.py`) nur als Fallback für den Fall, dass die Klassifikation separat aus ELWAS-WEB "Zustand der Fließwasserkörper" gezogen werden muss und dann per FWK-ID an die Geometrie gejoint wird. Welcher Fall zutrifft, klärt Schritt 1.1 — nicht vorab annehmen.

---

## 4. Test-/Verifikationspflicht (ausdrücklich, nicht nur "keine Konsolenfehler")

"Keine Konsolenfehler" reicht NICHT als Nachweis — das ist am 2026-07-15 (Stauanlagen/Regenbecken/Querbauwerke: Felder wie `betreiber`/`gewaesser` enthielten wörtlich Tab-Namen/Label-Fragmente statt echter Werte, trotz "0 Konsolenfehler") und am 2026-07-16 (Sidebar-Refactor kappte lazy-load Events, ebenfalls trotz "fertig"-Meldung) bereits schiefgegangen. `test_live_errors.py` in diesem Repo prüft AUSSCHLIESSLICH `pageerror`/`console.error` — das ist bewusst NICHT ausreichend für dieses Feature und darf nicht der einzige Test sein.

Pflicht-Checks vor "fertig":
1. **Datenwerte-Stichprobe (nicht nur Datentyp)**: nach dem Bauen von `gewaesserguete.geojson` mit einem Python-Einzeiler die Werteverteilung von `chemischer_zustand` und `oekologischer_zustand` über ALLE Features ausgeben (`collections.Counter`). Erwartung: mehrere unterschiedliche, plausible Klassenwerte (nicht 100% derselbe Wert, nicht literale Spaltenüberschriften/Tab-Namen wie z.B. "Seiteninhalt" oder "stationierungskarte" — das genaue Fehlerbild vom 2026-07-15). Bei einem einzigen Wert über alle Features: Extraktion ist kaputt, nicht committen.
2. **Visueller Spotcheck mit echten Werten**: lokal `python server.py` starten, Layer einschalten, mind. 3 verschiedene Gewässerabschnitte anklicken/hovern und die tatsächlich angezeigten Tooltip/Popup-Werte gegen die Rohdaten (Shapefile-Attributtabelle bzw. ELWAS-Ergebnistabelle) manuell gegenprüfen — nicht nur, dass IRGENDein Text erscheint.
3. **Event-Verdrahtung**: Sidebar-Toggle für den neuen Layer mehrfach an/aus klicken (Playwright), prüfen dass der Layer tatsächlich erscheint/verschwindet (`map.hasLayer(...)`) UND dass bestehende Layer (z.B. Stauanlagen-Toggle) danach weiterhin funktionieren — Regressionscheck für den bekannten `overlayadd`/`overlayremove`-Bug.
4. **0 Konsolenfehler bleibt zusätzliche Minimalanforderung**, ersetzt aber keinen der obigen Punkte.
5. Dieselben 4 Checks NACH dem Live-Deploy gegen https://adb-aquarevier-secure.surge.sh wiederholen (nicht nur lokal).
6. Gleiches auf `internal.html` verifizieren.

---

## 5. Commit-/Workflow-Konvention

Ablauf wie etabliert, autonom ohne Rückfrage je Schritt sobald der Scope (oben) klar ist: build (Skripte in `elwas_raw_data/`) → lokal mit `python server.py` + Playwright-Spotcheck testen (Abschnitt 4) → committen → `git pull --rebase` (Konfliktsicherheit bei parallelen Agenten) → pushen auf `origin main` (Auto-Deploy via GitHub Actions → Surge.sh) → live mit Playwright verifizieren (Abschnitt 4, Punkt 5).

Commit-Message-Stil (siehe `git log`, Präfix klein geschrieben + Doppelpunkt, danach knapper deutscher Beschreibungstext, mehrere Commits über den Verlauf sind ok, z.B. WIP-Zwischenstand + finaler feat-Commit):
- Beispiel Hauptcommit: `feat: Gewässergüte-Layer (chemischer & ökologischer Zustand nach EU-WRRL)`
- Falls Nacharbeiten nötig (z.B. Feldextraktion korrigieren wie bei den Vorgänger-Layern): `fix: Gewässergüte-Datenextraktion — <konkretes Problem>`

Nach Abschluss: neuen Abschnitt an `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` anhängen (gleiche Konvention wie die bisherigen nummerierten Abschnitte dort) mit: welche Datenquelle tatsächlich verwendet wurde (Shapefile direkt oder ELWAS-Fallback), Feature-Anzahl, welche Bewertungszyklen tatsächlich in den Daten stehen, Ergebnis der Werteverteilungs-Stichprobe aus Abschnitt 4.1, und ob/welche offenen Punkte bleiben — nach demselben Muster wie die Abschnitte 6–9, die dort bereits für die letzten drei Layer existieren.
```

</details>

---

## 2. Automatisierte Sprechzettel- & Beschlussvorlagen-Generierung aus Kartenzustand

**Kategorie:** Stakeholder-Kommunikation

**Mehrwert:** Florian muss in Gremiensitzungen spontan belastbare Kernaussagen liefern und braucht für formale Vorlagen zusätzlich Verwaltungssprache - beides aktuell manuell aus Rohdaten übersetzt. Ein Modul, das aus sichtbarem Kartenausschnitt+Filtern automatisch sowohl druckreife Sprechzettel-Bullets als auch einen Beschlussvorlagen-Textbaustein-Entwurf generiert, spart die wiederkehrende Übersetzungsarbeit für jede Sitzung neu und verhindert Fehlzitate vor Publikum.

**Technischer Ansatz (Kurzfassung):** JS-Modul aggregiert Kennzahlen pro aktivem Layer über Viewport-BBox+Filterzustand nach vordefinierten Schwellenwert-Templates; zwei Ausgabeformate aus derselben Aggregation - kurze Bullet-Liste mit Copy-to-Clipboard und formalisierter Sachverhalt/Beschlussvorschlag-Text als .docx/.txt fürs Ratsinformationssystem.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Sprechzettel- & Beschlussvorlagen-Generator aus Kartenzustand (AquaRevier Akteurskarte)

ROLLE: Du (Antigravity) setzt dieses Feature EIGENSTÄNDIG und autonom um — kein Rückfragen bei jedem Schritt, sobald der Scope klar ist. Arbeite den Workflow build → lokal testen → committen → pushen → live verifizieren komplett selbst ab.

WICHTIG ZUERST: `git pull` im Repo (Root: `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map`, branch main). Bei Konflikten: pull/rebase + Retry, NIEMALS force-push. Mehrere Agenten arbeiten am selben Checkout.

=================================================================
1. KONTEXT-AUFNAHME (grep/lesen, bevor du irgendwas änderst)
=================================================================

Das Repo hat bereits eine funktionierende Viewport-BBox + Filter-Aggregation, die du wiederverwenden musst statt neu zu erfinden:

- `index.html` (öffentliche Karte) — Sidebar-Export-Sektion ab ca. Zeile 1027 (`<!-- Export Section -->`): Buttons `export-csv-btn`, `export-pdf-btn`, `generate-report-btn`.
- Der Klick-Handler von `generate-report-btn` (ca. Zeile 2818-2979) macht GENAU das, was du für die Aggregation brauchst:
  - `const bounds = map.getBounds()` — sichtbarer Kartenausschnitt.
  - Filtert `geojsonData.features` nach `bounds.contains(latlng) && (activeFilters.has(f.properties.group) || f.properties.isMainPartner)` → sichtbare Akteure nach aktivem Gruppen-Filter.
  - Filtert `elwasGeoData.features` nach `bounds.contains(latlng) && branchen.some(b => elwasActiveBranchen.has(b))` → sichtbare Industrieeinleiter nach aktivem Branchen-Filter, inkl. Summierung `mengen_je_typ[...].max_a`.
  - Nutzt `activeFilters` (Set der aktiven Akteursgruppen), `groupColors` (Objekt aller Gruppen), `elwasActiveBranchen` (Set), `map.getZoom()`, `map.getCenter()`.
- Weitere bereits geladene Layer-Datenvariablen, die für die Kennzahlen-Aggregation relevant sein können (grep `let \w*GeoData` in index.html): `elwasGeoData`, `pegelGeoData`, `stauanlagenGeoData`, `regenbeckenGeoData`, `querbauwerkeGeoData`, `gwmGeoData`, `statsGeoData`. Zugehörige Leaflet-Layer-Objekte (grep `Layer = L\.`): `markersLayer` (Akteure), `elwasLayer`, `klaeranlagenLayer`, `gwmLayer`, `pegelLayer`, `stauanlagenLayer`, `regenbeckenLayer`, `querbauwerkeLayer`, `catchmentStatsLayer`. Prüfe für jeden Layer per `map.hasLayer(xLayer)`, ob er aktuell überhaupt eingeblendet ist, bevor du ihn in die Aggregation aufnimmst (Pattern siehe `if (elwasGeoData && map.hasLayer(elwasLayer))` in generate-report-btn).
- CDN-Libs bereits eingebunden (Zeile ~1043-1053): Leaflet, Leaflet.markercluster, jsPDF 2.5.1 + jspdf-autotable, html2canvas. KEINE docx-Lib bisher vorhanden — die musst du selbst ergänzen (siehe Abschnitt 3).
- CSS-Variablen für konsistentes Styling: `:root` ab Zeile 21 (`--text-primary`, `--accent-primary: #6366f1`, `--accent-glow`, `--border-color`), Light-Theme-Override ab Zeile ~47. Bestehende Buttons nutzen Klasse `.filter-btn`. Es gibt AKTUELL KEIN Modal-Pattern im Code (grep `class="modal"` → 0 Treffer) — du baust das neue Vorschau-Panel/Modal neu, aber visuell konsistent zu den bestehenden Sidebar-Farben/Radien.

- `internal.html` (Florians Editor-Tool) ist NICHT strukturell identisch zu index.html — unterschiedliche Zeilenzahl (4390 vs. 3477 Zeilen) UND unterschiedliche Export-Buttons: dort heißen sie `btn-export-geojson` und `btn-generate-report` (Sidebar-Sektion ca. Zeile 1007-1012, Handler ca. Zeile 2997+). Die Aggregationslogik dort ist strukturell ähnlich (eigene `bounds`/`activeFilters`-Filterung), aber NICHT copy-paste-identisch zu index.html. Verifiziere JEDE Änderung in internal.html separat per grep an den dortigen Anker-IDs — verlasse dich nicht auf gleiche Zeilennummern wie in index.html.

Betroffene Dateien (wahrscheinlich, in dieser Reihenfolge prüfen):
1. `index.html` — Haupt-Implementierung (Sidebar-UI + JS-Aggregationsmodul + Modal).
2. `internal.html` — dieselbe Funktion für Florians Editor-Tool ergänzen (eigene Anker-IDs beachten, s.o.).
3. KEINE Python-Dateien in `elwas_raw_data/*.py` oder `elwas_toolkit/*` nötig — s. Abschnitt 3, es werden keine neuen Rohdaten gebraucht.

=================================================================
2. UMSETZUNG — Schritt für Schritt
=================================================================

A) Neues JS-Aggregationsmodul (in index.html, als eigene benannte Funktion, NICHT in den bestehenden generate-report-btn-Handler hineinmergen — der bleibt unverändert lauffähig):

```js
function aggregateVisibleState() {
  const bounds = map.getBounds();
  // pro aktivem/sichtbarem Layer: Anzahl, Summen, ggf. Schwellenwert-Flags
  // Akteure: wie in generate-report-btn (activeFilters + isMainPartner)
  // ELWAS-Einleiter: wie in generate-report-btn (elwasActiveBranchen, mengen_je_typ Summe)
  // weitere Layer NUR aufnehmen, wenn map.hasLayer(...) true ist, sonst weglassen (nicht mit 0 auffüllen — sonst suggeriert es Florian fälschlich Vollständigkeit)
  return { bounds, actors: {...}, einleiter: {...}, /* weitere Layer je nach Sichtbarkeit */ };
}
```

Definiere VORDEFINIERTE SCHWELLENWERT-TEMPLATES als eigenes Objekt/Array am Anfang des Moduls, z. B.:
```js
const SPRECHZETTEL_THRESHOLDS = [
  { id: 'einleiter_hoch', test: (agg) => agg.einleiter.total > 50000, text: (agg) => `Im Kartenausschnitt sind ${agg.einleiter.count} Industrieeinleiter mit einer Gesamtabwassermenge von ${agg.einleiter.total.toLocaleString('de-DE')} m³/a aktiv.` },
  { id: 'akteure_dicht', test: (agg) => agg.actors.count > 20, text: (agg) => `${agg.actors.count} Akteure sind im aktuell sichtbaren Bereich verzeichnet.` },
  // ... weitere sinnvolle Schwellen je nach Layer (z. B. Stauanlagen-Anzahl, Regenbecken-Kapazität, Pegel-Warnstufen falls in den Properties vorhanden — NUR verwenden, was tatsächlich in den geladenen GeoJSON-properties existiert, nichts erfinden)
];
```
WICHTIG: Bevor du Properties für Schwellenwerte referenzierst (z. B. Warnstufen bei Pegel, Kapazitäten bei Regenbecken/Stauanlagen), per `grep -o '"[a-z_]*":' regenbecken.geojson stauanlagen.geojson pegel.geojson querbauwerke.geojson | sort -u` (oder Python `json.load` + `features[0]['properties'].keys()`) die TATSÄCHLICH vorhandenen Property-Keys prüfen. Baue KEINE Templates auf vermuteten/erfundenen Feldnamen — das war exakt der Fehler bei der Stauanlagen/Regenbecken-Datenfeld-Verwechslung vom 2026-07-15.

B) Neue UI-Elemente in der Export-Sektion von index.html (ergänzend zu den 3 bestehenden Buttons, NICHT ersetzen):
- Neuer Button `id="generate-sprechzettel-btn"` ("🗣️ Sprechzettel generieren") und `id="generate-beschlussvorlage-btn"` ("📋 Beschlussvorlage generieren") in derselben `<div style="margin-top: auto; ...">`-Export-Sektion, gleiche `.filter-btn`-Klasse wie die bestehenden.
- Klick auf "Sprechzettel generieren" öffnet ein neues Modal/Panel (kein Browser-`alert`/`prompt`!) mit:
  - Titel "Sprechzettel — Kartenausschnitt vom [aktuelles Datum]".
  - Kurze Bullet-Liste (aus `aggregateVisibleState()` + den zutreffenden `SPRECHZETTEL_THRESHOLDS`-Einträgen), max. 5-8 Zeilen, in einem editierbaren `<textarea>` (Florian muss vor dem Vortrag noch handschriftlich anpassen können).
  - Button "📋 In Zwischenablage kopieren" der den `<textarea>`-Inhalt via `navigator.clipboard.writeText(...)` kopiert und kurz visuelles Feedback gibt (z. B. Button-Text kurz auf "✓ Kopiert" wechseln, dann zurück).
  - Button "Schließen".
- Klick auf "Beschlussvorlage generieren" öffnet ein zweites Modal (oder erweitert dasselbe mit Tab/Umschalter) mit demselben Aggregationsergebnis, aber in Verwaltungssprache formalisiert: Abschnitte "Sachverhalt" (Fließtext aus den Kennzahlen) und "Beschlussvorschlag" (ein Platzhaltersatz-Entwurf, den Florian ergänzen/anpassen muss — NICHT als fertigen, autoritativ klingenden Beschluss ausgeben, sondern klar als Entwurf kennzeichnen, z. B. Kopfzeile "ENTWURF — vor Einreichung ins Ratsinformationssystem prüfen").
  - Zusätzlich zwei Download-Buttons: "Als .txt herunterladen" (Pflicht, muss zuverlässig funktionieren — Blob + `<a download>`, analog zum bestehenden CSV-Export-Pattern ab Zeile 2768) und "Als .docx herunterladen".

C) .docx-Erzeugung — technischer Hinweis:
- Bevorzugter Weg: `docx`-JS-Library als UMD-Build via CDN einbinden (z. B. `https://unpkg.com/docx@8/build/index.js`, exponiert i. d. R. `window.docx`), damit clientseitig ohne Build-Step ein echtes .docx (Paragraphen/Headings) erzeugt wird — Muster: `Document`, `Paragraph`, `HeadingLevel`, `Packer.toBlob()`, dann wie beim CSV-Export ein `<a download>` triggern.
- Falls sich die UMD-Einbindung als unzuverlässig erweist (Browser-Konsole prüfen — echte Fehler, nicht nur "lädt"!): Fallback auf .rtf statt .docx (Wortverarbeitungsprogramme inkl. Word öffnen .rtf nativ, reines Textformat, kein Build nötig) — wenn du diesen Fallback nutzt, sag das EXPLIZIT in der Commit-Message und in deiner Abschlussmeldung, verstecke die Abweichung vom Auftrag nicht.
- .txt-Export bleibt in jedem Fall zusätzlich bestehen, unabhängig davon ob .docx oder .rtf gewählt wird.

D) Dieselbe Ergänzung (Buttons + Modals + Aggregationsmodul) spiegelbildlich in `internal.html` einbauen — eigene Anker-IDs verwenden (nicht `export-csv-btn` erwarten, dort existiert das nicht). Prüfe, ob `internal.html` eigene Variablennamen für `activeFilters`/`elwasActiveBranchen`/GeoData hat (wahrscheinlich ja, da eigenständiger Codepfad) und binde an DIESE an, nicht blind kopieren.

=================================================================
3. NEUE DATEN NÖTIG? → NEIN, reines Frontend-/Prozess-Feature
=================================================================
Dieses Feature braucht KEINEN neuen ELWAS-Scrape und KEINE externe Quelle (LANUV/IT.NRW). Es aggregiert ausschließlich bereits im Browser geladene GeoJSON-Layer (Akteure, ELWAS-Einleiter, ggf. Kläranlagen/Pegel/Stauanlagen/Regenbecken/Querbauwerke — je nachdem was gerade sichtbar/aktiv ist). `elwas_client.py` / Playwright-Toolkit (`elwas_toolkit/elwas_client.py`) NICHT anfassen, keine neuen `elwas_raw_data/*.py`-Scraper schreiben. Falls dir während der Umsetzung auffällt, dass ein für ein Schwellenwert-Template sinnvolles Datenfeld in den bestehenden `.geojson`-Dateien schlicht fehlt (z. B. Pegel-Warnstufen), LASS das Template weg statt es zu erfinden oder einen Scrape nachzuziehen — das ist explizit außerhalb des Scopes dieses Auftrags.

=================================================================
4. SICHTBARES ERGEBNIS NACH UMSETZUNG (konkret, für Live-Verifikation)
=================================================================

Auf https://adb-aquarevier-secure.surge.sh (nach Deploy):
- In der linken Sidebar, unterhalb der bisherigen 3 Export-Buttons ("CSV Export", "PDF Export", "Bericht generieren (PDF)"), erscheinen 2 NEUE Buttons: "🗣️ Sprechzettel generieren" und "📋 Beschlussvorlage generieren".
- Beispiel-Klickpfad:
  1. Karte laden, in den Kartenbereich um Düren zoomen/pannen (BBox enthält mehrere Akteure + mind. 1 ELWAS-Einleiter).
  2. Optional einen Gruppenfilter in der Sidebar deaktivieren (z. B. eine Akteursgruppe abwählen) — der generierte Text muss NUR die aktuell aktiven/sichtbaren Objekte widerspiegeln, nicht alle jemals geladenen.
  3. Klick auf "🗣️ Sprechzettel generieren" → Modal öffnet sich mit editierbarer Bullet-Liste (z. B. "3 Akteure im sichtbaren Bereich", "2 Industrieeinleiter mit insgesamt X m³/a Abwassermenge").
  4. Klick auf "In Zwischenablage kopieren" → Button-Text wechselt kurz zu "✓ Kopiert"; per Strg+V in eine Text-App einfügbar (manuell in einem zweiten Fenster/Editor gegenprüfen, dass der Clipboard-Inhalt wirklich die Bullet-Liste ist, nicht leer/undefined).
  5. Modal schließen, Klick auf "📋 Beschlussvorlage generieren" → zweites Modal mit "Sachverhalt"-Absatz + "Beschlussvorschlag ENTWURF"-Absatz, denselben Kennzahlen wie im Sprechzettel entsprechend.
  6. Klick auf "Als .txt herunterladen" → Datei lädt herunter, öffnen und Inhalt gegen die im Modal sichtbaren Zahlen prüfen (müssen exakt übereinstimmen, keine Platzhalter wie "undefined" oder "NaN").
  7. Klick auf "Als .docx herunterladen" (oder .rtf falls Fallback) → Datei lädt herunter, in Word/LibreOffice öffnen, Inhalt muss lesbar und identisch zu Punkt 6 sein.
  8. Kartenausschnitt verändern (pannen/zoomen) und Schritt 3 wiederholen → die Zahlen im neuen Sprechzettel MÜSSEN sich vom vorherigen unterscheiden (Beweis, dass tatsächlich der aktuelle Viewport ausgewertet wird und nicht ein gecachter/statischer Wert).
- Dasselbe Verhalten (eigene Buttons/IDs) auf internal.html.

=================================================================
5. TEST-/VERIFIKATIONSPFLICHT — NICHT NUR "KEINE KONSOLENFEHLER"
=================================================================
Aus der Historie dieses Projekts: Am 2026-07-15 waren Datenfelder (Stauanlagen/Regenbecken) trotz "fertig"-Meldung falsch verdrahtet, am 2026-07-16 hat ein Sidebar-Refactor lazy-load Event-Listener gekappt — beides wurde jeweils nur mit "keine JS-Fehler in der Konsole" als erledigt gemeldet, war aber funktional kaputt. Das darfst du hier NICHT wiederholen. Bevor du "fertig" meldest, MUSST du folgende echten Spotchecks durchführen und die Ergebnisse (nicht nur "sieht gut aus") in deiner Abschlussmeldung konkret benennen:

1. Öffne die live deployte Seite (nach Push, per Screenshot-Tool/Playwright falls verfügbar, sonst beschreibe exakt was du im Browser geprüft hast) und führe den kompletten Klickpfad aus Abschnitt 4 durch — Schritt für Schritt, nicht nur "Button existiert".
2. Vergleiche die im Sprechzettel/Beschlussvorlage-Text genannten Zahlen (Akteursanzahl, Einleiteranzahl, Summenmenge) GEGEN eine unabhängig ermittelte Zählung (z. B. `markersLayer.eachLayer(...)`-Zählung wie im bestehenden `generate-report-btn`-Code als Referenzmuster, oder manuelles Auszählen der sichtbaren Marker auf dem Screenshot) — Zahlen müssen exakt übereinstimmen, nicht nur "plausibel aussehen".
3. Verifiziere explizit, dass sich der generierte Text bei geänderter Kartenposition/Filterauswahl TATSÄCHLICH ändert (Zwei-Screenshot-Vergleich: Ausschnitt A vs. Ausschnitt B → unterschiedliche Zahlen im Sprechzettel).
4. Öffne die heruntergeladene .txt- UND .docx/.rtf-Datei tatsächlich (Dateiinhalt lesen, nicht nur Download-Event prüfen) und bestätige, dass der Inhalt vollständig, korrekt kodiert (Umlaute!) und deckungsgleich mit dem Modal-Text ist.
5. Prüfe den Clipboard-Copy-Button funktional (nicht nur dass `addEventListener` registriert wurde) — z. B. durch Einfügen in ein Test-Textfeld.
6. Führe denselben Vier-Schritte-Check zusätzlich auf `internal.html` durch, nicht nur auf `index.html` — beide Dateien gelten erst als fertig, wenn beide unabhängig verifiziert wurden.
7. Bestätige, dass die BESTEHENDEN Export-Funktionen (CSV/PDF/Bericht generieren) durch deine Änderung NICHT kaputtgegangen sind (kurzer Regressionscheck: einmal auf jeden der 3 alten Buttons klicken, Ergebnis prüfen).

Wenn irgendein Punkt fehlschlägt: NICHT als "fertig" committen/pushen, sondern fixen und den Check wiederholen.

=================================================================
6. WORKFLOW & COMMIT-KONVENTION
=================================================================
- Ablauf: `git pull` → implementieren → lokal testen (Spotcheck-Liste oben, so weit lokal ohne Deploy möglich, z. B. Datei direkt im Browser öffnen) → committen → `git push origin main` → GitHub Actions deployt automatisch auf Surge → auf der LIVE-URL (https://adb-aquarevier-secure.surge.sh) final gegen Abschnitt 4+5 verifizieren.
- Autonom durchziehen, keine Rückfrage pro Schritt, sobald der Scope (dieser Prompt) klar ist. Bei echten Unklarheiten (z. B. Property-Feldname existiert nicht in einem geojson) selbst pragmatisch entscheiden (Template weglassen) und das in der Commit-Message/Abschlussmeldung transparent dokumentieren statt zu blockieren.
- Commit-Message-Konvention (Conventional Commits, wie in der bisherigen Historie des Repos üblich):
  `feat: Sprechzettel- & Beschlussvorlagen-Generator (Viewport+Filter-Aggregation, Clipboard + .txt/.docx Export)`
  Body: kurz auflisten was genau ergänzt wurde (index.html + internal.html, neue Buttons/IDs, ggf. .rtf-Fallback-Hinweis falls .docx-Lib nicht zuverlässig lief), plus 1 Zeile zum durchgeführten Spotcheck (z. B. "Verifiziert: Zahlen in Sprechzettel stimmen mit markersLayer-Zählung überein, .txt+.docx geöffnet und geprüft, internal.html separat getestet").
- Dirty Working Tree respektieren: falls bereits uncommittete Änderungen anderer Agenten im Checkout liegen, NICHT reverten, additiv daneben arbeiten, nichts fremdes ungefragt mit-committen.
```

</details>

---

## 3. Nährstoff-/Nitratbelastung im Grundwasser

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Die bestehenden Grundwassermessstellen zeigen bisher nur Wasserstände (Menge) - die Qualitätsdimension (Nitrat aus Landwirtschaft) fehlt komplett, obwohl sie ein eigener ELWAS-Datensatz ist. Im Rheinischen Revier mit intensiver Landwirtschaft ein für Gemeinden/Wasserversorger hochrelevantes, bisher unsichtbares Thema.

**Technischer Ansatz (Kurzfassung):** Zusätzliche Werteebene an den bereits geclusterten Grundwassermessstellen (Nitratkonzentration als Farbskala/zweites Icon-Attribut), Datenquelle ELWAS-Grundwassergüte; Schwellenwert-Hervorhebung bei Überschreitung des 50mg/l-Grenzwerts.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
## Auftrag für Antigravity: Nitrat-/Nährstoffbelastung im Grundwasser sichtbar machen

**Repo-Kontext (zwingend vor Start lesen/beachten):**
Root: `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\`, Git-Repo `github.com/Dtunder/adb_aquarevier_map`, Branch `main`. Push auf `origin/main` deployt automatisch via GitHub Actions (`.github/workflows/deploy-secure.yml` + `deploy-dev.yml`) auf `https://adb-aquarevier-secure.surge.sh` (= `index.html`, öffentliche Karte) und `https://adb-aquarevier-secure.surge.sh/internal.html` (Florians Editor-Tool, strukturell meist identisch zu `index.html`, aber **nicht 1:1** – z.B. hat NUR `internal.html` noch ein separates schwebendes Legenden-Panel mit `dot('#56B4E9')`-Helper, das in `index.html` per Commit `7f5f19f` bewusst entfernt wurde. Nicht blind spiegeln, sondern jede Stelle einzeln prüfen.).

An diesem Checkout arbeiten mehrere KI-Agenten parallel (du + Claude). Deshalb zwingend:
- **Vor Start:** `git pull`
- **Vor jedem Push:** bei Konflikt `git pull --rebase` + Retry, **niemals** `--force`.
- Arbeite den kompletten Auftrag **autonom** durch (Recherche → Umsetzung → Test → Commit → Push → Live-Verifikation), ohne bei jedem Teilschritt beim User rückzufragen – der Scope ist mit diesem Prompt vollständig definiert.

---

### 1. Bestandsaufnahme (erst lesen, dann handeln)

```bash
grep -n -i "grundwasser" index.html internal.html
```
Das bringt dich zu den relevanten Blöcken (Zeilennummern können durch parallele Edits leicht abweichen – notfalls neu grep'en):
- Sidebar-Filter-Button: `index.html` ~Z.948-952, `internal.html` ~Z.888-891 (`<button class="filter-btn" data-layer-name="💧 Grundwassermessstellen ...">`, `swatch` = `#56B4E9`, `counter-badge id="cnt-layer-gwm"`)
- Layer-Aufbau/Clustering/Popup: `index.html` ~Z.1647-1714, `internal.html` ~Z.1872-1935 (`gwmLayer = L.markerClusterGroup(...)`, `loadGwmLayer()`, `fetch('grundwassermessstellen.geojson')`, `pointToLayer`/`onEachFeature`)
- `catColors`/`catLabels` (Okabe-Ito farbenblind-sicheres Schema, siehe Commit `e4609b2`): `index.html` ~Z.3050-3073, analog in `internal.html`
- Overlay-Layer-Registrierung fürs Sidebar-Toggle: `"💧 Grundwassermessstellen (ELWAS, 3700+)": gwmLayer` (~Z.2000 / ~Z.2225) sowie der lazy-load-Block mit `tasks.push(fetch('grundwassermessstellen.geojson')...)` (~Z.3155-3167 / ~Z.4067-4079) – **dieser zweite Block ist der, der beim Sidebar-Refactor am 2026-07-16 kaputtging** (Commit `5a91acb` hat es gefixt). Beide Fetch-Stellen (Cluster-Layer UND Search-Index-Task) existieren parallel – beide müssen die neuen Felder bekommen.
- Legende-Eintrag `${dot('#56B4E9')}💧 Grundwassermessstelle (ELWAS)` **nur** in `internal.html` (~Z.2284).

Wichtiger vorhandener Code-Kommentar in `index.html` (~Z.1649-1653), den du gerade auflöst:
> "Kein Grenzwert-/Zustand-Feld in den gescrapten Daten (nur name, gemeinde, kreis, eigentuemer, messstellenart, genauigkeit, quelle) – Grenzwert-Warnfarbe pro Cluster daher nicht implementierbar ohne neuen ELWAS-Scrape."

Rohdaten/Pipeline: `elwas_raw_data/scrape_grundwassermessstellen.py` (Playwright-Scraper, Scope = 7 Kreise des Rheinischen Reviers: Städteregion Aachen, Heinsberg, Mönchengladbach, Rhein-Kreis Neuss, Düren, Rhein-Erft-Kreis, Euskirchen – `KREISE`-Konstante) → `grundwassermessstellen.json` → `elwas_raw_data/build_gwm_geojson.py` (Koordinaten-Entmaskierung + UTM→WGS84) → `grundwassermessstellen.geojson` (Root, wird von `index.html`/`internal.html` per `fetch()` geladen). **Wichtig:** Die Rohdaten haben keine stabile numerische ID, nur `name` (z.B. `"HERZOGENRATH Nr.10"`), `gemeinde`, `utm_east`/`utm_north` etc. Jede neue Datenquelle muss über `(name, gemeinde, kreis)` gejoint werden, da es keinen anderen Schlüssel gibt.

---

### 2. Datenquelle klären – WICHTIG, hier nicht raten sondern verifizieren

Ich habe den ELWAS-Katalog geprüft (`elwas_toolkit/sitemap_links.json`, `elwas_toolkit/ELWAS_GESAMTPLAN.md`): Es gibt **keinen** Top-Level-Menüpunkt "Grundwassergüte" oder "Nitrat" unter `Grundwasser (marea=1)` – dort steht nur "Grundwassermessstellen". Die Nitratwerte sind also NICHT über einen eigenen Katalogeintrag mit Excel-Export erreichbar wie bei anderen Layern. Gehe wie folgt vor (mit `elwas_toolkit/elwas_client.py` als Basis, dort sind alle Hilfsfunktionen wie `open_dataset`, `fill_regional_search`, `open_detail_row`, `get_detail_tab_options`, `switch_detail_tab`, `extract_field` bereits fertig und wiederverwendbar):

**Hypothese A (zuerst prüfen, wahrscheinlicher Treffer):** Öffne über `elwas_client.open_dataset()` den Katalogeintrag "Grundwassermessstellen" (`gwm/grundwasserMst.xhtml`), führe eine Regionalsuche für einen der 7 Kreise aus, öffne per `open_detail_row()` den Objektdetails-Datensatz EINER einzelnen Messstelle und rufe `get_detail_tab_options()` auf. Bisher wurde für dieses Dataset nur der Excel-Massen-Export genutzt (siehe `ELWAS_GESAMTPLAN.md` Z.39: "Excel-Export vorhanden"), die Detailseite mit ihrem Unteransichten-Dropdown wurde nie geöffnet. Prüfe, ob dort ein Tab wie "Chemische Beschaffenheit", "Analysedaten", "Güteparameter" o.ä. mit Nitratwerten (mg/l) existiert.

**Hypothese B (falls A nichts liefert):** Katalogeintrag "Grundwasserkörper" (`wrrl/wki/gwk/grundwasserkoerper.xhtml`, marea=4/WRRL). Grundwasserkörper sind Flächengeometrien (siehe `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` Z.121) mit EU-WRRL-Zustandsbewertung – der "chemische Zustand" eines Grundwasserkörpers wird in der Praxis maßgeblich durch Nitrat bestimmt. Prüfe per `get_detail_tab_options()` auf der Objektdetails-Seite, ob es dort einen "Zustand"/"chemischer Zustand"-Tab mit Nitrat-Klassifikation gibt (analog zu "Zustand der Fließwasserkörper"/"Zustand der Seewasserkörper", die es für Oberflächenwasser bereits im Katalog gibt, aber für Grundwasser fehlt der Pendant-Eintrag im Sitemap – das deutet darauf hin, dass er über die Grundwasserkörper-Detailseite selbst erreichbar ist).

**Falls B zutrifft:** Das ist KEIN Punkt-Layer wie die Messstellen, sondern ein Flächen-Layer pro Grundwasserkörper. Baue in dem Fall einen eigenständigen neuen Polygon-Layer (analog zum bestehenden `rur_einzugsgebiet_stats.geojson`-Muster – Flächenlayer mit Statistik-Choropleth existiert im Projekt bereits als Vorbild), zusätzlich zum bestehenden Punkt-Layer, statt die Punkte künstlich einzufärben.

**Falls WEDER A noch B echte Nitratwerte liefern:** Nicht faken, keine Platzhalter-/Zufallswerte erzeugen. Stattdessen: (1) den bestehenden Code-Kommentar in `index.html`/`internal.html` aktualisieren mit einer präzisen Beschreibung, was geprüft wurde und warum es nicht ging, (2) einen kurzen Abschnitt in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` ergänzen (gleiche Konvention wie bestehende Einträge dort), (3) KEINE UI-Änderung deployen, die Daten suggeriert, die nicht existieren. Melde das als Ergebnis statt eine Teillösung als "fertig" zu präsentieren.

Für den Scraper-Bau (falls A oder B echte Daten liefert): Orientiere dich an `elwas_raw_data/scrape_details.py` (Detail-Tab-Scraping mit Progress-Checkpointing über `PROGRESS_PATH`, wichtig bei mehreren hundert/tausend Datensätzen, da Playwright-Runs abbrechen können) statt bei null anzufangen. Begrenze den Scrape-Scope wie beim bestehenden GWM-Scraper auf dieselben 7 Kreise, nicht auf ganz NRW (41k+ Messstellen wären weder nötig noch praktikabel).

---

### 3. Datenintegration (Build-Skript)

Erweitere `elwas_raw_data/build_gwm_geojson.py` (oder ein neues Merge-Skript im selben Ordner, z.B. `merge_nitrat_into_gwm.py`, das nach `build_gwm_geojson.py` läuft) so, dass an bestehende Features in `grundwassermessstellen.geojson` folgende `properties` ergänzt werden (join über `name`+`gemeinde`, `kreis` als zusätzliches Disambiguierungskriterium):
- `nitrat_mgl`: float oder `null`, falls keine Messung für diese Station verfügbar
- `nitrat_datum`: String (Messdatum), falls verfügbar, sonst `null`
- `nitrat_grenzwert_ueberschritten`: bool, abgeleitet als `nitrat_mgl != null && nitrat_mgl > 50`
- `nitrat_quelle`: kurzer String, der dokumentiert, welcher ELWAS-Tab/Datensatz genutzt wurde (für Nachvollziehbarkeit, analog zum bestehenden `quelle`-Feld)

Stationen ohne Treffer behalten `nitrat_mgl: null` – das Frontend muss diesen Fall explizit behandeln (nicht als "0 mg/l" interpretieren).

---

### 4. Frontend – GENAU dieses sichtbare Ergebnis nach Umsetzung

**Marker-Darstellung (beide Dateien, `pointToLayer` im GWM-Block):**
- Stationen mit `nitrat_mgl == null` (keine Daten): bleiben wie bisher, kleiner cyanfarbener Punkt (`#56B4E9`).
- Stationen mit `nitrat_mgl != null` und `<= 50`: Punkt in einer Sequenzfarbe innerhalb des bestehenden Okabe-Ito-Schemas (z.B. Grünton wie `#009E73`, das im `catColors`-Objekt bereits für "Pegel" genutzt wird – wiederverwenden statt neu erfinden, oder eine Zwischenstufe einer Farbskala von cyan/grün nach orange/rot).
- Stationen mit `nitrat_mgl > 50` (Grenzwertüberschreitung, 50 mg/l = gesetzlicher Grenzwert nach Nitratrichtlinie/Grundwasserverordnung): deutlich abgesetzte Warnfarbe aus dem bestehenden Schema (z.B. `#D55E00`, aktuell "Stauanlage", oder `#E69F00`, aktuell "Querbauwerk" – wichtig: konsistent farbenblind-sicher bleiben, keine neue Rot/Grün-Kombination einführen, die mit dem bestehenden Okabe-Ito-Set kollidiert). Diese Marker sollen sich beim Draufschauen klar von den unauffälligen Stationen abheben (z.B. auch leicht größer oder mit Rand-Hervorhebung).
- Cluster-Icons: Falls machbar ohne großen Aufwand, Cluster, die mind. eine Grenzwert-Überschreitung enthalten, farblich leicht warnend markieren (z.B. Randfarbe). Nice-to-have, kein Hard-Requirement.

**Popup (bei Klick auf einzelne Messstelle):** Zusätzliche Zeile(n) im bestehenden `popup-card`-Block, z.B.:
```
💧 Nitrat: 62 mg/l (Grenzwert 50 mg/l überschritten) — Stand: <Datum>
```
bzw. bei fehlenden Daten entweder die Zeile weglassen oder `"Keine Nitratdaten verfügbar"` anzeigen — nicht einfach nichts anzeigen, damit klar ist, dass es sich um eine bewusste Datenlücke und nicht um einen Bug handelt.

**Sidebar:** Der bestehende Filter-Button "Grundwassermessstellen" bleibt wie er ist (kein neuer Button nötig, es ist keine neue Layer-Kategorie, sondern ein zusätzliches Attribut derselben Punkte). Optional (nice-to-have, falls einfach umsetzbar): ein kleiner zusätzlicher Toggle/Checkbox unterhalb des Buttons "Nur Grenzwertüberschreitungen anzeigen", der den Layer clientseitig filtert.

**Legende:** In `internal.html` (die Datei mit dem separaten Legenden-Panel) einen zusätzlichen Eintrag/Farbskala-Hinweis für Nitrat ergänzen. In `index.html` gibt es dieses Panel nicht mehr (bewusst entfernt) – dort reicht ein kurzer Hinweistext im Popup/Tooltip des Sidebar-Filter-Buttons (`title`-Attribut erweitern), keine neue UI-Fläche einführen.

**Beispiel-Klickpfad zur Verifikation nach dem Deploy:**
1. `https://adb-aquarevier-secure.surge.sh/` öffnen.
2. In der Sidebar unter "🗺️ Fachdaten & Layer" den Button "Grundwassermessstellen" anklicken (Layer ist standardmäßig AUS).
3. Karte zoomt/lädt Marker; nach kurzem Ladezeitraum erscheinen geclusterte cyanfarbene Punkte, an einzelnen Standorten mit Nitratdaten farblich abgesetzte Punkte (grün/gelb/orange/rot je nach Konzentration).
4. In eine Region mit vielen Punkten reinzoomen bis die Cluster sich auflösen (Spiderfy).
5. Auf einen farblich hervorgehobenen (Warnfarbe) Einzelpunkt klicken → Popup öffnet sich → zeigt Name, Gemeinde/Kreis, Eigentümer, Messstellenart WIE BISHER, PLUS die neue Nitrat-Zeile mit Wert und explizitem Hinweis auf Grenzwertüberschreitung.
6. Auf einen Punkt ohne Warnfarbe klicken → Popup zeigt entweder einen niedrigeren Nitratwert oder den "keine Daten"-Hinweis, aber keinen falschen/leeren Wert.

---

### 5. Test- und Verifikationspflicht — NICHT nur auf Konsolenfehler prüfen

Hintergrund, warum das hier explizit steht: Bei früheren Antigravity-Änderungen an genau diesem Projekt galt "fertig", obwohl (a) am 2026-07-15 Datenfelder bei Stauanlagen/Regenbecken kaputt/leer waren (siehe Commit `6032729 fix: default-disable Querbauwerke layer, scraped name/ID data is broken`) und (b) am 2026-07-16 der Sidebar-Refactor die lazy-load Events (`overlayadd`/`overlayremove`) gekappt hat, sodass Layer sich per Klick gar nicht mehr luden (siehe Commit `5a91acb fix: restore overlayadd/overlayremove events on sidebar layer toggle`) — in beiden Fällen gab es dabei KEINE JS-Konsolenfehler. Das im Repo liegende `test_live_errors.py` prüft NUR `page.on("pageerror")` beim initialen Laden — das reicht nachweislich nicht aus und darf nicht als alleiniger Verifikationsschritt gelten.

Pflicht-Checkliste vor jedem "fertig"/Commit:
1. **Lokal, funktional, nicht nur visuell:** `server.py` starten (Port 8000), mit Playwright (Muster: `get_dom.py`/`take_screenshot.py` als Vorlage, aber erweitert) den GWM-Sidebar-Button tatsächlich klicken (nicht nur die Seite laden), warten bis der `fetch('grundwassermessstellen.geojson')` durchgelaufen ist, und per `page.evaluate()`/DOM-Query verifizieren, dass (a) tatsächlich Marker mit der neuen Warnfarbe im DOM/Layer existieren, (b) ein Popup-Klick auf einen bekannten Grenzwert-Fall die Nitrat-Zeile mit einem plausiblen numerischen Wert zeigt, (c) das für BEIDE Dateien (`index.html` UND `internal.html`) einzeln getestet wird, nicht nur eine.
2. **Echter Daten-Spotcheck (Pflicht, nicht optional):** Mindestens 5 zufällig gewählte Messstellen mit Nitratwert manuell (oder per Playwright) gegen die Original-ELWAS-Seite (`elwasweb.nrw.de`, dieselbe Detailseite, über die gescraped wurde) gegenprüfen — Wert und Einheit müssen exakt übereinstimmen. Bei Verdacht auf Einheiten-/Kommafehler (z.B. mg/l vs. µg/l, Dezimaltrenner) lieber einmal zu oft nachrechnen; das Projekt hatte bereits einen Faktor-10-Bug bei den GWM-Koordinaten (`build_gwm_geojson.py`-Docstring, Bugfix 2026-07-16), Zahlenfehler bei ELWAS-Daten sind hier ein bekanntes Wiederholungsrisiko.
3. **Regressions-Check:** Bestehende Funktionalität der Messstellen (Popup mit Name/Gemeinde/Eigentümer/Art, Clustering, Layer-Toggle) muss nach der Änderung unverändert funktionieren — kurzer Vorher/Nachher-Vergleich am selben Standort.
4. **Nach dem Push:** GitHub-Actions-Deploy abwarten (~1-2 Min), dann denselben funktionalen Klick-Test (nicht nur Seitenaufruf) live gegen BEIDE URLs (`https://adb-aquarevier-secure.surge.sh/` und `.../internal.html`) wiederholen. Erst wenn das grün ist, gilt die Aufgabe als abgeschlossen.

---

### 6. Commit- und Workflow-Konvention

Conventional-Commit-Stil wie im bisherigen Log dieses Repos (`git log --oneline`), deutsche Beschreibung, Präfix `feat:`. Beispiel:
```
feat: Nitratbelastung an Grundwassermessstellen (Farbskala + 50mg/l-Grenzwert-Highlight, ELWAS)
```
Falls sich A/B-Recherche als Sackgasse erweist und nur der Doku-Fallback aus Abschnitt 2 umgesetzt wird, entsprechend ehrlich benennen, z.B. `docs: ELWAS-Recherche Nitrat/Grundwassergüte – keine punktgenauen Daten verfügbar, Gründe dokumentiert`.

Ablauf (autonom, ohne Zwischen-Rückfrage sobald hier gestartet):
1. `git pull`
2. Recherche + Umsetzung (Abschnitte 1-4)
3. Lokaler Test (Abschnitt 5, Punkte 1-3)
4. `git add` (gezielt die geänderten/neuen Dateien, keine `-A`/`.`-Catch-all über den ganzen, teils unaufgeräumten Root-Ordner)
5. Commit mit obiger Konvention
6. `git push origin main` — bei Konflikt: `git pull --rebase`, Konflikte lösen, erneut versuchen. Kein `--force`.
7. Live-Verifikation (Abschnitt 5, Punkt 4) auf beiden Surge-URLs
8. Kurzes Ergebnis-Fazit (was gefunden/umgesetzt wurde, welche Hypothese A/B zutraf oder ob der Doku-Fallback griff) — keine Rückfrage nötig, nur Ergebnisbericht.
```

</details>

---

## 4. Zuständigkeits-/Ansprechpartner-Layer

**Kategorie:** Stakeholder-Kommunikation

**Mehrwert:** In Gremiensitzungen kommt regelmäßig die Frage 'wer ist zuständig' - die Karte zeigt aktuell nur Messwerte, keine Verwaltungszuständigkeit. Macht die Karte zum direkten Kommunikationswerkzeug statt reiner Datenanzeige und erspart Florian das Nachschlagen in separaten Verzeichnissen während der Sitzung.

**Technischer Ansatz (Kurzfassung):** Neue Attributspalte 'Zuständigkeit' (Behörde, Kontakt-E-Mail/Tel) manuell/per CSV-Join gepflegt, im bestehenden Marker-Popup als eigene Sektion mit 'Kontakt kopieren'-Button.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
## Auftrag: Zustaendigkeits-/Ansprechpartner-Layer fuer die AquaRevier-Akteurskarte

**Repo:** `github.com/Dtunder/adb_aquarevier_map`, Branch `main`, lokaler Checkout: `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\`
**Wichtig (Multi-Agent-Checkout):** Vor Start `git pull`. Bei Push-Konflikt NICHT force-pushen, sondern `git pull --rebase` und Push erneut versuchen. Nur die unten genannten, tatsaechlich geaenderten Dateien stagen (`git add <datei>` gezielt) - NICHT `git add -A`, im Root liegen diverse Temp-/Log-/Cache-Dateien (`tunnel_temp*.log`, `__pycache__`, `*.broken_backup` etc.), die nicht versioniert werden sollen.

Arbeite den kompletten Auftrag eigenstaendig ab, ohne Rueckfrage - der Scope ist unten vollstaendig spezifiziert. Workflow pro Schritt: bauen -> lokal (via `server.py`, `http://localhost:8000` und `/internal.html`) testen -> committen -> pushen -> Live-Deploy abwarten -> auf der echten URL nachverifizieren (siehe Testabschnitt unten, insbesondere Punkt "Live-Verifikation").

---

### Kontext / Begruendung

In Gremiensitzungen kommt regelmaessig die Frage "wer ist zustaendig" - die Karte zeigt bisher nur Messwerte/Stammdaten (Betreiber, Gewaesser, Typ), aber keine Verwaltungszustaendigkeit. Florian soll direkt aus dem Marker-Popup heraus sehen, welche Behoerde fuer eine Anlage zustaendig ist, und deren Kontakt mit einem Klick kopieren koennen, statt in separaten Verzeichnissen nachzuschlagen.

---

### 1. Analyse-Schritte (zuerst ausfuehren, bevor irgendetwas geaendert wird)

1. `git pull` im Repo-Root.
2. Popup-Baustellen identifizieren:
   ```
   grep -n "bindPopup\|popup-group" index.html
   grep -n "bindPopup\|popup-group" internal.html
   ```
   Ziel-Layer (jeweils ein `onEachFeature`-Block mit eigenem `bindPopup`, erkennbar am `popup-group`-Label):
   - `"Industrieeinleiter"` (Datenquelle `elwas_einleiter.geojson`)
   - `"Kläranlage"` (`klaeranlagen.geojson`)
   - `"Pegel"` (`pegel.geojson`)
   - `"Stauanlage"` (`stauanlagen.geojson`)
   - `"Regenbecken / Sonderbauwerk"` (`regenbecken.geojson`)
   - `"Querbauwerk / Bauwerk"` (`querbauwerke.geojson`)
   - `"Grundwassermessstelle"` (`grundwassermessstellen.geojson`, Block innerhalb `loadGwmLayer()`, lazy-geladen)

   **Explizit NICHT anfassen:** den Akteure/Kontakte-Popup (Block mit `extended-popup`-Klasse, Feldern `organisation`/`institution`/`bereich`/`email`/`phone`/`website`, laedt `contacts.geojson`/`contacts_anonymized.geojson`) und den Einzugsgebiet-Statistik-Choroplethen-Popup (`"Einzugsgebiet-Statistik"`). Beide sind ausserhalb des Scopes - der eine ist bereits ein Ansprechpartner-Feature fuer Akteure/Personen, der andere ist ein Flaechen-Aggregat ohne sinnvolle 1:1-Zustaendigkeit.

3. Distinkte `kreis`-Werte ermitteln, die tatsaechlich in den Ziel-Geojsons vorkommen (die CSV muss exakt auf diese Strings matchen, nicht auf vermutete Schreibweisen):
   ```
   python -c "
   import json
   files = ['klaeranlagen.geojson','stauanlagen.geojson','regenbecken.geojson','querbauwerke.geojson','pegel.geojson','elwas_einleiter.geojson','grundwassermessstellen.geojson']
   kreise = set()
   for f in files:
       d = json.load(open(f, encoding='utf-8'))
       for feat in d['features']:
           k = feat['properties'].get('kreis')
           if k: kreise.add(k.strip())
   print(sorted(kreise))
   "
   ```
4. `grep -n "website-btn\|popup-detail\|popup-card" index.html` um bestehende Button-/Popup-CSS-Klassen (z.B. `.website-btn` im `.popup-footer`-Block) zu finden und deren Werte (Padding, Border-Radius, Font-Size, Farbe) fuer den neuen "Kontakt kopieren"-Button wiederzuverwenden statt neu zu erfinden - Konsistenz mit bestehendem Look.

---

### 2. Datenmodell / neue Daten (Punkt 3: Quelle & Wiederverwendung)

**Kein neuer ELWAS-Scrape noetig.** ELWAS-WEB bildet nur technische/umweltfachliche Attribute ab (siehe `elwas_toolkit/elwas_client.py`), keine Verwaltungszustaendigkeit. Zustaendigkeit fuer Gewaesser-/Wasserwirtschaftsthemen in NRW folgt in der Regel den Kreisgrenzen (Untere Wasserbehoerde bei der jeweiligen Kreisverwaltung/kreisfreien Stadt, ggf. Bezirksregierung Koeln als Obere Wasserbehoerde fuer uebergeordnete Faelle). Das ist daher ein reines **Datenpflege-/Join-Feature, kein Frontend-only-Feature ohne neue Daten** - es kommt eine neue, manuell kuratierte Zuordnungstabelle hinzu.

1. Neue Datei `elwas_raw_data/zustaendigkeiten_kreise.csv` mit Spalten:
   ```
   kreis,behoerde,amt,email,telefon,hinweis
   ```
   Eine Zeile pro Kreis/kreisfreier Stadt aus Schritt 1.3 (im Untersuchungsgebiet sind das voraussichtlich Kreis Dueren, Kreis Euskirchen, Kreis Heinsberg, Moenchengladbach, Rhein-Erft-Kreis, Rhein-Kreis Neuss, Staedteregion Aachen - exakte Schreibweise aber IMMER aus Schritt 1.3 uebernehmen, nicht raten).

   **Wichtig zur Datenqualitaet:** Wenn du (Antigravity) Web-Zugriff hast, recherchiere die echten Kontaktdaten der jeweiligen Unteren Wasserbehoerde/des Umweltamts auf der offiziellen Kreisverwaltungs-Website und trage sie ein. Wenn du KEINEN verifizierten Wert findest, trage in `hinweis` explizit `UNBESTAETIGT - von Florian pruefen` ein und lasse `email`/`telefon` leer statt einen plausibel klingenden aber erfundenen Kontakt einzutragen - das Feature landet direkt in Gremiensitzungen, erfundene Behoerdenkontakte waeren ein Reputationsrisiko.

2. Neues Skript `elwas_raw_data/join_zustaendigkeit.py`:
   - Laedt die CSV in ein Dict, Key = `kreis.strip().casefold()` (normalisiert, damit Gross-/Kleinschreibung und Leerzeichen nicht zum Miss-Match fuehren).
   - Iteriert ueber dieselben 7 Root-Geojson-Dateien wie in Schritt 1.3, matcht pro Feature `properties.kreis` (normalisiert) gegen das Dict.
   - Bei Treffer: setzt `properties['zustaendigkeit_behoerde']`, `properties['zustaendigkeit_amt']`, `properties['zustaendigkeit_email']`, `properties['zustaendigkeit_telefon']`.
   - Bei keinem Treffer: Felder NICHT setzen (kein leerer String, kein `null`-Wert) - das Popup soll die Sektion dann einfach nicht rendern (Pattern siehe Schritt 3).
   - Schreibt jede Datei in-place zurueck mit denselben Konventionen wie die bestehenden `build_*_geojson.py`-Skripte (`json.dump(..., indent=2, ensure_ascii=False, allow_nan=False)`).
   - Gibt am Ende pro Datei eine Zusammenfassung aus: `<Datei>: X/Y Features gematcht, nicht gematchte kreis-Werte: [...]` - das ist dein primäres Debugging-Signal, ob die Normalisierung greift.
   - Idempotent halten (mehrfaches Ausfuehren darf nicht duplizieren, nur ueberschreiben).
   - Optional/nice-to-have, nicht blockierend: Hänge denselben Join zusätzlich ans Ende der jeweiligen `build_*_geojson.py`-Skripte (nach dem `shutil.copy` zur ROOT_PATH), damit ein künftiger Re-Scrape die Zuständigkeit nicht wieder verliert.
3. Skript einmal lokal ausfuehren, Output der Zusammenfassung pruefen, stichprobenartig eine der 7 Root-Geojson-Dateien oeffnen und bestaetigen, dass die vier neuen Felder bei gematchten Features tatsaechlich drinstehen.

---

### 3. Frontend-Aenderungen (`index.html` UND `internal.html`, beide - internal.html ist strukturell meist identisch, aber separat pruefen und editieren, kein Shared-Include)

Fuer jeden der 7 Ziel-Popup-Bloecke: neue, konditional gerenderte Sektion NACH den bestehenden Detail-Zeilen und VOR der "Quelle: ELWAS-WEB..."-Fusszeile einfuegen. Nur rendern wenn `p.zustaendigkeit_behoerde` gesetzt ist (gleiches `if (p.xxx) html += ...`-Pattern wie der Rest des Codes). Beispiel (Variablennamen an den jeweiligen Block anpassen, `p`/`feature.properties` je nachdem was der Block schon nutzt):

```js
if (p.zustaendigkeit_behoerde) {
    const kontaktText = `${p.zustaendigkeit_behoerde}${p.zustaendigkeit_amt ? ' - ' + p.zustaendigkeit_amt : ''}\nE-Mail: ${p.zustaendigkeit_email || '-'}\nTelefon: ${p.zustaendigkeit_telefon || '-'}`;
    html += `
        <div class="popup-detail" style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
            <strong>🏛️ Zustaendig:</strong> ${p.zustaendigkeit_behoerde}${p.zustaendigkeit_amt ? ' (' + p.zustaendigkeit_amt + ')' : ''}
        </div>
    `;
    if (p.zustaendigkeit_email) html += `<div class="popup-detail">✉️ <a href="mailto:${p.zustaendigkeit_email}">${p.zustaendigkeit_email}</a></div>`;
    if (p.zustaendigkeit_telefon) html += `<div class="popup-detail">📞 ${p.zustaendigkeit_telefon}</div>`;
    html += `<button class="copy-contact-btn" data-copy-text="${kontaktText.replace(/"/g, '&quot;')}">📋 Kontakt kopieren</button>`;
}
```

**Copy-Button-Verdrahtung - GENAU EINMAL global registrieren, nicht pro Popup-Open neu binden.** Grund: bei der Sidebar-Refactor-Aenderung vom 2026-07-16 wurden lazy-load Events genau dadurch gekappt, dass Handler pro Render statt einmalig global gesetzt wurden. Nutze Event-Delegation auf `document` (oder einen anderen stabilen, immer vorhandenen Parent wie `.leaflet-popup-pane`), einmalig im Haupt-`<script>`-Block registriert, z.B. direkt nach der `map`-Initialisierung:

```js
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.copy-contact-btn');
    if (!btn) return;
    const text = btn.getAttribute('data-copy-text');
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Kopiert!';
        setTimeout(() => { btn.textContent = original; }, 1500);
    }).catch(err => console.error('Clipboard-Fehler:', err));
});
```

CSS fuer `.copy-contact-btn` im bestehenden `<style>`-Block ergaenzen, visuell an `.website-btn` angelehnt (siehe Analyse-Schritt 1.4) - kleiner Pill-Button, `cursor: pointer`, Akzentfarbe aus den bestehenden CSS-Variablen (`var(--accent-primary)` o.ae.), dezenter Hover-State.

---

### 2b. Sichtbares Ergebnis nach Umsetzung (Punkt 2: was der User konkret sieht)

- Auf JEDEM Marker der 7 Ziel-Layer (Industrieeinleiter, Klaeranlagen, Pegel, Stauanlagen, Regenbecken, Querbauwerke, Grundwassermessstellen) erscheint im Popup - zusaetzlich zu den bisherigen Feldern - eine neue Sektion mit: Behoerdenname (fett), optional Amt/Abteilung in Klammern, E-Mail als `mailto:`-Link, Telefonnummer als Text, und darunter ein Button "📋 Kontakt kopieren".
- Bei Features, deren `kreis`-Wert NICHT in der CSV vorkommt (kein Treffer beim Join), erscheint GAR KEINE Zustaendigkeits-Sektion - kein "undefined", kein leeres Feld, kein JS-Fehler.
- Klick auf "📋 Kontakt kopieren" kopiert einen mehrzeiligen Text (Behoerde - Amt / E-Mail: ... / Telefon: ...) in die Zwischenablage; der Button-Text wechselt sichtbar fuer ca. 1,5 Sekunden zu "✅ Kopiert!" und springt danach zurueck - kein `alert()`-Popup.
- Verhalten ist auf `index.html` (oeffentliche Karte) UND `internal.html` (Florians Editor) identisch vorhanden, weil es sich um oeffentliche Behoerdenkontakte handelt, nicht um personenbezogene Akteursdaten (also keine Anonymisierungs-Ausnahme wie bei `contacts_anonymized.geojson`).

**Beispiel-Klickpfad (so nachvollziehen):**
1. `http://localhost:8000` (oder die Live-URL) oeffnen.
2. Falls der Layer "Stauanlagen" nicht standardmaessig aktiv ist: in der Sidebar/Layer-Kontrolle einschalten.
3. Auf einen Stauanlagen-Marker (⛰️-Icon) im Bereich Kreis Dueren klicken.
4. Popup oeffnet sich: bestehende Felder (Name, Kreis, Betreiber, Gewaesser, Typ) sind unveraendert sichtbar, darunter neu die Zustaendigkeits-Sektion mit Behoerde + Kontakt + Button.
5. Auf "📋 Kontakt kopieren" klicken -> Button zeigt kurz "✅ Kopiert!" -> in ein Textfeld (z.B. Adresszeile oder Notepad) einfuegen (Strg+V) -> der eingefuegte Text muss exakt Behoerde/Amt/E-Mail/Telefon aus der CSV-Zeile fuer "Kreis Dueren" enthalten.

---

### 4. Test-/Verifikationspflicht (NICHT nur "keine Konsolenfehler" - das reicht laut Historie nicht)

Referenz-Vorfaelle in diesem Projekt, die genau deshalb passiert sind, weil nur auf JS-Fehler statt auf echte Funktion/Daten geprueft wurde: kaputte Datenfelder bei Stauanlagen/Regenbecken (2026-07-15) und durch den Sidebar-Refactor gekappte lazy-load Events (2026-07-16) - beide Male hiess es "fertig", waren es aber nicht. Fuehre deshalb PFLICHT-mässig folgende Spotchecks durch, bevor du das Feature als fertig meldest:

1. **Datenkorrektheit, nicht nur Rendering:** Oeffne mindestens 3 verschiedene Layer (z.B. Stauanlagen, Klaeranlagen, Pegel) x mindestens 2 verschiedene Kreise. Vergleiche den im Popup angezeigten Behoerdennamen/E-Mail/Telefon MANUELL gegen die entsprechende Zeile in `zustaendigkeiten_kreise.csv` - stimmen sie exakt ueberein?
2. **Copy-Button real testen:** Klicke den Button, fuege den Inhalt der Zwischenablage tatsaechlich irgendwo ein (nicht nur pruefen, dass kein Fehler geworfen wird) und vergleiche Zeichen fuer Zeichen mit dem erwarteten Text.
3. **Negativfall/Graceful-Degradation:** Finde (oder erzeuge testweise) ein Feature, dessen `kreis` NICHT in der CSV steht, und bestaetige, dass die Sektion dort komplett fehlt (kein "undefined", kein leeres `<div>`, keine Konsolenfehler).
4. **Lazy-Load-Layer explizit testen:** Grundwassermessstellen ist standardmaessig AUS und wird erst per `loadGwmLayer()` nachgeladen. Layer aktiv einschalten NACHDEM die Seite schon fertig geladen war, dann einen Marker anklicken und den Copy-Button testen - genau dieser Pfad ist historisch gebrochen (siehe Referenz oben).
5. **Regressionscheck der bestehenden Felder:** Auf allen 7 Layern bestaetigen, dass die VORHER vorhandenen Popup-Felder (Betreiber, Gewaesser, Typ, Ausbaugroesse etc.) weiterhin korrekt und unveraendert angezeigt werden - nicht nur, dass das Popup ueberhaupt aufgeht.
6. **Beide HTML-Dateien testen:** sowohl `http://localhost:8000` (index.html) als auch `http://localhost:8000/internal.html`.
7. **Live-Verifikation nach Deploy:** Nach Push abwarten, bis die GitHub Action durchgelaufen ist, dann denselben Klickpfad wie oben auf der ECHTEN Live-URL (`https://adb-aquarevier-secure.surge.sh`) wiederholen - lokal "funktioniert" ist nicht ausreichend fuer "fertig".

Erst wenn alle 7 Punkte durchlaufen und bestanden sind, gilt das Feature als fertig - nicht schon bei "keine roten Fehler in der Browser-Konsole".

---

### 5. Commit-Konvention & Workflow

Konventionelle Commit-Praefixe wie im bestehenden Log (`feat:`, `fix:`, `docs:`), Betreffzeile ASCII-transliteriert (ue/oe/ss statt ü/ö/ß, wie im Rest des Repos ueblich), kurz und beschreibend. Beispiele fuer diesen Auftrag (bei Bedarf in mehrere Commits aufteilen, z.B. Daten-Join separat von Frontend):

```
feat: Kreis-basierte Zustaendigkeits-CSV + Join-Skript fuer ELWAS-Struktur-Layer
feat: Zustaendigkeits-Sektion mit Kontakt-kopieren-Button in Struktur-Popups (index+internal)
```

Ablauf autonom, ohne Rueckfrage bei jedem Einzelschritt (Scope ist mit diesem Auftrag vollstaendig geklaert):
1. `git pull`
2. Analyse-Schritte (Abschnitt 1) ausfuehren.
3. CSV + Join-Skript bauen, lokal ausfuehren, Output pruefen.
4. Frontend-Aenderungen in `index.html` und `internal.html`.
5. Lokal mit `server.py` gegen beide HTML-Seiten testen (Abschnitt 4, Punkte 1-6).
6. Gezielt stagen (`git add elwas_raw_data/zustaendigkeiten_kreise.csv elwas_raw_data/join_zustaendigkeit.py index.html internal.html <die 7 veraenderten root-geojson-Dateien>`), committen.
7. Push auf `origin main`. Bei Konflikt: `git pull --rebase`, erneut versuchen - kein `--force`.
8. GitHub-Action-Deploy abwarten, Live-Verifikation (Abschnitt 4, Punkt 7).
9. Kurze Ergebnis-Zusammenfassung hinterlassen (welche Kreise gematcht haben, welche `hinweis`-Zeilen als `UNBESTAETIGT` markiert sind und von Florian noch geprueft werden muessen).
```

</details>

---

## 5. Impressum & Datenschutzerklärung als Pflichtseiten

**Kategorie:** Recht/Compliance

**Mehrwert:** Live-Check der Seite zeigt aktuell keinerlei Impressum- oder Datenschutzlinks. Eine öffentliche Karte mit personenbezogenen Kontaktdaten und Behördenkontext unterliegt der Anbieterkennzeichnungspflicht (§5 DDG) und Art. 13 DSGVO, unabhängig vom Nutzungskontext. Fehlen dieser Seiten ist ein abmahnfähiges Compliance-Risiko, das die gesamte Initiative gefährdet.

**Technischer Ansatz (Kurzfassung):** Statische /impressum- und /datenschutz-Route im Leaflet-Frontend, verlinkt aus persistentem Footer auf allen Ansichten inkl. geteilter Filter-Links; Inhalt als Markdown-Datei pflegbar, damit Florian Text ohne Deploy-Know-how aktualisieren kann.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG: Impressum & Datenschutzerklärung als Pflichtseiten (AquaRevier Akteurskarte)

KONTEXT / SPIELREGELN (immer zuerst befolgen)
- Repo-Root: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map , GitHub github.com/Dtunder/adb_aquarevier_map, Branch main.
- Vor Arbeitsbeginn: git pull (bzw. git pull --rebase) auf main. Mehrere KI-Agenten (Claude + du) arbeiten parallel im selben Checkout. Bei Push-Konflikten: pull/rebase + retry, NIEMALS force-push.
- Push auf origin/main triggert automatisch 3 GitHub-Actions-Workflows: .github/workflows/deploy-secure.yml (Surge → https://adb-aquarevier-secure.surge.sh, Produktion), deploy-dev.yml (Surge → https://adb-aquarevier-dev.surge.sh), static.yml (GitHub Pages). Wichtig: beide Surge-Workflows enthalten `sed -i '/internal.html/d' .surgeignore` vor dem Deploy — internal.html landet also entgegen dem Namen "secure" ebenfalls live auf BEIDEN Surge-Domains. Das ist bestehendes Verhalten, nicht anfassen, aber bei der Live-Verifikation beachten (Punkt 4).
- Untracked Dateien get_dom.py, take_screenshot.py, test_live_errors.py liegen bereits im Arbeitsverzeichnis (nicht von dir) — NICHT mit committen (kein `git add -A`, gezielt stagen).
- .env, *.key, jules_api_key.txt, contacts.enc, ENC_PASSWORD in server.py: nicht anfassen, nicht ausgeben.

1. SCHRITT-FÜR-SCHRITT-UMSETZUNG

a) Struktur verifizieren (Zeilennummern können sich durch Parallel-Edits verschoben haben — vor jeder Änderung neu grep'en, nicht auf die untenstehenden Zeilenangaben blind verlassen):
   - `grep -n "sidebar-content \{" index.html internal.html` → CSS-Regel der scrollbaren Sidebar-Liste (aktuell: `flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px;`).
   - `grep -n "id=\"map\"></div>" index.html internal.html` und die ~10 Zeilen davor ansehen. In index.html (Stand jetzt: Zeile 1035 `</div>` schließt `.sidebar-content`, Zeile 1036 `</div>` schließt `#sidebar`, Zeile 1039 `<div id="map"></div>`). Genau zwischen dem schließenden `</div>` von `.sidebar-content` und dem schließenden `</div>` von `#sidebar` wird der neue Footer eingefügt. internal.html hat dieselbe Struktur (gleiche IDs #app-container/#sidebar/#map, verifiziert per Diff) — dort denselben Anker-Pattern suchen, NICHT die Zeilennummern aus index.html übernehmen.
   - `grep -n "footer\|Impressum\|Datenschutz" index.html internal.html` zur Bestätigung, dass aktuell NICHTS dergleichen existiert (Stand jetzt: kein Treffer außer der unrelated CSS-Klasse `.popup-footer` für Marker-Popups — die bitte in Ruhe lassen).
   - `grep -n "fonts.googleapis.com\|fonts.gstatic.com\|unpkg.com\|cdnjs.cloudflare.com" index.html internal.html` → Liste aller extern geladenen Dienste (aktuell: Google Fonts Inter/Outfit, Leaflet + Leaflet.markercluster von unpkg, jsPDF/jsPDF-autotable/html2canvas von cdnjs). Diese Liste brauchst du wortwörtlich für die Datenschutzerklärung (Punkt "externe Ressourcen").

b) Neue Dateien anlegen (Repo-Root, gleiche Ebene wie index.html):
   - `legal/impressum.md` und `legal/datenschutz.md` — reine Markdown-Dateien, die Florian später OHNE Deploy-Know-how direkt im GitHub-Web-UI (Stift-Icon → Edit → Commit) bearbeiten kann. Push auf main deployt automatisch neu (siehe oben) — schreibe genau diesen Hinweis als HTML-Kommentar `<!-- ... -->` ganz oben in jede der beiden .md-Dateien.
   - `impressum.html` und `datenschutz.html` — eigenständige statische HTML-Seiten (kein SPA-Routing, echte Dateien, weil rein statisches Hosting ohne Server-Backend). Gleiches Grundgerüst wie index.html (lang="de", Google Fonts Inter/Outfit, dunkles Theme mit denselben CSS-Variablen wie index.html: --bg-base, --text-primary, --text-secondary, --accent-primary etc. — kopiere den relevanten :root-Block, keine komplette Neuerfindung des Designs). Jede Seite: lädt per `fetch()` die zugehörige legal/*.md (relativer Pfad), rendert sie als HTML (Überschriften, Absätze, Listen, Links — reicht ein simpler eigener Mini-Parser oder eine bewährte Lib; KEINE neue Build-Pipeline einführen, das Projekt hat keinen Bundler). Pflicht: try/catch um den fetch — bei Fehler eine sichtbare Fehlermeldung im DOM anzeigen ("Inhalt konnte nicht geladen werden, bitte [Link] direkt öffnen" o.ä.), NIEMALS eine leere/weiße Seite, weil das die gesetzlich vorgeschriebene Sichtbarkeit (§5 DDG) unterläuft. Oben oder unten auf jeder Seite ein Link `← Zurück zur Karte` mit href="index.html".
   - Inhalt legal/impressum.md (Struktur gemäß §5 DDG, Deutschland, Stand 2026 — ersetzt das alte TMG): Abschnitte "Angaben gemäß § 5 DDG" (Name/Anschrift der verantwortlichen Stelle, Kontakt: Telefon/E-Mail), ggf. "Vertretungsberechtigte Person" falls juristische Person, ggf. Registereintrag/USt-ID falls vorhanden, "Zuständige Aufsichtsbehörde" falls das Projekt einer Behörde/Hochschule zugeordnet ist, Standard-Haftungsausschluss (Inhalte/Links), Hinweis auf EU-Streitschlichtungsplattform (ec.europa.eu/consumers/odr). WICHTIG: Du kennst Florians rechtliche Trägerschaft nicht (Kandidaten aus den Logos im Repo: RWTH ISA/IWW, Stadt Eschweiler — das sind nur Hinweise, keine Fakten!). Erfinde KEINE Namen/Adressen/Registernummern. Setze stattdessen klar sichtbare Platzhalter wie `[PLATZHALTER: Name/Anschrift der verantwortlichen Stelle — von Florian auszufüllen]` ein und liste am Ende deines Abschlussberichts (Punkt 5) alle offenen Platzhalter einzeln auf.
   - Inhalt legal/datenschutz.md (Art. 13 DSGVO): Abschnitte "Verantwortlicher" (gleicher Platzhalter wie Impressum), "Datenschutzbeauftragter" (Platzhalter, "falls vorhanden"), "Zweck und Rechtsgrundlage der Verarbeitung" (Anzeige institutioneller Kontaktdaten von Behörden/Institutionen auf der Karte — Art. 6 Abs. 1 lit. e bzw. f DSGVO als Ausgangspunkt, von Florian/Juristen final zu prüfen), "Kategorien personenbezogener Daten" (Name, dienstliche E-Mail/Telefon, Institution — nur dienstliche, keine Privatadressen; bei internal.html ggf. mehr Detailtiefe als bei index.html, das explizit erwähnen), "Externe Ressourcen beim Aufruf dieser Seite" — hier die unter 1a) gegrepte, TATSÄCHLICHE Liste (Google Fonts, unpkg.com, cdnjs.cloudflare.com) eintragen, inkl. Hinweis, dass beim Laden dieser Ressourcen die IP-Adresse des Besuchers an die jeweiligen Anbieter übertragen wird, "Hosting" (Surge.sh bzw. GitHub Pages, Platzhalter für evtl. Logging-Details), "Betroffenenrechte" (Auskunft, Berichtigung, Löschung, Widerspruch, Beschwerde bei einer Aufsichtsbehörde) — Standardformulierungen, keine Platzhalter nötig.

c) Footer in index.html UND internal.html einfügen (identisches Vorgehen in beiden Dateien, siehe Anker aus 1a):
   - CSS im `<style>`-Block ergänzen (nach der `.sidebar-content`-Regel, gleicher Stil wie bestehende `--text-secondary`/`--border-color`-Verwendung): neue Klasse `.sidebar-footer` — schmale Zeile, `border-top: 1px solid var(--border-color)`, `padding`, `display:flex`, `gap`, `justify-content:center`, Schriftgröße klein (~11-12px), Linkfarbe `var(--text-secondary)`, `:hover` → `var(--accent-primary)` + Unterstreichung.
   - Markup direkt zwischen den beiden schließenden `</div>` aus 1a einfügen: `<div class="sidebar-footer"><a href="impressum.html">Impressum</a><span>·</span><a href="datenschutz.html">Datenschutz</a></div>`.
   - Wichtig: Der Footer muss unbedingungslos im HTML stehen (nicht per JS bei bestimmten Zuständen ein-/ausgeblendet werden), damit er auch bei jeder Art von geteiltem Link (beliebige Query-Parameter/Hash an der URL) sichtbar bleibt.

d) NICHT anfassen: elwas_raw_data/*.py, elwas_toolkit/* (inkl. elwas_client.py) — das ist die Playwright-Scraping-Toolkette für ELWAS-Geodaten (Pegel, Stauanlagen, Regenbecken etc.) und hat mit diesem Feature nichts zu tun. Dieses Feature ist ein reines Frontend-/Content-Feature ohne neue Datenquelle (siehe Punkt 3).

2. SICHTBARES ERGEBNIS NACH UMSETZUNG (konkret, mit Klickpfad)

- Auf jeder Ansicht (öffentliche Karte index.html UND Editor internal.html) erscheint am unteren Rand der linken Sidebar — unterhalb der scrollbaren Filter-/Kontaktliste, OHNE dass man scrollen muss, immer sichtbar egal welche Filter aktiv sind oder wohin die Karte gepannt wurde — eine dünne Fußzeile mit zwei Textlinks: „Impressum" und „Datenschutz" (getrennt durch „·"), in gedeckter Sekundärfarbe, beim Hover farblich hervorgehoben.
- Beispiel-Klickpfad (so exakt nachvollziehen und dokumentieren):
  1. https://adb-aquarevier-secure.surge.sh/ öffnen.
  2. Ohne jede weitere Interaktion nach unten in der linken Sidebar schauen → Fußzeile „Impressum · Datenschutz" ist da.
  3. Auf „Datenschutz" klicken → Browser navigiert im selben Tab zu https://adb-aquarevier-secure.surge.sh/datenschutz.html. Seite zeigt sofort (nicht leer, kein Ladefehler) eine Überschrift „Datenschutzerklärung" und den gerenderten Fließtext aus legal/datenschutz.md (echte Absätze/Überschriften, nicht rohe „#"/„-"-Markdown-Zeichen als Text).
  4. Klick auf „← Zurück zur Karte" → zurück auf index.html.
  5. Direkt-Aufruf testen: https://adb-aquarevier-secure.surge.sh/impressum.html per URL eintippen (nicht über Klick) → funktioniert identisch (Fall „jemand teilt den Link direkt").
  6. Dieselben 5 Schritte auf https://adb-aquarevier-secure.surge.sh/internal.html wiederholen.
- Kein Interaktionsverhalten der bestehenden Karte darf sich ändern (Filter, Suche, Layer-Toggle, PDF/CSV-Export, Report-Generator) — der Footer ist eine reine Ergänzung am unteren Sidebar-Rand.

3. DATENQUELLE

- Reines Frontend-/Prozess-Feature. Es wird KEIN neuer ELWAS-Scrape und keine externe Quelle (LANUV/IT.NRW) benötigt — elwas_client.py/elwas_raw_data bleiben unberührt.
- Die einzigen „neuen Daten" sind die Rechtstexte selbst (legal/impressum.md, legal/datenschutz.md). Personenbezogene/organisatorische Fakten (Name, Anschrift, Aufsichtsbehörde der verantwortlichen Stelle) darfst du NICHT erfinden — dafür Platzhalter setzen (siehe 1b) und im Abschlussbericht auflisten.
- Der technische Teil der Datenschutzerklärung (welche externen Dienste beim Seitenaufruf kontaktiert werden) ist dagegen aus dem Code selbst ableitbar — dafür die Grep-Ergebnisse aus 1a) verwenden, keine Annahmen treffen.

4. TEST- / VERIFIKATIONSSCHRITTE (verpflichtender echter Spotcheck — „keine Konsolenfehler" reicht NICHT als Abnahmekriterium)

Hintergrund/Warum das hier explizit steht: Bei früheren Antigravity-Änderungen waren sowohl Datenfelder (Stauanlagen/Regenbecken, 2026-07-15) als auch UI-Event-Verdrahtung (Sidebar-Refactor kappte lazy-load Events für Layer-Toggles, 2026-07-16, siehe Commit 5a91acb „fix: restore overlayadd/overlayremove events on sidebar layer toggle") trotz „fertig"-Meldung kaputt, weil nur auf JS-Fehler geprüft wurde. Das darf hier nicht wieder passieren, da du #sidebar direkt anfasst.

Lokal (Pflicht vor jedem Commit):
   a) `python server.py` starten (Port 8000, siehe README.md), Browser: http://localhost:8000 und http://localhost:8000/internal.html.
   b) Footer in BEIDEN sichtbar ohne Scrollen.
   c) Alle 4 Links einzeln anklicken (Impressum + Datenschutz × index.html + internal.html) → Zielseite lädt echten gerenderten Text, kein 404, kein leerer Screen, kein sichtbares „undefined"/„NaN"/rohes Markdown.
   d) DevTools Network-Tab: legal/impressum.md und legal/datenschutz.md werden mit Status 200 geladen (nicht 404) — echter Beweis, nicht nur Sichtprüfung.
   e) NACH der #sidebar-Änderung explizit die bestehende Funktionalität erneut durchklicken und dabei auf ECHTE Wirkung prüfen (nicht nur „kein Fehler"): Gruppen-Filter-Buttons an/aus → Marker erscheinen/verschwinden tatsächlich auf der Karte; „Alle an"/„Alle aus"; Layer-Toggle-Checkboxes (genau die zuletzt gefixten overlayadd/overlayremove-Events) → zugehörige Layer werden tatsächlich ein-/ausgeblendet; Suchfeld liefert tatsächlich Treffer; CSV-/PDF-Export und „Bericht generieren" lösen tatsächlich einen Download/eine PDF aus.
   f) Responsive-Check: Browserfenster auf mobile Breite verkleinern (bestehende Breakpoints bei 480px/640px beachten) → Footer bleibt lesbar, überlappt nichts.
   g) Fallback-Check: im DevTools Network-Tab „legal/*.md blockieren" simulieren (Request block) und neu laden → sichtbare Fehlermeldung statt leerer Seite (siehe 1b Pflicht-try/catch).

Nach dem Push:
   h) GitHub-Actions-Tab prüfen: alle 3 Workflows (deploy-secure.yml, deploy-dev.yml, static.yml) grün/erfolgreich.
   i) Live-Verifikation auf ECHTEN URLs (nicht nur „Workflow grün" = fertig), mit Cache-Buster-Query (`?v=<timestamp>`) wegen Surge-Caching: https://adb-aquarevier-secure.surge.sh/ und https://adb-aquarevier-secure.surge.sh/internal.html — dieselben Spotchecks (b)-(e) wiederholen, PLUS Direkt-URL-Aufruf von /impressum.html und /datenschutz.html (Fall „geteilter Link").

5. COMMIT-KONVENTION & WORKFLOW

- Commit-Message-Stil an bestehende Historie anlehnen (kleingeschriebenes Conventional-Commits-Präfix, kurzer deutscher Titel), z. B.:
  `feat: Impressum & Datenschutz als Pflichtseiten (Footer-Links, statische Rechtstexte)`
  Bei Nacharbeiten separate `fix:`-Commits, nicht alles in einen Commit zwingen.
- Workflow autonom, ohne Rückfrage bei jedem Einzelschritt (Scope ist durch diesen Prompt klar definiert): ändern/anlegen → lokal mit server.py testen (Punkt 4, Schritte a-g) → gezielt stagen (`git add index.html internal.html impressum.html datenschutz.html legal/impressum.md legal/datenschutz.md` — NICHT `git add -A`, die vorhandenen untracked Testskripte get_dom.py/take_screenshot.py/test_live_errors.py gehören nicht zu diesem Feature) → committen → `git pull --rebase origin main` unmittelbar vor dem Push (Schutz gegen Parallel-Edits von Claude) → push → GitHub Actions abwarten → Live-Verifikation (Punkt 4, Schritte h-i).
- Abschlussbericht am Ende (kurz, direkt): welche Dateien geändert/neu angelegt wurden, Ergebnis aller Spotchecks aus Punkt 4, und – das ist Pflicht – eine explizite Liste aller offen gelassenen `[PLATZHALTER: ...]`-Stellen in legal/impressum.md und legal/datenschutz.md, die Florian inhaltlich noch befüllen muss, bevor die Seite als rechtlich vollständig gelten kann.
```

</details>

---

## 6. Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking (ERLEDIGT)

**Kategorie:** Datenqualität

**Mehrwert:** Florian und andere Kartennutzer bemerken Datenfehler oft früher als jeder automatisierte Test, wie der Vorfall vom 15.07. zeigt. Aktuell gibt es keinen Weg, sowas direkt an der betroffenen Stelle zu melden. Ein niedrigschwelliger Meldebutton verkürzt die Zeit bis zur Korrektur und schafft Vertrauen bei Stakeholdern, weil sichtbar ist, dass Meldungen bearbeitet werden.

**Technischer Ansatz (Kurzfassung):** Pro Marker ein 'Fehler melden'-Link im Popup öffnet Mini-Formular (Freitext+Kategorie: falscher Wert/Position/veraltet), Feature-ID/Layer/Koordinaten automatisch mitgeschickt, Versand z.B. als GitHub Issue via API; einfacher Status (offen/in Prüfung/behoben) in öffentlich sichtbarem 'Gemeldete Probleme'-Mini-Panel.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Du bist der KI-Agent "Antigravity" und arbeitest EIGENSTÄNDIG (autonom, ohne Rückfrage bei jedem Einzelschritt, sobald der Scope unten klar ist) am Repo `github.com/Dtunder/adb_aquarevier_map`, Branch `main`, lokal unter `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\`. Mehrere KI-Agenten arbeiten parallel am selben Checkout — führe **zuerst `git pull --rebase origin main`** aus, committe/pushe in kleinen Schritten, und bei Push-Konflikten: `git pull --rebase` + Retry statt `--force`. Push auf `origin/main` deployt automatisch via GitHub Actions auf Surge (`https://adb-aquarevier-secure.surge.sh` = index.html, `internal.html` ebenfalls live erreichbar unter derselben Domain, siehe `.surgeignore`-Handling im Workflow).

## Feature
Titel: **Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking**
Pro Marker-Popup ein "⚠️ Fehler melden"-Link öffnet ein Mini-Formular (Kategorie + Freitext), das automatisch Feature-ID/Layer/Koordinaten mitschickt und als GitHub Issue eingereicht wird. Ein öffentliches "Gemeldete Probleme"-Panel zeigt den Bearbeitungsstatus (offen/in Prüfung/behoben) live an.

---

## 0. KRITISCHE ARCHITEKTUR-VORGABE — zuerst lesen, bevor du irgendetwas implementierst

Ich habe das bereits geprüft, du musst es NICHT erneut verifizieren, sondern als Fakt übernehmen:

- **`Dtunder/adb_aquarevier_map` ist ein PRIVATES Repo** (`gh repo view Dtunder/adb_aquarevier_map --json isPrivate` → `true`) und enthält **im Git-Verlauf getrackt personenbezogene Daten** (`contacts.geojson` mit Klarnamen/Telefon/E-Mail, `contacts.enc`). Das darf **niemals** öffentlich gemacht werden.
- Die naive Umsetzung ("GitHub Issue via API im privaten Repo, Link im öffentlichen Popup") würde für genau die Zielgruppe des Features ("Florian und andere Kartennutzer", die vermutlich KEINEN Zugriff auf das private Repo haben) mit **404** fehlschlagen — sowohl beim Öffnen eines neuen Issues als auch beim anonymen Lesen der Issue-Liste (die GitHub REST API liefert für private Repos ohne Auth ebenfalls 404).
- Ein echtes API-POST mit Schreibrechten würde einen GitHub-Token im Frontend-JS erfordern → das Repo wird rein statisch über Surge/GitHub Pages ausgeliefert, es gibt **keine** Server-Laufzeitkomponente im Deploy (das lokale `server.py` / `editor_backend/` läuft nur lokal auf Florians/deinem Rechner für die Kontaktverwaltung, NICHT im Produktiv-Deploy). Ein Secret im Client-Code = sofortiger Leak. **Baue das unter keinen Umständen so.**

**Verbindliche Lösung:** Lege ein **neues, separates, ÖFFENTLICHES** GitHub-Repo an, das ausschließlich als Issue-Tracker für dieses Feature dient (kein Code, keine Datendateien, keine PII):

```
gh repo create Dtunder/adb-aquarevier-feedback --public \
  --description "Issue-Tracker fuer Nutzer-Feedback zu Datenfehlern der AquaRevier Akteurskarte (adb-aquarevier-secure.surge.sh). Enthaelt keinen Code, keine personenbezogenen Daten." -y
gh repo edit Dtunder/adb-aquarevier-feedback --enable-issues
```

Falls `gh` in deiner Umgebung nicht authentifiziert ist (prüfe mit `gh auth status`): Repo manuell über `https://github.com/new` anlegen (Name exakt `adb-aquarevier-feedback`, Owner `Dtunder`, Sichtbarkeit **Public**, Issues aktiviert) und danach identisch weitermachen.

Danach Labels anlegen (exakt diese Namen/Farben, werden vom Frontend referenziert):

```
gh label create "data-feedback" -R Dtunder/adb-aquarevier-feedback --color fbbf24 --description "Nutzer-Meldung zu einem Datenfehler auf der Akteurskarte"
gh label create "status:offen" -R Dtunder/adb-aquarevier-feedback --color ef4444 --description "Meldung noch nicht bearbeitet"
gh label create "status:in-pruefung" -R Dtunder/adb-aquarevier-feedback --color 3b82f6 --description "Meldung wird aktuell geprueft"
gh label create "status:behoben" -R Dtunder/adb-aquarevier-feedback --color 22c55e --description "Meldung wurde behoben (optional, primaer zaehlt geschlossen+completed)"
gh label create "kategorie:falscher-wert" -R Dtunder/adb-aquarevier-feedback --color a78bfa --description "Kategorie: falscher Datenwert"
gh label create "kategorie:position" -R Dtunder/adb-aquarevier-feedback --color f472b6 --description "Kategorie: falsche Position/Koordinaten"
gh label create "kategorie:veraltet" -R Dtunder/adb-aquarevier-feedback --color facc15 --description "Kategorie: veraltete Daten"
gh label create "kategorie:sonstiges" -R Dtunder/adb-aquarevier-feedback --color 94a3b8 --description "Kategorie: Sonstiges"
```

Bekannte, akzeptierte Einschränkung dieses Ansatzes (nicht versuchen zu "fixen", nur dokumentieren, z.B. als Kommentar im Code): Ein Absender braucht einen (kostenlosen) GitHub-Account und muss im neuen Tab manuell auf "Submit new issue" klicken — es gibt keine echte anonyme serverlose Einreichung ohne neue Backend-Infra/Secrets. Das ist im Scope dieses Auftrags bewusst so gewählt.

---

## 1. Analyse-Schritte (grep zuerst, dann gezielt lesen — nicht ganze Dateien einlesen)

1. `git pull --rebase origin main` im Repo-Root.
2. Popup-Erzeugung in **beiden** Dateien separat aufsuchen (Zeilennummern weichen zwischen `index.html` und `internal.html` voneinander ab, `internal.html` ist ~900 Zeilen länger und hat einen zusätzlichen Layer — NICHT von identischen Zeilennummern ausgehen):
   ```
   grep -n "bindPopup(" index.html
   grep -n "bindPopup(" internal.html
   grep -n "L.geoJSON(\|Layer = L.layerGroup\|Layer = L.markerClusterGroup" index.html
   ```
   Referenz-Stand (index.html, kann sich verschoben haben — neu greppen!): 10 `bindPopup`-Aufrufe in den Layer-Blöcken `stakeholder2025Layer` (Zeile ~1360, "Akteur Stand 2025"), `elwasLayer` (~1480, Industrieeinleiter), `klaeranlagenLayer` (~1600), `gwmLayer` (~1654, Grundwassermessstellen, MarkerClusterGroup), `pegelLayer` (~1717), `stauanlagenLayer` (~1766), `regenbeckenLayer` (~1815), `querbauwerkeLayer` (~1864), `catchmentStatsLayer` (~1916), sowie der Haupt-`markersLayer` für aktuelle Akteure (~2021/2394-2425). `internal.html` hat zusätzlich einen Konsortium/Einzelakteure-Layer.
3. **Feature-ID-Felder pro Layer prüfen** (nicht raten — jedes Geojson hat andere Property-Keys, geprüft per `python -c "import json; ..."`):

   | Geojson | verfügbares ID-Feld | Fallback |
   |---|---|---|
   | `contacts.geojson` (internal.html) | `id` | — |
   | `contacts_anonymized.geojson` (index.html) | **keins** | `name` + Koordinaten |
   | `klaeranlagen.geojson` | `anlagen_nr` | `name` |
   | `pegel.geojson` | `pegel_nr` | `name` |
   | `querbauwerke.geojson` | `anlagen_nr` | `name` |
   | `regenbecken.geojson` | `anlagen_nr` | `name` |
   | `stauanlagen.geojson` | `anlagen_nr` | `name` |
   | `elwas_einleiter.geojson` | `betriebs_nr` | `name` |
   | `grundwassermessstellen.geojson` | **keins** | `name` + Koordinaten |

   → Baue die ID-Extraktion generisch als Prioritätskette `props.id || props.anlagen_nr || props.pegel_nr || props.betriebs_nr || props.name || null` und schicke **immer zusätzlich die Koordinaten** mit (lat/lng des Markers), auch wenn eine "saubere" ID existiert — das ist bei den beiden Layern ohne ID-Feld der einzige eindeutige Locator.
4. CSS-Theme-Variablen für konsistentes Styling (in beiden Dateien im `:root`/`body.light-theme`-Block, bereits vorhanden, wiederverwenden statt neu erfinden): `--bg-surface`, `--border-color`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--accent-glow`. Bestehende Popup-Klassen `popup-card`, `popup-title`, `popup-detail` wiederverwenden.
5. Sidebar-Struktur: `.sidebar-content` enthält bereits `<!-- Block 1: Regionale Akteure & Institutionen -->`, `<!-- Block 2: Industrie-Branchen (ELWAS) -->`, `<!-- Block 3: Fachdaten & Layer (ELWAS/LANUV) -->` (identisches Kommentar-Muster in beiden Dateien, per `grep -n "Block \d:" index.html internal.html` auffindbar). Dort NACH Block 3 einen neuen `<!-- Block 4: Gemeldete Probleme -->` einfügen.
6. Es existiert **kein** Modal-Component und **kein** Toast in der Codebase bisher (nur `alert()` an 3 Stellen) — das Formular-Modal ist eine neue, kleine Komponente, an bestehende CSS-Variablen angelehnt, kein neues Framework/keine externe Library laden (CSP/Offline-Robustheit der bisherigen Architektur beibehalten).

**Betroffene Dateien insgesamt:** `index.html`, `internal.html` (beide JS+CSS inline, beide Layer-Popups + Sidebar betreffen). **NICHT betroffen:** `elwas_raw_data/*.py`, `elwas_toolkit/elwas_client.py`, `server.py`, `editor_backend/` — siehe Punkt 3 unten, warum.

---

## 2. Sichtbares Ergebnis nach Umsetzung (exakt)

**A) Popup-Erweiterung (alle Layer, beide Dateien):**
Jedes Marker-Popup (Akteure, Kläranlagen, Pegel, Stauanlagen, Regenbecken, Querbauwerke, Industrieeinleiter, Grundwassermessstellen — wirklich JEDES, nicht nur eines) zeigt am unteren Rand einen neuen Link/kleinen Button: **"⚠️ Fehler melden"**, dezent gestylt mit `--accent-primary`, unterhalb der bisherigen Popup-Inhalte, oberhalb/statt des bisherigen "Quelle: ..."-Texts falls vorhanden.

**B) Klick auf "Fehler melden" öffnet ein Modal:**
- Kopfzeile: "Fehler melden: {Feature-Titel}" + kleine graue Zeile "Layer: {Layer-Name}"
- Dropdown "Kategorie" (Pflichtfeld): Falscher Wert / Falsche Position / Veraltete Daten / Sonstiges
- Textarea "Was ist falsch? (Pflichtfeld, min. 10 Zeichen)"
- Buttons "Abbrechen" (schließt Modal ohne Aktion) und "Meldung erstellen"
- Bei fehlender Pflichtfeld-Eingabe: Inline-Fehlermeldung, kein Submit

**C) Klick auf "Meldung erstellen":**
- Öffnet **synchron im selben Klick-Handler** (wichtig gegen Popup-Blocker!) einen neuen Tab mit vorausgefülltem GitHub-"New Issue"-Formular im Repo `Dtunder/adb-aquarevier-feedback`, Titel-Format `[Datenfeedback] {Kategorie} – {Layer}: {Feature-Titel}`, Body mit Kategorie/Layer/Feature-ID/Koordinaten/Quellseite (index.html vs internal.html)/Zeitstempel/Freitext, vorbelegte Labels `data-feedback`, `status:offen`, `kategorie:<slug>`.
- Modal schließt, zeigt kurze Bestätigung (kleiner dismissible Banner oder minimal `alert()`, konsistent mit bestehendem Stil): "Ein neuer Tab mit vorausgefüllter Meldung wurde geöffnet. Bitte dort unten auf 'Submit new issue' klicken, um die Meldung endgültig abzuschicken."

**D) Neues Sidebar-Panel "🚩 Gemeldete Probleme" (Block 4, unter Block 3, beide Dateien):**
Beim Laden der Seite ruft das Panel `https://api.github.com/repos/Dtunder/adb-aquarevier-feedback/issues?state=all&labels=data-feedback&sort=created&direction=desc&per_page=50` ab (unauthenticated GET, kein Token nötig, CORS von api.github.com erlaubt) und zeigt pro Meldung eine Zeile: Status-Badge (🔴 offen / 🔵 in Prüfung / 🟢 behoben — Ableitung: `state==closed && state_reason==completed` → behoben, `state==open` && Label `status:in-pruefung` vorhanden → in Prüfung, sonst offen; `state==closed && state_reason==not_planned` → als "abgelehnt" separat/ausgegraut zeigen), gekürzter Titel, relatives Datum, Link "→ auf GitHub ansehen" (öffnet Issue in neuem Tab). "Aktualisieren"-Button zum manuellen Re-Fetch. Bei Fetch-Fehler (Rate-Limit/offline): Hinweistext statt kaputter Seite, letzter erfolgreicher Stand aus `localStorage`-Cache (TTL ~5-10 Min, um das 60-Requests/Stunde-Limit der unauthentifizierten API zu schonen) als Fallback anzeigen.

**Beispiel-Klickpfad zum Nachvollziehen:**
1. `https://adb-aquarevier-secure.surge.sh` öffnen.
2. Auf einen beliebigen Kläranlagen-Marker klicken → Popup öffnet sich mit den bisherigen Infos + neuem Link "⚠️ Fehler melden" unten.
3. Auf den Link klicken → Modal öffnet sich, Titel zeigt korrekt den Kläranlagen-Namen und "Layer: Kläranlagen".
4. Kategorie "Falscher Wert" wählen, Freitext "Ausbaugröße stimmt nicht mit LANUV-Angabe überein" eingeben, "Meldung erstellen" klicken.
5. Neuer Tab öffnet github.com/Dtunder/adb-aquarevier-feedback/issues/new mit korrekt vorausgefülltem Titel/Body/Labels; Bestätigungshinweis erscheint auf der Karte.
6. Auf GitHub "Submit new issue" klicken → Issue wird erstellt.
7. Zurück zur Karte, Sidebar-Block "Gemeldete Probleme" → nach "Aktualisieren" erscheint die neue Meldung mit Status 🔴 offen.
8. Im Feedback-Repo das Issue manuell mit Label `status:in-pruefung` versehen → Panel zeigt nach Refresh 🔵 in Prüfung; Issue schließen (als "completed") → Panel zeigt 🟢 behoben.

---

## 3. Datenquelle: reines Frontend-/Prozess-Feature, KEIN neuer Scrape

Es werden **keine neuen ELWAS-/LANUV-/IT.NRW-Daten** benötigt. `elwas_toolkit/elwas_client.py` (Playwright-Scraper) und alles unter `elwas_raw_data/*.py` bleiben unangetastet — dieses Feature ist ein reiner UI+Prozess-Layer oben auf den bereits vorhandenen Geodaten. Als "Backend/Datenbank" für die Meldungen dient das neue öffentliche GitHub-Repo `Dtunder/adb-aquarevier-feedback` (Issues = Datensätze, Labels = Status/Kategorie) — kein eigener Server, keine neue Datenbank, kein Cloudflare Worker o.ä. Falls du im Verlauf denkst, eine echte anonyme Einreichung ohne GitHub-Account zu bräuchtest: NICHT selbstständig eine neue Backend-/Secret-Infrastruktur aufbauen, sondern das als offene Einschränkung im Commit/PR-Text dokumentieren.

---

## 4. Test-/Verifikationspflicht — AUSDRÜCKLICH mit echtem Spotcheck, nicht nur "keine Konsolenfehler"

Referenz, warum das hier scharf kontrolliert wird: Am 15.07. waren Datenfelder (Stauanlagen/Regenbecken) trotz "fertig"-Meldung inhaltlich falsch befüllt, am 16.07. hat ein Sidebar-Refactor lazy-load Event-Verdrahtung stillschweigend gekappt — beides wurde jeweils nur mit "keine JS-Fehler in der Konsole" für erledigt erklärt und war es nicht. Das darf sich hier nicht wiederholen. Pflicht-Checkliste, JEDER Punkt einzeln abhaken, nicht überspringen:

1. **Lokal**, `python server.py`, dann `http://localhost:8000` (index.html) UND `http://localhost:8000/internal.html`:
   - Für **jeden** der ~9 Layer-Typen (Akteure, Kläranlagen, Pegel, Stauanlagen, Regenbecken, Querbauwerke, Industrieeinleiter, Grundwassermessstellen, ggf. Konsortium in internal.html) mindestens einen echten Marker anklicken und optisch bestätigen: Link erscheint, Modal öffnet mit korrektem Titel/Layer-Namen (nicht "undefined"/leer), Kategorie-Dropdown vollständig.
   - Mindestens einmal den kompletten Flow bis zum tatsächlich erstellten GitHub-Issue durchspielen (echter Issue im `adb-aquarevier-feedback`-Repo, per `gh issue view` oder Browser verifizieren: Titel/Body/Labels korrekt befüllt, insbesondere bei einem Layer OHNE ID-Feld — z.B. Grundwassermessstelle oder Akteur auf index.html — dass dort trotzdem sinnvolle Koordinaten statt "undefined" im Body stehen). Test-Issue danach wieder schließen (nicht löschen, als Beleg für den Funktionstest).
   - Standalone-Popup-Pfad testen (Suchfeld → Ergebnis anklicken → `openStandalonePopup`): Link muss auch dort erscheinen und sauber degradieren (kein Crash durch fehlendes `popup._source`).
   - Sidebar-Panel "Gemeldete Probleme": nach dem oben erstellten Test-Issue per "Aktualisieren" die echte Anzeige mit korrektem Status-Badge im **Network-Tab tatsächlich prüfen** (Response von `api.github.com` ansehen, nicht nur "Panel zeigt irgendwas").
   - Light- UND Dark-Theme testen (Theme-Toggle-Button), Modal und Sidebar-Block in beiden lesbar/kontrastreich.
   - Mobile-Ansicht testen (schmaler Viewport, DevTools Device Toolbar) — Modal und Popup-Link dürfen nicht abgeschnitten/überlappt werden (bestehende `.leaflet-popup-content`-Mobile-Anpassungen beachten).
2. **Nach dem Push** live auf `https://adb-aquarevier-secure.surge.sh` (und `internal.html` dort) denselben Spotcheck in verkürzter Form wiederholen: mind. 2 unterschiedliche Layer-Typen, einmal kompletter Issue-Flow, einmal Statuspanel-Laden — GitHub Actions Deploy-Status vorher mit `gh run list -R Dtunder/adb_aquarevier_map --limit 3` prüfen, dass der Deploy grün ist, bevor du "fertig" meldest.
3. Explizit gegenprüfen, dass **kein Token/Secret** irgendwo im gepushten HTML/JS auftaucht (`grep -rn "gho_\|ghp_\|token" index.html internal.html` muss leer sein für die neuen Code-Teile).
4. Bestätige, dass `contacts.geojson`/`contacts.enc` NICHT im neuen öffentlichen Feedback-Repo landen (das Repo bleibt leer bis auf README/Issues).

Erst wenn ALLE Punkte oben mit konkretem, benennbarem Ergebnis (nicht "sollte passen") durchlaufen sind, gilt die Aufgabe als fertig.

---

## 5. Commit-Konvention & Workflow

Ablauf: **pull → implementieren → lokal nach Checkliste testen → committen → pushen → live verifizieren** — autonom durchziehen, ohne bei jedem Einzelschritt nachzufragen, solange der oben beschriebene Scope eingehalten wird. Bei Unklarheiten, die den Scope wirklich ändern würden (z.B. anderer Repo-Name gewünscht), im Zweifel die hier getroffene Standardentscheidung (`adb-aquarevier-feedback`) verwenden und das im Commit/PR-Text kurz begründen, statt zu blockieren.

Commit-Messages im conventional-commits-Stil wie in der bisherigen Historie (`feat:`, `fix:`, `docs:`), Beispiele für sinnvolle Aufteilung:
```
feat: Fehler-melden-Link in allen Marker-Popups (index/internal.html)
feat: Feedback-Modal mit Kategorie/Freitext, Versand als GitHub Issue
feat: Gemeldete-Probleme-Panel mit Live-Status aus GitHub Issues API
docs: Hinweis auf neues Feedback-Repo adb-aquarevier-feedback
```
Kein `--force`-Push, keine `--no-verify`, kein Amend fremder Commits. Falls beim Push ein Konflikt auftritt: `git pull --rebase origin main`, Konflikt lösen, erneut versuchen — nicht überschreiben. Dirty Working Tree anderer Agents respektieren (nur additiv arbeiten, nichts Unbeteiligtes reverten oder mit committen).
```

</details>

---

## 7. Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf

**Kategorie:** Datenqualität

**Mehrwert:** Nach dem Stauanlagen-Vorfall vom 15.07. fehlt Nachvollziehbarkeit, WAS sich zwischen zwei Scrape-Läufen inhaltlich verändert hat (neue Einleiter, entfernte Messstellen, korrigierte Werte) - sichtbar ist nur der aktuelle Endzustand. Macht jede Datenänderung ex-post prüfbar und liefert bei künftigen Vorfällen sofort die Diff-Historie statt manueller Rekonstruktion.

**Technischer Ansatz (Kurzfassung):** Nach jedem Scrape wird der neue Datensatz per stabiler ID gegen den vorherigen Snapshot diff't (added/removed/changed) und als JSON-Log unter /data/changelog/<layer>/<timestamp>.json abgelegt; internes Log-Viewer-Panel listet die letzten Diffs pro Layer chronologisch mit Klartext-Zusammenfassung.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG: Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf

ROLLE & SPIELREGELN (verbindlich, gilt für die gesamte Session)
- Repo-Root: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (git origin: github.com/Dtunder/adb_aquarevier_map, Branch main). Mehrere KI-Agenten arbeiten parallel im selben Checkout.
- ALS ALLERERSTES: `git pull` (bzw. `git pull --rebase` falls lokale Änderungen vorliegen). Vor jedem Push erneut `git pull --rebase origin main`; bei Konflikten rebasen + retry, NIEMALS force-push.
- Arbeite eigenständig bis zum fertigen, verifizierten Ergebnis durch — keine Rückfragen zwischendurch, sobald der Scope (unten) klar ist. Workflow: bauen → lokal testen (siehe Testpflicht unten) → committen → pushen → live verifizieren.
- Ziel-Feature ist NUR für internal.html (Florians internes Editor-Tool) sichtbar, NICHT für index.html (öffentliche Karte). index.html hat aktuell bewusst keine Editor-/Tool-Panels — das bleibt so.

1. IST-ZUSTAND (vorher exakt gegen den aktuellen Checkout verifizieren, Zeilennummern können sich verschoben haben — per grep neu ermitteln, nicht blind auf die hier genannten vertrauen)

1.1 Sieben ELWAS-Layer sind für den Change-Feed relevant (jeweils Punkt-GeoJSON, erzeugt von einem `elwas_raw_data/build_*.py`-Skript aus rohen Scrape-Dumps):

| Layer-Datei (Repo-Root) | Stable-ID-Feld | Build-Skript | Kopiert Build-Skript aktuell automatisch nach Repo-Root? |
|---|---|---|---|
| stauanlagen.geojson | anlagen_nr | elwas_raw_data/build_stauanlagen_geojson.py | JA (ROOT_PATH + shutil.copy vorhanden) |
| regenbecken.geojson | anlagen_nr | elwas_raw_data/build_regenbecken_geojson.py | JA |
| querbauwerke.geojson | anlagen_nr | elwas_raw_data/build_querbauwerke_geojson.py | JA |
| klaeranlagen.geojson | anlagen_nr | elwas_raw_data/build_klaeranlagen_geojson.py | NEIN — schreibt nur nach elwas_raw_data/klaeranlagen.geojson, die Root-Kopie ist bisher manuell gepflegt |
| pegel.geojson | pegel_nr | elwas_raw_data/build_pegel_geojson.py | NEIN, gleiches Problem |
| elwas_einleiter.geojson | betriebs_nr | elwas_raw_data/build_geojson.py | NEIN, gleiches Problem |
| grundwassermessstellen.geojson | KEIN ID-Feld vorhanden (properties nur: name, gemeinde, kreis, eigentuemer, messstellenart, genauigkeit, quelle) | elwas_raw_data/build_gwm_geojson.py | NEIN, gleiches Problem |

Wichtig: Bei 4 der 7 Skripte fehlt aktuell die automatische Kopie ins Repo-Root (nur elwas_raw_data/*.geojson wird beschrieben, die Root-Datei — die index.html/internal.html per fetch() tatsächlich laden — stammt aus einem früheren manuellen Copy und kann veralten). Das MUSS als Vorbedingung für einen funktionierenden Change-Feed für alle 7 Layer mit-gefixt werden (ROOT_PATH + shutil.copy nach dem Muster der 3 bereits korrekten Skripte ergänzen), sonst diffst du gegen einen potenziell stale Snapshot.

Für grundwassermessstellen: zuerst in elwas_raw_data/scrape_grundwassermessstellen.py bzw. build_gwm_geojson.py prüfen, ob im rohen ELWAS-Scrape doch irgendwo eine Objekt-/Messstellen-ID mitgeschleppt wird, die bisher nur nicht in die finalen properties übernommen wurde. Falls ja: übernehmen und als ID nutzen. Falls tatsächlich keine existiert: eine synthetische stabile ID generieren als `hashlib.sha1(f"{name}|{gemeinde}|{round(lon,5)}|{round(lat,5)}".encode()).hexdigest()[:12]` und das im Code UND im späteren Klartext-Log als bekannte Einschränkung dokumentieren ("Namens-/Gemeinde-Korrekturen erscheinen bei dieser ID-Heuristik als entfernt+neu, nicht als geändert").

1.2 Deploy-Setup (zur Einordnung, nicht Teil des Auftrags): `.github/workflows/static.yml` deployt bei jedem Push auf main den kompletten Repo-Inhalt (`path: '.'`) nach GitHub Pages — internal.html und ein neuer changelog/-Ordner landen dort automatisch mit, keine Anpassung nötig. Zusätzlich existiert `deploy_surge.py` für die öffentliche Karte (surge.sh); `.surgeignore` schließt dort bewusst internal.html/contacts.geojson/server.py aus — das ist korrekt so und bleibt unangetastet. Prüfe trotzdem kurz, dass weder `.gitignore` noch `.surgeignore` künftig versehentlich `changelog/` oder `*.json` global ausschließen.
Florian testet internal.html normalerweise lokal via `python server.py` → http://localhost:8000/internal.html (Login siehe FLORIAN_ANLEITUNG.md), teils über eine rotierende lhr.life-Tunnel-URL — verlass dich für die Live-Verifikation NICHT auf eine fest angenommene Internal-URL, sondern schau in FLORIAN_ANLEITUNG.md nach, was aktuell gilt, bzw. verifiziere primär lokal über server.py.

1.3 UI-Muster in internal.html: Es gibt bereits ein etabliertes Sidebar-Panel-Pattern, das exakt reproduziert werden soll — grep dir aktuelle Zeilennummern für folgende Anker (waren zuletzt um Zeile 765 `id="sidebar"`, ~1017-1021 und ~2352):
```html
<div class="section-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="toggleCustomizerPanel()">
    <span>🎨 GIS & Design Customizer</span>
    <span id="customizer-toggle-icon">▼</span>
</div>
<div class="glass-panel" id="customizer-panel" style="padding:10px; border-radius:8px; margin-bottom:10px; background: var(--bg-surface); border:1px solid var(--border-color); display:none;">
    ...
</div>
```
mit zugehöriger JS-Toggle-Funktion:
```js
function toggleCustomizerPanel() {
    const panel = document.getElementById('customizer-panel');
    const icon = document.getElementById('customizer-toggle-icon');
    if (panel.style.display === 'none') { panel.style.display = 'block'; icon.innerText = '▲'; }
    else { panel.style.display = 'none'; icon.innerText = '▼'; }
}
```
Nutze `--bg-surface`, `--border-color`, `--text-secondary` (bereits theme-aware, keine Farben hart codieren).

2. UMSETZUNG — BACKEND (Python, Prozess-Feature, KEIN reines Frontend-Feature)

2.1 Neues Modul `elwas_toolkit/changelog.py` (analog zu `elwas_toolkit/elwas_client.py`, gleiche Docstring-Konvention) mit einer wiederverwendbaren Funktion, sinngemäß:
```python
def write_changelog(layer, id_field, old_features, new_features, changelog_root):
    """Diff't old_features gegen new_features per id_field (property-Key oder
    Callable für synthetische IDs), schreibt changelog_root/<layer>/<ts>.json
    und aktualisiert changelog_root/<layer>/index.json (Manifest, neueste zuerst).
    Gibt den geschriebenen Run-Eintrag zurück."""
```
Vergleiche pro gematchter ID sowohl `properties` (alle Keys) als auch die Koordinaten (gerundet auf 5 Nachkommastellen, um Float-Rauschen aus der Projektion nicht als "changed" zu werten). Erzeuge pro Run-Datei folgende Struktur (Timestamp dateisystemsicher, UTC, ISO-artig mit `-` statt `:`):
```json
{
  "layer": "stauanlagen",
  "id_field": "anlagen_nr",
  "run_timestamp": "2026-07-17T14:30:00Z",
  "baseline": false,
  "previous_count": 56,
  "new_count": 57,
  "added": [{"id": "...", "name": "...", "properties": {...}}],
  "removed": [{"id": "...", "name": "...", "properties": {...}}],
  "changed": [{"id": "...", "name": "...", "fields": {"betreiber": {"old": "A", "new": "B"}, "coordinates": {"old": [lon,lat], "new": [lon,lat]}}}],
  "summary": "2 neu, 1 entfernt, 3 geändert (betreiber, gewaesser)."
}
```
Bootstrap-Fall (Layer hat noch keinen changelog/<layer>/-Ordner, es gibt also keinen echten Vorzustand zum Diffen): KEINEN irreführenden "56 neue Einträge"-Diff schreiben. Stattdessen einen Eintrag mit `"baseline": true`, leeren added/removed/changed-Arrays und Summary "Erster erfasster Stand (kein Vergleich möglich)" schreiben — das Frontend muss diesen Fall separat/erkennbar labeln (siehe unten).

`changelog_root` = neuer Ordner `changelog/` im Repo-Root (Geschwister von index.html, analog zu den *.geojson-Dateien — es gibt kein `data/`-Verzeichnis in diesem Repo, NICHT erfinden). Struktur: `changelog/<layer>/<timestamp>.json` je Run + `changelog/<layer>/index.json` als Manifest-Array (Einträge: file, run_timestamp, baseline, added_count, removed_count, changed_count, summary — neueste zuerst).

2.2 Alle 7 `build_*.py`-Skripte in `elwas_raw_data/` anpassen: unmittelbar bevor die neue GeoJSON die Root-Datei überschreibt, den AKTUELLEN Root-Dateiinhalt (falls vorhanden) als "old" einlesen, `write_changelog(...)` aufrufen, danach erst neu schreiben (elwas_raw_data/-Kopie UND Root-Kopie — bei den 4 Skripten ohne bisherige ROOT_PATH-Logik diese jetzt nach dem Muster von `build_stauanlagen_geojson.py` ergänzen). Nutze pro Skript exakt das ID-Feld aus der Tabelle in 1.1.

2.3 Kein neuer Scrape, keine neue Datenquelle. Dieses Feature liest ausschließlich bereits vorhandene, bereits gescrapte Datensätze (die 7 Layer-GeoJSONs) und deren jeweils vorherigen Snapshot — es ist ein reines Nachbearbeitungs-/Prozess-Feature auf bestehenden Build-Skripten plus einem Frontend-Viewer. `elwas_client.py` NICHT anfassen, keine Playwright-Session öffnen, keine LANUV/IT.NRW-Anbindung. Falls du zum Testen einen echten Diff erzeugen willst, simuliere eine Änderung, indem du testweise EIN Feld in einer bereits gescrapten Rohdaten-Datei (elwas_raw_data/*.json) veränderst und das zugehörige build_*.py-Skript erneut laufen lässt — nicht neu von ELWAS scrapen.

3. UMSETZUNG — FRONTEND (nur internal.html)

3.1 Neue Sidebar-Sektion "📜 Änderungs-Historie" nach dem exakten Collapsible-Pattern aus 1.3, Panel-ID `changelog-panel`, Toggle-Icon-ID `changelog-toggle-icon`, JS-Funktion `toggleChangelogPanel()`. Platzierung: als eigener Block im `#sidebar`-Div, sinnvollerweise nahe der bestehenden Layer-Filter-Sektion, NICHT innerhalb des bestehenden `editor-panel` oder `customizer-panel` (eigenständige Sektion, um bestehende Event-Verdrahtung nicht anzufassen — siehe Testpflicht Punkt 4 zur Sidebar-Regression vom 16.07.).

3.2 Panel-Inhalt:
- `<select id="changelog-layer-select">` mit den 7 Layer-Labels (Stauanlagen, Regenbecken, Querbauwerke, Kläranlagen, Pegel, Grundwassermessstellen, Einleitende Betriebe) → Value = interner Layer-Key (stauanlagen, regenbecken, ...).
- Button "🔄 Aktualisieren" (`id="btn-refresh-changelog"`).
- Scrollbarer Container `<div id="changelog-list">` (max-height + overflow-y:auto, damit die Sidebar nicht sprengt).

3.3 JS-Verhalten:
- Bei Dropdown-Change (und beim erstmaligen Öffnen des Panels) `fetch('changelog/' + layerKey + '/index.json')` (relativer Pfad, gleiches Muster wie `fetch('stauanlagen.geojson')`), Fehlerfall (404, weil für diesen Layer noch nie ein Run stattfand) sauber abfangen und "Noch keine Änderungshistorie für diesen Layer" anzeigen statt eines Konsolenfehlers.
- Liste rendern: pro Run-Eintrag eine kompakte Karte mit formatiertem Zeitstempel, farbigen Zähl-Badges (+N grün / −N rot / ~N gelb) ODER bei `baseline:true` einem neutralen Badge "Basis-Snapshot", plus der Klartext-Summary.
- Klick auf eine Karte lädt/entfaltet die zugehörige Run-Datei (`changelog/<layer>/<file>.json`) und zeigt die Detail-Listen added/removed/changed inkl. Feld-für-Feld alt→neu (z.B. "betreiber: Stadtwerke Alt → Stadtwerke Neu GmbH").

4. SICHTBARES ERGEBNIS NACH UMSETZUNG (konkreter Klickpfad zur Abnahme)
1. `python server.py` starten, `http://localhost:8000/internal.html` öffnen, mit Florians Zugangsdaten (siehe FLORIAN_ANLEITUNG.md) einloggen.
2. In der Sidebar erscheint eine neue Sektion "📜 Änderungs-Historie" mit Klapp-Pfeil ▼, standardmäßig eingeklappt (analog Customizer-Panel).
3. Klick auf den Sektions-Header klappt das Panel auf (▼ wird zu ▲), Dropdown + "Aktualisieren"-Button + leere/gefüllte Liste werden sichtbar.
4. Dropdown auf "Stauanlagen" stellen → Liste zeigt den zuletzt geschriebenen Run-Eintrag oben, mit Zeitstempel, +/−/~-Badges und Klartext-Summary (oder "Basis-Snapshot", falls es der erste Lauf ist).
5. Klick auf den obersten Eintrag → Detailansicht klappt auf/erscheint, listet jede geänderte ID mit Feld alt→neu, jede neue ID mit Kernfeldern, jede entfernte ID mit ihren letzten bekannten Werten.
6. Dropdown auf einen anderen Layer wechseln → Liste lädt neu, zeigt dessen eigene, unabhängige Historie.
7. Alle bestehenden Layer-Filter-Buttons (Stauanlagen, Regenbecken, Querbauwerke, ... in der bereits vorhandenen Filter-Sektion) funktionieren weiterhin unverändert (Ein-/Ausblenden + Counter-Badges `#cnt-layer-*` aktualisieren sich wie zuvor).
8. Auf index.html (öffentliche Karte) ist NICHTS davon sichtbar — dort bleibt alles wie vorher.

5. TEST-/VERIFIKATIONSPFLICHT (ausdrücklich verpflichtend — "keine Konsolenfehler" reicht NICHT als Abnahmekriterium; Referenz: 15.07. waren Stauanlagen/Regenbecken-Datenfelder trotz "fertig"-Meldung inhaltlich falsch, 16.07. wurden beim Sidebar-Refactor Lazy-Load-Events stillschweigend gekappt — beides wurde nur durch echten Datenabgleich bzw. echtes Klicken gefunden, nicht durch Fehlerfreiheit)

5.1 Backend-Spotcheck mit ECHTER erzwungener Änderung: Wähle einen Layer (z.B. Stauanlagen), ändere in der zugehörigen rohen Scrape-Datei (elwas_raw_data/stauanlagen.json o.ä.) für genau EINEN bekannten anlagen_nr-Eintrag bewusst einen Feldwert (z.B. betreiber) UND lösche/dupliziere testweise einen anderen Eintrag, um added+removed zu erzwingen. Führe das zugehörige build_*.py aus. Öffne danach die erzeugte changelog/stauanlagen/<ts>.json und die index.json MANUELL und prüfe:
   - previous_count + len(added) − len(removed) == new_count (Zahlen müssen exakt aufgehen)
   - Der geänderte Feldwert im changed-Array entspricht Zeichen für Zeichen dem, was du tatsächlich verändert hast (alt- UND neu-Wert korrekt, nicht vertauscht)
   - Die neu erzeugte stauanlagen.geojson im Repo-Root enthält den neuen Wert (nicht nur die Kopie in elwas_raw_data/)
   Mache die Teständerung danach rückgängig (Rohdaten zurücksetzen) bzw. dokumentiere sie sauber, bevor du committest — es soll kein Fake-Datensatz in den echten Daten landen.

5.2 Cross-Check gegen die Karte: Nach dem Rebuild in `http://localhost:8000/internal.html` den Layer neu laden, den Counter-Badge `#cnt-layer-stauanlagen` mit `new_count` aus dem Changelog-Eintrag vergleichen — müssen übereinstimmen.

5.3 Frontend-Spotcheck: Änderungs-Historie-Panel öffnen, den Layer aus 5.1 wählen, den neuesten Eintrag anklicken, und den dort angezeigten alt→neu-Wert direkt mit dem Wert vergleichen, den du in 5.1 in der Rohdatei geändert hast — muss identisch sein (nicht nur "irgendein Diff wird angezeigt").

5.4 Regressionscheck bestehender Funktionalität (wegen 16.07.-Vorfall): Nach dem Einbau der neuen Sektion JEDEN bestehenden Filter-Button in der Sidebar einmal anklicken und beobachten, dass Layer sichtbar/unsichtbar geschaltet werden UND die Counter-Badges von echten Zahlen auf 0/0 bzw. zurück wechseln (Beleg, dass overlayadd/overlayremove-Events weiterhin feuern). Ebenso den bestehenden Editor (`btn-new-contact`, Position auf Karte wählen, Speichern) und den PDF-Report-Button (`btn-generate-report`) einmal antesten — beide dürfen durch die neue Sektion nicht beeinträchtigt sein.

5.5 Alle 7 Layer mindestens einmal im Dropdown durchklicken und sicherstellen, dass entweder eine plausible Liste oder der "Noch keine Änderungshistorie"-Leerzustand erscheint — kein JS-Fehler, kein 404 im Netzwerk-Tab, der nicht abgefangen wird.

5.6 Nach Push: Beide Deploy-Ziele prüfen — GitHub Actions Run grün? changelog/-Dateien im deployten Output vorhanden (nicht durch .gitignore/.surgeignore verschluckt)? Falls ein internal.html-Zugang aktuell erreichbar ist (lokal oder per Tunnel gemäß FLORIAN_ANLEITUNG.md), Klickpfad aus Abschnitt 4 dort real nachvollziehen, nicht nur lokal.

6. COMMIT-KONVENTION & WORKFLOW
- Stil wie bestehende Historie (kleines `feat:`/`fix:`-Präfix, knapper Imperativ, Deutsch/Englisch gemischt erlaubt), z.B.:
  `feat: strukturellen Aenderungs-Audit-Trail (Change-Feed) pro Scrape-Lauf ergaenzt`
  Falls die ROOT_PATH-Fixes für die 4 Skripte als sinnvoll trennbarer Vorab-Schritt committet werden sollen: eigener Commit davor, z.B.
  `fix: fehlende Root-Kopie in 4 ELWAS-Build-Skripten ergaenzt (Voraussetzung fuer Change-Feed)`
- Vor jedem Commit: `git status` + `git diff` gegenlesen (keine Testdaten aus 5.1 versehentlich mit reinziehen). `git pull --rebase origin main` unmittelbar vor dem Push, bei Konflikt rebasen + erneut versuchen, kein `--force`.
- Ablauf autonom und ohne Zwischen-Rückfrage: bauen → Tests aus Abschnitt 5 vollständig durchlaufen → committen → pushen → live verifizieren (Abschnitt 5.6) → kurzer Abschlussbericht was konkret getestet wurde (welcher Layer, welche Teständerung, welche Zahlen verglichen).
```

</details>

---

## 8. Playwright-basierte UI-Regressionssuite (Visual + Funktional)

**Kategorie:** Qualitätssicherung/Testing

**Mehrwert:** Die Lazy-Load-Regression vom 16.07. betraf die UI-Interaktions-Ebene (Sidebar-Refactor entkoppelte Layer-Events), nicht die Datenextraktion - der bereits geplante Golden-Sample-Test deckt nur Scraper-Output ab, nicht ob ein Sidebar-Refactor stillschweigend Event-Handler kappt. Ohne automatisierten UI-Test wird die nächste solche Regression wieder erst live entdeckt statt im CI.

**Technischer Ansatz (Kurzfassung):** Playwright-Testsuite klickt bei jedem Deploy alle Layer-Toggle-Kombinationen durch, macht Screenshot-Diffing gegen eine Baseline und prüft zusätzlich, dass die erwarteten Netzwerk-Requests für Tile-/GeoJSON-Loads tatsächlich feuern (funktionale Assertion, nicht nur visuell); als GitHub-Action-Gate vor dem Surge-Deploy eingehängt.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
# Auftrag: Playwright-basierte UI-Regressionssuite (Visual + Funktional) für die AquaRevier-Karte

## 0. Vorbereitung (Pflicht, vor jedem Schritt)

```
cd C:\Users\user\.gemini\antigravity-ide\scratch\contact_map
git pull --rebase origin main
git status
```

Root ist ein geteilter Checkout (Claude + Antigravity arbeiten parallel). Falls `git status` uncommittete Dateien zeigt, die nicht von dir stammen (Stand jetzt: `get_dom.py`, `take_screenshot.py`, `test_live_errors.py`) — **nicht anfassen, nicht löschen**, gehören nicht zu diesem Auftrag. Bei Push-Konflikt später: `git pull --rebase origin main` + Retry, **niemals** `--force`.

## 1. Kontext — warum dieser Auftrag existiert

Zwei Regressionen wurden erst live entdeckt, nicht im CI:

- **15.07.2026**: Datenfelder bei Stauanlagen/Regenbecken kaputt (Scraper-Ebene) — dafür ist bereits ein Golden-Sample-Test geplant, der deckt aber nur Scraper-Output ab.
- **16.07.2026**, Commit `5a91acb` (`fix: restore overlayadd/overlayremove events on sidebar layer toggle`): der Sidebar-Refactor (`e46b41a` / `6b29728`) hat Leaflet-Layer-Events entkoppelt. Der Bug war **silent** — kein JS-Fehler in der Konsole, die Klicks taten einfach nichts. Ein reiner "keine Konsolenfehler"-Check hätte das NICHT gefangen.

Diese Suite soll genau die zweite Fehlerklasse (kaputte Event-Verdrahtung nach UI-Refactors) automatisiert im CI abfangen, bevor deployt wird.

## 2. Codebasis verstehen — erst lesen, dann schreiben

Diese Stellen sind bereits identifiziert und geben dir die exakten Ankerpunkte (Zeilennummern Stand heute, bei Abweichung neu grep'en):

```
grep -n "data-layer-name" index.html          # Sidebar-Buttons, Block 3 ab Zeile ~938
grep -n "overlayMaps\|L.control.layers" index.html   # Layer-Registry ~Zeile 1982-2008
grep -n "map.hasLayer\|map.addLayer\|map.removeLayer" index.html   # Toggle-Logik ~2493-2710
grep -n "updateSidebarCounters\|counter-badge" index.html   # Live-Zähler-Logik ~2507
grep -n "fetch('" index.html                  # alle Geo-Daten-Loads, meist EAGER beim Seitenload
grep -n "lazy" index.html                     # die paar wirklich LAZY geladenen Layer (~1406,1432,1672,3155)
```

Wichtige Fakten, die du dir NICHT neu erarbeiten musst:

- `index.html` (`<div id="sidebar"><div class="sidebar-content">`) hat 3 Filter-Blöcke: `data-group` (Regionale Akteure), `data-branche` (Industrie-Branchen), `data-layer-name` (Fachdaten & Layer, ~22 Einträge). Reset-Buttons: `#btn-actors-all/-none`, `#btn-branches-all/-none`, `#btn-layers-all/-none`. Jeder Button hat einen `.counter-badge` mit Format `(sichtbar/gesamt)`, initial oft `(0/0)`.
- Die Layer-Registry `overlayMaps` (Objekt, Key = exakter String aus `data-layer-name`, Value = Leaflet-Layer-Objekt) ist die Quelle der Wahrheit für Toggle-Zustand (`map.hasLayer(overlayMaps[name])`).
- **Wichtige Nuance, nicht vereinfachen:** Die meisten Layer werden beim Seitenload EAGER per `fetch()` geladen (Daten liegen schon im Speicher), der Sidebar-Klick ruft nur `map.addLayer()`/`removeLayer()` auf den bereits fertigen Layer — **kein neuer Netzwerk-Request beim Toggle**. Wirklich LAZY (Netzwerk-Request erst beim ersten Toggle) sind nur: GSK3C Gewässerflächen/-kanäle (`gsk3c_gew_flaeche.geojson`, `gsk3c_gew_kanal_plm.geojson`) und Grundwassermessstellen (`grundwassermessstellen.geojson`, Kommentar "Index eager, Rendering lazy"). Baue die Netzwerk-Assertion NUR für diese lazy-Layer ein — bei den restlichen Layern wäre "Request muss beim Klick feuern" ein falscher Test, der grundlos rot wird.
- Manche `overlayMaps`-Einträge sind Vektor-Layer (`L.geoJSON`/`L.markerClusterGroup`, haben `.getLayers()`), andere sind WMS/Tile-Layer (die LANUV-Layer: "Flüsse & Gewässer (LANUV)", "Gewässernetz Detailliert (LANUV)", "Einzugsgebiete Hydrologisch (LANUV)", "Tagebaue & Bergbaufelder (GD)", "Wasserschutzgebiete (LANUV)", "NRW Landkreise & Grenzen") — die haben KEIN `.getLayers()`. Für Tile-Layer reicht `map.hasLayer(...) === true`, für Vektor-Layer zusätzlich `getLayers().length > 0`.
- Aktuelle Feature-Counts (jetzt zur Laufzeit gegen die echten `.geojson`-Dateien verifizieren, nicht blind übernehmen — Stand heute per `python -c "import json;print(len(json.load(open('X.geojson'))['features']))"`): `grundwassermessstellen.geojson` = 3746, `stauanlagen.geojson` = 56, `regenbecken.geojson` = 70. Das sind exakt die zwei am 15.07. betroffenen Layer plus der prominenteste Lazy-Layer — nimm diese drei als Pflicht-Kandidaten mit hartem Zahlen-Assert, den Rest generisch (Loop über `overlayMaps`-Keys).
- `internal.html` ist Florians Editor-Tool, laut Projektbeschreibung "meist strukturell identisch" — testet dieselbe Sidebar/Layer-Logik. Beide Deploy-Workflows (`deploy-secure.yml`, `deploy-dev.yml`) deployen aktuell BEIDE `.html`-Dateien live (sie löschen die `internal.html`-Zeile aus `.surgeignore` zur Laufzeit via `sed`) — nicht anfassen, nur zur Kenntnis für den Live-Verifikationsschritt.
- Lokaler Dev-Server laut `README.md`: `python server.py` → `http://localhost:8000` (index) und `http://localhost:8000/internal.html`. `index.html` lädt Geodaten per relativem `fetch('*.geojson')` → **muss über HTTP serviert werden**, `file://` funktioniert wegen CORS nicht. Nutze exakt diesen Server auch als Playwright `webServer` — keinen neuen Dev-Server-Mechanismus erfinden.
- **Betroffene/neue Dateien:** `index.html`, `internal.html` (nur Lesezugriff als Testziel, nur ändern falls beim Testen ein echter Bug auffällt — dann im selben Commit fixen und das explizit in der Commit-Message vermerken). `elwas_raw_data/*.py` und `elwas_toolkit/*` (inkl. `elwas_client.py`) sind **nicht** Teil dieses Auftrags — keine neuen Scrapes, keine Änderungen dort. Neu: `package.json`, `package-lock.json`, `playwright.config.js`, `tests/ui-regression/*.spec.js`, `tests/ui-regression/**/*-snapshots/*.png` (Baseline), `.github/workflows/ui-regression.yml` (neu). Editiert: `.github/workflows/deploy-secure.yml`, `.github/workflows/deploy-dev.yml` (CI-Gate einhängen), `.gitignore` (Test-Artefakte ignorieren, Baseline-PNGs NICHT ignorieren), `.surgeignore` (Node-/Test-Tooling von Surge-Deploy ausschließen, s.u.).

## 3. Architekturentscheidung — Node/`@playwright/test`, nicht Python-Playwright

Repo hat aktuell kein `package.json`. `elwas_toolkit/elwas_client.py` nutzt Python-`playwright.async_api` fürs Scraping — das ist bewusst NICHT das Vorbild für diese Suite. Nimm stattdessen `@playwright/test` (Node), weil:

- Beide bestehenden Deploy-Workflows haben bereits `setup-node@v4` (Node 20) — kein zusätzlicher Python-Toolchain-Overhead in CI nötig.
- `@playwright/test` bringt eingebautes Screenshot-Diffing (`toHaveScreenshot`), Trace-Viewer und HTML-Reporter mit — genau das, was für Visual Regression + funktionale Netzwerk-Assertions gebraucht wird, ohne das selbst zu bauen.

Setup:
```
npm init -y
npm install -D @playwright/test
npx playwright install --with-deps chromium
```
Kein TypeScript einführen (Repo ist durchgängig JS/Python ohne `tsconfig.json`) — Testdateien als `.spec.js`.

## 4. Testsuite implementieren

Struktur:
```
tests/ui-regression/
  layer-toggles.spec.js
  reset-buttons.spec.js
  __screenshots__/           (Baseline-PNGs, WERDEN committet)
playwright.config.js
```

`playwright.config.js`: `testDir: './tests/ui-regression'`, `webServer: { command: 'python server.py', url: 'http://localhost:8000', reuseExistingServer: !process.env.CI }`, `use: { baseURL: 'http://localhost:8000', viewport: { width: 1600, height: 1200 } }` (gleiche Viewport-Größe wie `elwas_client.py`s `new_page`, aus Konsistenzgründen), moderate `toHaveScreenshot`-Toleranz (`maxDiffPixelRatio: ~0.02`) um Font-/Antialiasing-Rauschen nicht als Fail zu werten.

**Scope-Korrektur zur Formulierung "alle Layer-Toggle-Kombinationen":** wörtlich genommen wären das 2^22 Kombinationen — das ist nicht sinnvoll umsetzbar und nicht das Ziel. Setze stattdessen um:
1. Jeden Layer einzeln aus dem Ausgangszustand heraus togglen (ON prüfen, dann wieder OFF prüfen) — Liste der Layer-Namen zur Laufzeit per `page.evaluate(() => Object.keys(overlayMaps))` holen, NICHT hart im Test duplizieren (sonst veraltet die Liste bei jedem neuen ELWAS-Layer).
2. "Alle an" (`#btn-layers-all`) und "Alle aus" (`#btn-layers-none`) als Sammel-Aktionen.
3. Eine realistische Kombination mit mind. 2 gleichzeitig aktiven Layern aus verschiedenen Kategorien (z.B. Grundwassermessstellen + Stauanlagen gleichzeitig an), um Interaktions-/Pane-Überdeckungsbugs zu fangen.
4. Dasselbe Muster (nur Punkt 1+2, kompakter) zusätzlich gegen `/internal.html`.

Für jeden Layer-Toggle (Kernstück, das die 16.07.-Regressionsklasse abdeckt) prüfe **alle** vier Ebenen, nicht nur eine:
- **State:** `page.evaluate((name) => map.hasLayer(overlayMaps[name]), layerName) === true` nach dem Klick; Button bekommt CSS-Klasse `active`.
- **Echte Daten, nicht nur Toggle-Flag:** für Vektor-Layer `overlayMaps[name].getLayers().length > 0`; für Tile-Layer reicht der State-Check. Zusätzlich: `.counter-badge`-Text ändert sich weg von `(0/0)` — bei den drei Pflicht-Kandidaten (GWM/Stauanlagen/Regenbecken) den zweiten Wert exakt gegen den real aus der `.geojson`-Datei gelesenen Feature-Count matchen (dynamisch einlesen, nicht die Zahlen aus diesem Prompt hart kopieren — die können sich bei neuem Scrape ändern).
- **Netzwerk, nur bei den lazy-Layern** (GSK3C x2, Grundwassermessstellen): `page.waitForResponse(r => r.url().includes('grundwassermessstellen.geojson') && r.status() === 200)` um den Klick herum, UND dass dieser Request NICHT schon vor dem Klick gefeuert ist.
- **Visuell:** `page.locator('#map').screenshot()` → `expect(...).toHaveScreenshot('<layer-slug>-on.png')`, danach nochmal deaktiviert gegen `<layer-slug>-off.png`. Bewusst nur `#map`-Ausschnitt screenshotten, nicht Full-Page (Sidebar-Zähler/Uhrzeiten würden sonst ständig false positives erzeugen).
- **Konsolen-Fehler bleiben Pflicht-Baseline** (`page.on('pageerror', ...)`, `page.on('console', msg => msg.type()==='error')`, sammeln über den ganzen Klickpfad, Test failt bei jedem Treffer) — aber das ist laut Postmortem vom 16.07. NICHT ausreichend (der Bug war silent), deshalb sind die drei Punkte oben das eigentliche Gate, nicht dieser.

## 5. Was auf der Webseite/im Projekt sichtbar sein soll — NACH der Umsetzung

Wichtig: Das ist ein reines CI/QA-Feature. **Auf der Live-Karte (`index.html`/`internal.html`) darf sich für Endnutzer nichts sichtbar verändern** — keine neuen Buttons, kein Test-Banner, keine Debug-UI. Sichtbar wird die Umsetzung an folgenden Stellen:

- **GitHub Actions Tab** des Repos: neuer Workflow/Job `UI Regression Tests` läuft vor `deploy` bei jedem Push auf `main`. Schlägt er fehl, bleibt der `deploy`-Job ungestartet (rotes X, Karte wird NICHT neu deployt) — das ist der eigentliche Produktwert des Features.
- **Pull Requests** (falls künftig welche genutzt werden): Check erscheint als Status-Check.
- **Artefakt-Download** am Workflow-Run: `playwright-report.zip` (HTML-Report mit Screenshot-Diffs pro Layer, per `npx playwright show-report` lokal browsbar).
- **Neuer Ordner im Repo:** `tests/ui-regression/` mit Spec-Dateien + committeten Baseline-PNGs in `__screenshots__/`.

**Beispiel-Testablauf Schritt für Schritt** (repräsentativ für die Klasse Regression vom 16.07., so soll der Test es nachstellen):

1. Öffne `http://localhost:8000` (bzw. in CI die konfigurierte `baseURL`).
2. Warte auf `#map` und darauf, dass `#sidebar .sidebar-content` mit allen `.filter-btn[data-layer-name]`-Buttons gerendert ist.
3. Lies Ausgangszustand: `button.filter-btn[data-layer-name="💧 Grundwassermessstellen (ELWAS, 3700+)"]` hat KEINE Klasse `active`; `#cnt-layer-gwm` zeigt `(0/0)`.
4. Klicke diesen Button.
5. Assert Netzwerk (weil GWM lazy ist): Response auf `grundwassermessstellen.geojson`, Status 200, feuert genau jetzt (nicht schon beim initialen Seitenload).
6. Assert State: Button hat jetzt Klasse `active`; `map.hasLayer(overlayMaps["💧 Grundwassermessstellen (ELWAS, 3700+)"])` === `true`.
7. Assert echte Daten: `overlayMaps["💧 Grundwassermessstellen (ELWAS, 3700+)"].getLayers().length > 0`; `#cnt-layer-gwm` zeigt nicht mehr `(0/0)`, sondern `(x/N)` mit `x > 0` und `N` == real aus `grundwassermessstellen.geojson` gelesener Feature-Count.
8. Assert visuell: Screenshot von `#map` matcht `gwm-layer-on.png` innerhalb Toleranz.
9. Klicke erneut (deaktivieren): `#cnt-layer-gwm` zurück auf `(0/0)`, `map.hasLayer(...)` === `false`, Screenshot matcht `gwm-layer-off.png`.

## 6. Neue Daten nötig? — Nein, reines Prozess-/Tooling-Feature

Kein neuer ELWAS-Scrape, kein LANUV/IT.NRW-Zugriff nötig. `elwas_client.py`/`elwas_toolkit/*` bleiben unangetastet — sie sind hier nur als stilistische Referenz relevant (dort werden bereits Playwright-Locator-Patterns gegen dieselbe Domäne verwendet), aber technologisch bewusst NICHT wiederverwendet (Python vs. Node, siehe Abschnitt 3). Die einzige "neue Datenquelle" für diese Suite sind die bereits im Repo liegenden `.geojson`-Dateien, gegen die zur Laufzeit (nicht hart codiert) validiert wird.

## 7. Verifikation — Pflicht-Spotcheck, NICHT nur "keine Konsolenfehler"

Referenz-Postmortems, die genau deshalb existieren: 15.07. (Datenfelder Stauanlagen/Regenbecken kaputt trotz "fertig") und 16.07. (Sidebar-Event-Verdrahtung kaputt trotz "fertig", weil nur auf JS-Fehler geprüft wurde). Bevor du diesen Auftrag als erledigt meldest:

1. Suite lokal grün: `npx playwright test` läuft komplett durch (nicht nur "startet ohne Absturz").
2. **Mach mindestens für die drei Pflicht-Kandidaten (GWM, Stauanlagen, Regenbecken) einen manuellen Spotcheck außerhalb des Test-Runs**: öffne den Playwright HTML-Report / Trace, schau dir die Screenshot-Diffs UND die geloggten Counter-Werte tatsächlich an, und cross-checke die erwartete Feature-Zahl unabhängig per `python -c "import json;print(len(json.load(open('stauanlagen.geojson'))['features']))"` (analog für die anderen beiden). Ein grüner Testlauf allein zählt hier explizit NICHT als Abnahme — genau dieses Muster ("fertig" gemeldet, aber nur oberflächlich geprüft) hat beide vorherigen Regressionen verursacht.
3. Bewusst mind. einmal einen der drei Kernlayer testweise kaputt machen (z.B. lokal den Event-Listener im Sidebar-Toggle-Code auskommentieren) und bestätigen, dass die Suite dabei tatsächlich rot wird — sonst ist der Test wertlos (hätte die 16.07.-Regression nicht gefangen). Änderung danach wieder zurücknehmen, nicht committen.
4. **Baseline-Bootstrap:** Screenshots dürfen NICHT lokal auf Windows generiert werden (Font-Rendering weicht von Linux/`ubuntu-latest` ab, jeder erste CI-Run würde sonst grundlos rot sein). Baseline muss auf dem CI-Runner selbst erzeugt werden — dafür `ui-regression.yml` mit `workflow_dispatch`-Input `update_baseline` bauen, der bei `true` `npx playwright test --update-snapshots` laufen lässt und die neuen PNGs unter `tests/ui-regression/**/*-snapshots/` per Bot-Commit zurück nach `main` pusht. Ersten Lauf so triggern, Ergebnis prüfen, danach normale `deploy`-Workflows mit `needs:` verdrahten (siehe unten).
5. Nach Push: GitHub Actions Tab beobachten (`gh run watch` oder UI), bis `ui-regression-tests` UND `deploy` grün sind.
6. **Live-Verifikation nach Deploy** (Pflicht, nicht nur "Deploy ist grün"): `https://adb-aquarevier-secure.surge.sh` und `https://adb-aquarevier-secure.surge.sh/internal.html` im Browser öffnen, mindestens den GWM-Layer-Toggle manuell nachklicken und bestätigen, dass Marker tatsächlich erscheinen (nicht nur, dass die Seite lädt).

## 8. CI-Gate einhängen

Neue Datei `.github/workflows/ui-regression.yml` als **reusable workflow** (`workflow_call`), damit die Playwright-Setup-Schritte nicht in beiden Deploy-Workflows dupliziert werden:

```yaml
name: UI Regression Tests
on:
  workflow_call:
  workflow_dispatch:
    inputs:
      update_baseline:
        description: "Baseline-Screenshots neu erzeugen und committen"
        type: boolean
        default: false
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Run tests
        if: github.event.inputs.update_baseline != 'true'
        run: npx playwright test
      - name: Update baseline screenshots
        if: github.event.inputs.update_baseline == 'true'
        run: npx playwright test --update-snapshots
      - name: Commit refreshed baseline
        if: github.event.inputs.update_baseline == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add tests/ui-regression/**/*-snapshots/**
          git diff --cached --quiet || git commit -m "test: refresh Playwright visual baseline"
          git push
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

In `deploy-secure.yml` und `deploy-dev.yml` jeweils davor einhängen (nur den `jobs:`-Block erweitern, restliche Steps unverändert lassen):

```yaml
jobs:
  ui-regression-tests:
    uses: ./.github/workflows/ui-regression.yml
  deploy:
    needs: ui-regression-tests
    runs-on: ubuntu-latest
    steps:
      # ... bestehende Steps unverändert
```

Zusätzlich `.gitignore` ergänzen: `node_modules/`, `test-results/`, `playwright-report/` (Baseline-Ordner `tests/ui-regression/**/*-snapshots/` bewusst NICHT ignorieren — die müssen ins Repo). Und `.surgeignore` ergänzen um `package.json`, `package-lock.json`, `node_modules`, `tests/`, `playwright-report/`, `test-results/`, `playwright.config.js` — sonst deployt `surge . ...` das komplette Node-Tooling mit auf die öffentliche Karte. Die bestehende `internal.html`-Zeile in `.surgeignore` unverändert lassen (wird von den Deploy-Workflows separat per `sed` behandelt, nicht anfassen).

## 9. Commit-Konvention & Workflow

Bestehender Stil im Log (imperative, englisches `type:`-Präfix, kurz): `feat: ...`, `fix: ...`, `docs: ...`. Für diesen Auftrag `test:`-Präfix, z.B.:

```
test: add Playwright UI regression suite (visual + functional) gating deploy
```

ggf. als zweiter Commit, falls beim Testen ein echter Bug auffällt und gefixt wird:
```
fix: <konkreter Bug, den die neue Suite gefunden hat>
```

Workflow autonom, ohne Rückfrage bei jedem Schritt (Scope ist mit diesem Prompt klar): lokal bauen (`npm install`, `npx playwright install`) → Suite lokal grün bekommen → Baseline via CI-`workflow_dispatch` bootstrappen (Schritt 7.4) → committen → `git pull --rebase origin main` → `git push origin main` → GitHub Actions beobachten bis `ui-regression-tests` + `deploy` grün → live verifizieren (Schritt 7.6, echter Klick-Spotcheck, nicht nur Seite-lädt-Check) → erst dann als fertig melden.

## 10. Definition of Done (Checkliste)

- [ ] `package.json` + `@playwright/test` installiert, kein TypeScript eingeführt
- [ ] `playwright.config.js` nutzt `python server.py` als `webServer`, Viewport 1600×1200
- [ ] `tests/ui-regression/layer-toggles.spec.js`: Layer-Liste zur Laufzeit aus `overlayMaps` gelesen, nicht hart dupliziert
- [ ] Für GWM/Stauanlagen/Regenbecken: harter Zahlen-Assert auf Counter-Badge gegen real aus `.geojson` gelesenen Feature-Count
- [ ] Netzwerk-Assertion nur bei den tatsächlich lazy-geladenen Layern (GSK3C x2, GWM), nicht bei eager geladenen
- [ ] Screenshot-Diff nur auf `#map`-Ausschnitt, mit Toleranz gegen Font-Rauschen
- [ ] Konsolen-Fehler-Check vorhanden, aber explizit als "notwendig, nicht hinreichend" behandelt
- [ ] Absichtlich kaputt gemachter Event-Listener lässt die Suite lokal rot werden (Beweis, dass sie die 16.07.-Klasse fängt), Änderung danach zurückgenommen
- [ ] Baseline auf `ubuntu-latest` (nicht Windows) erzeugt und committet
- [ ] `.github/workflows/ui-regression.yml` neu, `deploy-secure.yml`/`deploy-dev.yml` haben `needs: ui-regression-tests`
- [ ] `.gitignore`/`.surgeignore` so ergänzt, dass Node-Tooling nicht mit auf Surge deployt wird
- [ ] Live auf `adb-aquarevier-secure.surge.sh` UND `/internal.html` manuell nachgeklickt, nicht nur Actions-Grün abgehakt
- [ ] Commit-Messages im etablierten `type: ...`-Stil, gepusht via `pull --rebase` + Retry (kein Force-Push)
```

</details>

---

## 9. Update-Radar: Was hat sich seit dem letzten Besuch geändert? (ERLEDIGT)

**Kategorie:** UX

**Mehrwert:** Florian öffnet die Karte oft erst Wochen später vor einem Termin und muss aktuell manuell erraten, ob sich seither Daten geändert haben. Ein automatischer Diff seit dem letzten Besuch spart Zeit und verhindert veraltete Aussagen gegenüber Stakeholdern. Kein Duplikat der Zeitraffer-Animation (kontinuierlich, ein Layer) oder des Pegel-Trends (mehrjährig) - hier geht es um einen diskreten, layerübergreifenden Session-Diff basierend auf dem persönlichen letzten Besuchszeitpunkt.

**Technischer Ansatz (Kurzfassung):** Letzten Besuchs-Zeitstempel in localStorage speichern; beim Laden aktuelle Datensätze gegen den gecachten Snapshot der letzten Sitzung diffen (neue/entfernte IDs, geänderte Kernfelder); Ergebnis als dismissable Panel 'X neue Industrieeinleiter, Y Status geändert seit [Datum]' mit Klick-zu-Zoom pro Eintrag.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag fuer Antigravity: Feature "Update-Radar" (Session-Diff seit letztem Besuch)

KONTEXT & ARBEITSWEISE (immer zuerst)
- Root: `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map` (git repo, GitHub `Dtunder/adb_aquarevier_map`, branch `main`).
- Vor Start: `git pull` (rebase, nicht merge). Mehrere Agenten (Claude + du) arbeiten parallel am selben Checkout - bei Push-Konflikt: pull/rebase + retry, NIEMALS force-push.
- Push auf `origin/main` deployt automatisch via GitHub Actions auf Surge.sh: `index.html` -> https://adb-aquarevier-secure.surge.sh (oeffentliche Karte), `internal.html` -> Florians Editor-Tool (strukturell meist identisch, aber eigenstaendiges `<script>`, eigene Zeilennummern - NICHT annehmen, dass Zeilennummern zwischen beiden Dateien uebereinstimmen, immer per grep im jeweiligen File neu verifizieren).
- Autonomer Workflow, keine Rueckfrage noetig sobald der Scope (dieser Prompt) klar ist: implementieren -> lokal testen -> committen -> pushen -> live verifizieren.
- Beide Dateien werden bei UI-Features immer synchron gehalten - dieses Feature MUSS in `index.html` UND `internal.html` umgesetzt werden.

ZIEL DES FEATURES
Florian besucht die Karte oft erst Wochen nach dem letzten Mal. Er soll beim Laden automatisch sehen, was sich seit seinem letzten persoenlichen Besuch (client-seitig via `localStorage`, KEIN Server/Backend) an den Sachdaten geaendert hat: neue Objekte, entfernte Objekte, geaenderte Kernfelder - als dismissable Panel mit Klick-zu-Zoom pro Eintrag. Kein Duplikat der Zeitraffer-Animation (kontinuierlicher Layer) oder eines Pegel-Trends (mehrjaehrig) - falls du Reste/Ansaetze dazu im Code findest, NICHT anfassen/wiederverwenden, das ist bewusst ein anderes, diskretes Feature.

---

SCHRITT 1: Exploration (selbst neu verifizieren, nicht auf Zeilennummern aus alten Notizen verlassen)

Fuehre zuerst aus (in beiden Dateien):
```
grep -n "buildUnifiedSearchIndex\|overlayMaps = {\|generate-report-btn\|LOCAL_STORAGE_KEY\|body.light-theme\|</body>" index.html internal.html
```
Und pruefe die Property-Keys der relevanten GeoJSON-Dateien selbst (Python, im Projekt-Root):
```python
import json
for f in ["elwas_einleiter.geojson","klaeranlagen.geojson","pegel.geojson","stauanlagen.geojson","regenbecken.geojson","querbauwerke.geojson","contacts_anonymized.geojson"]:
    d = json.load(open(f, encoding="utf-8"))
    print(f, len(d["features"]), list(d["features"][0]["properties"].keys()))
```
Damit hast du die Ground Truth, falls sich Feldnamen seit dieser Analyse geaendert haben (parallele Agenten!).

---

SCHRITT 2: Scope - welche Layer diffen, welcher Key, welche Kernfelder

Nur Layer mit einer stabilen ID werden gedifft (sonst false positives). Aktueller Stand (bei Abweichung: Ground Truth aus Schritt 1 gewinnt):

| Layer (Datei) | ID-Feld | Kernfelder fuer "Status geaendert" | Panel-Label |
|---|---|---|---|
| elwas_einleiter.geojson | `betriebs_nr` | `name`, `einleitungsart`, `branchen` (als sortierter, kommaseparierter String vergleichen), `mengen_text` | Industrieeinleiter |
| klaeranlagen.geojson | `anlagen_nr` | `betreiber`, `gewaesser`, `ausbaugroesse_ew` | Klaeranlagen |
| pegel.geojson | `pegel_nr` | `betreiber`, `nq_m3s`, `mq_m3s`, `hq_m3s` | Pegel |
| stauanlagen.geojson | `anlagen_nr` | `betreiber`, `gewaesser`, `typ` | Stauanlagen |
| regenbecken.geojson | `anlagen_nr` | `betreiber`, `typ`, `abwasserbereich` | Regenbecken/-entlastungsanlagen |
| querbauwerke.geojson | `anlagen_nr` | `bauwerksart`, `typ`, `gewaesser` | Querbauwerke |
| contacts_anonymized.geojson | KEINE dedizierte ID -> Composite Key `name + "|" + group` bilden | `group` (Kategoriewechsel), `name` | Institutionen/Akteure |

Explizit AUSGESCHLOSSEN aus dem Diff (mit Begruendung, nicht einfach vergessen):
- `grundwassermessstellen.geojson` (3746+ Features, KEINE stabile ID, Namen teils generisch) - ein ID-loser Diff wuerde bei jeder Neusortierung/Neuauswertung der Behoerde massenhaft Phantom-Aenderungen erzeugen. Bewusst v1-Luecke, nicht implementieren.
- `contacts_2025_anonymized.geojson` (Archiv-Layer "Stand 2025", aendert sich per Definition nicht).
- Alle reinen Geometrie-/Grenz-Layer (`kreise_rr.geojson`, `gewaesser_rur_official.geojson`, `untersuchungsgebiet.geojson`, WMS-Layer etc.) - keine Sachdaten, keine sinnvolle ID.

---

SCHRITT 3: localStorage-Schema

Neuer Key (kollidiert nicht mit internal.html's bestehendem `LOCAL_STORAGE_KEY = 'contacts_local_full'` - das ist ein anderer Zweck, Florians Editor-Entwuerfe, NICHT anfassen):

`aquarevier_update_radar_v1` -> JSON:
```json
{
  "visitedAt": "2026-07-12T18:03:00.000Z",
  "layers": {
    "einleiter": { "<betriebs_nr>": { "lat":.., "lng":.., "name":"...", "einleitungsart":"...", "branchen":"...", "mengen_text":"..." }, ... },
    "klaeranlage": { ... },
    "pegel": { ... },
    "stauanlage": { ... },
    "regenbecken": { ... },
    "querbauwerk": { ... },
    "akteur": { "<name>|<group>": { "lat":.., "lng":.., "name":"...", "group":"..." }, ... }
  }
}
```
Wichtig: pro Eintrag `lat`/`lng` MIT abspeichern (nicht nur Hash/Kernfelder) - damit auch ENTFERNTE Objekte noch auf ihre letzte bekannte Position gezoomt werden koennen (siehe Panel-Verhalten unten). Geschaetzte Groesse: ~750 Records gesamt, unproblematisch fuer localStorage (5-10MB Limit).

Ablauf beim Laden:
1. Alten Snapshot aus `localStorage` lesen (falls vorhanden).
2. Aktuelle Daten laden (siehe Schritt 4), Diff berechnen: neue IDs (in aktuell, nicht in alt), entfernte IDs (in alt, nicht in aktuell), geaenderte IDs (ID in beiden, mind. 1 Kernfeld unterschiedlich - Arrays/Objekte vorher zu einem stabilen String normalisieren, NICHT rohes `JSON.stringify` auf ganze Feature-Objekte, das erzeugt False Positives durch Key-Reihenfolge).
3. **Erster Besuch ueberhaupt** (kein alter Snapshot in localStorage): KEIN Panel zeigen (nichts zum Vergleichen da), nur Baseline-Snapshot schreiben.
4. Direkt danach IMMER den Snapshot mit den aktuellen Daten + `visitedAt = jetzt` ueberschreiben - unabhaengig davon, ob ein Panel angezeigt oder sofort weggeklickt wird. Der Diff ist damit strikt "seit dem letzten tatsaechlichen Laden der Seite", nicht "seit letztem Wegklicken".
5. Wenn Diff komplett leer (0 neu, 0 entfernt, 0 geaendert): KEIN Panel zeigen (kein Spam bei haeufigen Besuchen ohne Aenderungen).

---

SCHRITT 4: Implementierung - WO im Code, WIE

- Baue ein eigenstaendiges, isoliertes IIFE (eigener Scope, eigene `fetch()`-Aufrufe der 7 kleinen Dateien aus der Tabelle oben), platziert NACH dem Aufruf von `buildUnifiedSearchIndex()` im jeweiligen `<script>`-Block. NICHT in bestehende Closures/Funktionen (`buildUnifiedSearchIndex`, Sidebar-Layer-Toggle-Handler, `overlayadd`/`overlayremove`-Wiring) hineinsplicen oder deren Variablen umbauen - Praezedenzfall 2026-07-16: der Sidebar-Refactor hat dabei versehentlich Lazy-Load-Events gekappt. Ein zusaetzlicher kleiner Fetch-Batch fuer 7 Dateien mit je <150KB ist performance-technisch irrelevant (anders als die 4MB+-Problematik im bestehenden Perf-Backlog) - Isolation hier ist wichtiger als das Sparen von ein paar KB.
- Reihenfolge: eigenes `Promise.allSettled([...7 fetches])` -> pro Layer Feature-Array in das Snapshot-Format (Schritt 3) transformieren -> gegen alten `localStorage`-Snapshot diffen -> Panel rendern (falls Diff nicht leer) -> neuen Snapshot schreiben.
- Bestehende CSS-Variablen fuer Light/Dark-Theming wiederverwenden (`--bg-surface`, `--border-color`, `--text-primary`, `--text-secondary`, `--accent-primary`, Klasse `body.light-theme` als Override-Selektor) - siehe `:root`-Block nahe Zeile 21 in index.html (in internal.html per grep neu verifizieren). Kein hartkodiertes Weiss/Schwarz, sonst im jeweils anderen Theme unsichtbar/unlesbar.
- Fuer Klick-zu-Zoom pro Eintrag das bestehende Verhaltensmuster der Unified-Search uebernehmen (Funktionen `executeSelect`/`flashPoints`/`openStandalonePopup`, zu finden per `grep -n "function executeSelect" index.html`): `map.setView([lat,lng], Math.max(map.getZoom(),15))`, kurzer Pulse-Marker (`flashPoints`), Popup mit Name+Layer-Label oeffnen. Bei GWM-artigen Lazy-Layern ist das hier nicht relevant, da GWM nicht im Diff-Scope ist.

**Sonderfall internal.html (WICHTIG, nicht uebersehen):** internal.html bevorzugt fuer den Akteure-Layer lokale Entwuerfe aus `localStorage['contacts_local_full']` gegenueber der Netzwerk-Datei (grep `LOCAL_STORAGE_KEY` und die Stelle, die bei vorhandenem lokalen Draft die Datei ersetzt). Der Update-Radar soll aber immer gegen die PUBLIZIERTE/live geladene `contacts_anonymized.geojson` (frischer Netzwerk-Fetch, NICHT der lokale Entwurf) diffen - die Fragestellung ist "was hat sich in den offiziellen Daten geaendert", nicht "was habe ich selbst gerade entworfen". Also fuer den `akteur`-Layer im Update-Radar-IIFE explizit `fetch('contacts_anonymized.geojson')` verwenden, unabhaengig davon was die Editor-Logik von internal.html gerade anzeigt.

---

SCHRITT 5: Sichtbares Ergebnis NACH der Umsetzung (exakt)

- Panel erscheint automatisch kurz nach Seitenladen (sobald der Diff berechnet ist), wenn UND NUR WENN es echte Unterschiede zum letzten Besuch gibt. Position: schwebende Karte, die NICHT die Sidebar, die Suchbox oder die Leaflet-Zoom-/Layer-Kontrolle (oben rechts) verdeckt - vor dem Bauen die Position von `.search-box` per grep pruefen und einen freien Platz waehlen (z.B. oben mittig als schmales Banner ueber der Karte, oder oben rechts UNTER der Layer-Kontrolle).
- Kopfzeile des Panels, Beispieltext: "🔔 Update-Radar: 3 neue Industrieeinleiter, 2 Status geändert, 1 entfernt seit 12.07.2026" (Datum = `visitedAt` des VORHERIGEN Besuchs, deutsch formatiert `DD.MM.YYYY`).
- Darunter eine kompakte, scrollbare Liste, ein Eintrag pro Aenderung, Beispiele:
  - "🏭 Kunststoffwerke Musterstadt GmbH — neu (Industrieeinleiter)"
  - "🚰 Klaeranlage XYZ — Betreiber geändert: Wasserverband Eifel-Rur → Erftverband"
  - "⛰️ Talsperre Muster — entfernt"
- Ein "×"-Button oben rechts im Panel blendet es fuer diese Seitenansicht aus (kein erneutes Erscheinen nach Reload noetig, weil Snapshot ja schon beim Laden aktualisiert wurde, siehe Schritt 3.4).
- Klickpfad-Beispiel zum manuellen Testen: Seite laden -> Panel erscheint mit "1 Status geändert" -> Klick auf den Eintrag "Klaeranlage XYZ — Betreiber geändert" -> Karte fliegt/zoomt auf die Koordinaten dieser Klaeranlage (Zoomstufe >=15), ein kurzer Puls-Marker blinkt an der Stelle, ein Popup mit Name und Layer-Label oeffnet sich automatisch -> Panel bleibt bis zum expliziten "×"-Klick sichtbar (Klick auf einen Eintrag schliesst das Panel NICHT automatisch, Florian soll mehrere Eintraege nacheinander anklicken koennen).
- Beim naechsten Reload direkt danach (ohne zeitlichen Abstand): KEIN Panel mehr (Diff ist jetzt leer, weil der Snapshot beim vorherigen Laden bereits aktualisiert wurde).

---

SCHRITT 6: Neue Daten noetig?

NEIN - reines Frontend-/Prozess-Feature. Keine neuen ELWAS-Scrapes, keine neue Quelle (LANUV/IT.NRW etc.), `elwas_toolkit/elwas_client.py` und alles unter `elwas_raw_data/*.py` bleiben unangetastet. Es werden ausschliesslich bereits vorhandene, bereits deployte `.geojson`-Dateien im Projekt-Root erneut per `fetch()` geladen (Netzwerk-Request, kein Datei-Zugriff) und client-seitig in `localStorage` verglichen.

---

SCHRITT 7: Test-/Verifikationspflicht (VERBINDLICH, "keine Konsolenfehler" reicht NICHT)

Referenz-Vorfaelle (beide als "fertig" gemeldet, waren es nicht): 2026-07-15 waren Datenfelder (Stauanlagen/Regenbecken) trotz 0 Konsolenfehlern inhaltlich falsch befuellt; 2026-07-16 hat ein Sidebar-Refactor lazy-load Events gekappt, ebenfalls ohne JS-Exception. Deshalb hier zwingend:

1. Lokalen Server starten (Playwright, wie in fruaheren Sessions ueblich - eigenes kleines Test-Skript bauen falls keins mehr vorhanden ist).
2. **Frischer Besuch:** `localStorage.clear()`, Seite laden -> Assertion: KEIN Update-Radar-Panel sichtbar, aber `localStorage.getItem('aquarevier_update_radar_v1')` enthaelt danach einen validen, geparsten JSON-Snapshot mit den erwarteten Layer-Keys und plausibler Eintragsanzahl (Groessenordnung mit Schritt 1 abgleichen, z.B. ~101 Industrieeinleiter, ~60 Klaeranlagen).
3. **Echter Diff-Spotcheck (Kern der Pruefung):** vor dem Reload per `page.evaluate()` gezielt EINEN Eintrag im gespeicherten Snapshot manipulieren (z.B. bei einer bekannten `anlagen_nr` den `betreiber`-Wert auf einen Fantasiewert setzen) UND einen kompletten Eintrag entfernen (simuliert "entfernt"), dann neu laden -> Assertion: Panel zeigt exakt "1 Status geändert, 1 entfernt", der Text im geänderten Eintrag nennt den echten Namen der Anlage, Klick auf den Eintrag zoomt auf die tatsaechlich korrekten Koordinaten dieser Anlage und oeffnet das richtige Popup (per DOM-Snapshot/Screenshot verifizieren, nicht nur "kein Fehler geworfen").
4. **Ruhiger Reload:** direkt danach nochmal laden (kein manipulierter Snapshot mehr) -> Assertion: KEIN Panel (Diff korrekt leer).
5. **Regressionscheck fuer den 2026-07-16-Vorfall:** nach dem Laden mit aktivem Update-Radar-Panel mindestens 2 Layer-Checkboxen in der Sidebar an/aus togglen (z.B. Kläranlagen, Pegel) und per `map.hasLayer(...)`/tatsaechlich sichtbaren Markern im DOM verifizieren, dass Marker wirklich erscheinen/verschwinden - nicht nur dass ein Event gefeuert wurde. Bestaetigt, dass das neue Panel keine bestehenden Sidebar-/Layer-Events stoert.
6. Dieselben Schritte 2-5 auf **beiden** Dateien wiederholen: `index.html` UND `internal.html` (inkl. dem in Schritt 4 beschriebenen Sonderfall - im internal.html-Test zusaetzlich einen lokalen Akteurs-Entwurf in `contacts_local_full` simulieren und verifizieren, dass der Update-Radar dadurch NICHT faelschlich "Aenderungen" fuer selbst-editierte Akteure meldet).
7. Theme-Check: Panel in Light- UND Dark-Theme (Toggle-Button `#theme-toggle`) per Screenshot pruefen - Text muss in beiden lesbar sein (Kontrast, kein weisser Text auf weissem Grund).
8. Erst wenn 2-7 alle gruen sind: committen.

---

SCHRITT 8: Commit, Push, Live-Verifikation

- Commit-Message-Konvention (siehe `git log`-Historie, kurzer `feat:`/`fix:`-Prefix + praezise Zusammenfassung, ruhig deutsch-englisch gemischt wie im Projekt ueblich), z.B.:
  `feat: Update-Radar Panel - Session-Diff seit letztem Besuch (localStorage)`
  Bei Nacharbeiten/Fixes analog `fix: ...`.
- Direkt pushen (`git push origin main`, nach vorherigem `git pull --rebase` falls zwischenzeitlich fremde Commits reingekommen sind - autonom retry, kein force-push, keine Rueckfrage).
- Nach Push: GitHub Actions-Lauf abwarten, dann live auf https://adb-aquarevier-secure.surge.sh (und der internal.html-URL) denselben Spotcheck aus Schritt 7.3 wiederholen (localStorage manuell in der Konsole manipulieren, reload, Panel + Klick-zu-Zoom pruefen) - "deployt" heisst hier live UND funktional bestaetigt, nicht nur "Push erfolgreich".
- Am Ende kurz in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` (neuer Abschnitt anhaengen, bestehende Abschnitte nicht anfassen) dokumentieren: was umgesetzt wurde, welche Layer im Diff-Scope sind/bewusst fehlen (Grundwassermessstellen), Ergebnis der Spotchecks.
```

</details>

---

## 10. Offener Datenexport (GeoJSON/CSV) für Dritte mit Lizenz- und Versionsstempel

**Kategorie:** Daten-Infrastruktur/Open Data

**Mehrwert:** Andere Akteure im Strukturwandel-Prozess (Kommunen, Hochschulen, Zukunftsagentur) könnten die bereits aufbereiteten AquaRevier-Daten für eigene Analysen nutzen wollen, müssen aktuell aber selbst wieder bei ELWAS scrapen. Ein offener Export positioniert AquaRevier als Dateninfrastruktur der Region statt reines Anzeige-Tool und erhöht Florians Standing bei Kooperationspartnern.

**Technischer Ansatz (Kurzfassung):** Pro Layer ein statischer Download-Endpoint (/export/<layer>.geojson und .csv), automatisch bei jedem Scrape-Lauf neu generiert, mit Metadaten-Header (Quelle ELWAS, Lizenz DL-DE-BY-2.0, Scrape-Zeitstempel, Versions-Hash); 'Daten nutzen'-Link in der Sidebar.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag an Antigravity: Offener Datenexport (GeoJSON/CSV) mit Lizenz- und Versionsstempel

Kontext: Root ist `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map`, Git-Repo `github.com/Dtunder/adb_aquarevier_map`, Branch `main`. Push auf `origin/main` triggert automatisch drei GitHub-Actions-Workflows (`deploy-secure.yml`, `deploy-dev.yml`, `static.yml`), die den kompletten Repo-Inhalt 1:1 nach https://adb-aquarevier-secure.surge.sh (u. a.) deployen — jede neue Datei im Root oder in Unterordnern ist danach automatisch live erreichbar, ohne dass du am Deploy-Workflow etwas ändern musst. Am selben Checkout arbeitet parallel auch Claude. Führe deshalb VOR dem Start zwingend `git pull` aus, und falls beim späteren Push ein Konflikt auftritt: `git pull --rebase` und erneut versuchen, niemals `git push --force`. Arbeite den gesamten Auftrag eigenständig und autonom ab (kein Zwischen-Nachfragen), sobald du diesen Scope verstanden hast — er ist unten vollständig spezifiziert.

## 1. Bestandsaufnahme (zuerst ausführen, bevor du irgendetwas änderst)

Führe aus und lies die Treffer, bevor du Code schreibst:
```
grep -rn "Datenlizenz\|DL-DE\|Quelle: ELWAS" index.html internal.html
grep -n "ROOT_PATH\|shutil.copy" elwas_raw_data/build_*_geojson.py elwas_raw_data/build_geojson.py
grep -n "sidebar-content\|Export Section\|export-csv-btn\|generate-report-btn\|btn-generate-report" index.html internal.html
```
Erwartetes Ergebnis (zur Orientierung, bitte trotzdem selbst verifizieren, da sich der Stand seit dieser Analyse geändert haben kann):
- Root enthält bereits 7 fertig gescrapte, WGS84-transformierte ELWAS-Layer als GeoJSON, die von `index.html`/`internal.html` per `fetch()` geladen werden und dort bereits einen Lizenz-String im Popup tragen ("Quelle: ELWAS-WEB (Land NRW), Datenlizenz Deutschland - Namensnennung 2.0"): `elwas_einleiter.geojson`, `klaeranlagen.geojson`, `grundwassermessstellen.geojson`, `pegel.geojson`, `stauanlagen.geojson`, `regenbecken.geojson`, `querbauwerke.geojson`.
- Die zugehörigen Build-Skripte liegen in `elwas_raw_data/` (`build_geojson.py`, `build_klaeranlagen_geojson.py`, `build_gwm_geojson.py`, `build_pegel_geojson.py`, `build_stauanlagen_geojson.py`, `build_regenbecken_geojson.py`, `build_querbauwerke_geojson.py`). WICHTIG: nur `build_stauanlagen_geojson.py`, `build_regenbecken_geojson.py` und `build_querbauwerke_geojson.py` kopieren ihr Ergebnis per `shutil.copy` automatisch in den Root; `build_geojson.py`, `build_klaeranlagen_geojson.py`, `build_gwm_geojson.py`, `build_pegel_geojson.py` tun das NICHT (die Root-Kopien dort wurden offenbar manuell erzeugt). Verlasse dich deshalb für den Export NICHT auf `elwas_raw_data/*.geojson`, sondern lies ausschließlich die Root-Dateien (`./*.geojson`) ein — das ist garantiert der Stand, der auch tatsächlich live auf der Karte angezeigt wird.
- `index.html` hat eine Sidebar-Sektion mit Kommentar `<!-- Export Section -->` (IDs `export-csv-btn`, `export-pdf-btn`, `generate-report-btn`) — das ist ein CSV/PDF-Export der aktuell GEFILTERTEN KONTAKTE (personenbezogene/institutionelle Akteursdaten), NICHT die hier geforderte offene Geodaten-Export-Funktion. Verwechsle die beiden nicht.
- `internal.html` hat an vergleichbarer Stelle einen strukturell ANDEREN Button (`id="btn-generate-report"`, andere umgebende Divs) — trotz Projektkonvention "meist strukturell identisch" ist das hier NICHT 1:1 gleich. Kopiere den `index.html`-Patch also nicht blind nach `internal.html`, sondern suche dort die passende Einfügestelle eigenständig per grep/Read.

## 2. Scope dieser Aufgabe — explizit festgelegt, bitte NICHT erweitern ohne Rückfrage im Handoff-Dokument

Exportiert werden ausschließlich die 7 ELWAS-Layer oben. Explizit AUSSER Scope:
- `contacts.geojson` / `contacts_anonymized.geojson` (Akteurs-/Kontaktdaten, andere Sensitivitätsklasse, kein ELWAS-Ursprung, nicht Teil dieses "Open Data"-Exports).
- Grenz-/Gewässer-/Schutzgebiets-Layer (`kreise_rr.geojson`, `gewaesser_rur_official.geojson`, `untersuchungsgebiet.geojson`, `rur_einzugsgebiet*.geojson`, WMS-Layer wie Wasserschutzgebiete/Tagebaue): Diese stammen von LANUV/Geobasis NRW, nicht vom ELWAS-Scraper, und tragen im Code (anders als die 7 ELWAS-Layer) KEINEN geprüften Lizenz-String. Nicht exportieren, solange die Lizenzlage nicht separat verifiziert ist.
- Kein neuer ELWAS-Scrape, keine neue externe Quelle (LANUV/IT.NRW). Dies ist ein reines Build-/Prozess- und Frontend-Feature auf bereits vorhandenen Daten. `elwas_toolkit/elwas_client.py` (Playwright) wird NICHT benötigt und soll nicht angefasst werden.
- Keine neue GitHub-Actions-Cron-Automatisierung anlegen (kein bestehender Scrape-Workflow vorhanden, nur die 3 Deploy-on-Push-Workflows unter `.github/workflows/`; ein Playwright-Scrape auf GH-hosted Runnern wäre ein eigenes, viel größeres Vorhaben). "Automatisch bei jedem Scrape-Lauf" wird stattdessen als dokumentierter manueller Prozessschritt umgesetzt (siehe Punkt 4e).

## 3. Datenherkunft-Antwort (damit du es nicht nochmal recherchieren musst)

Reines Frontend-/Prozess-Feature ohne neue Daten. Alle benötigten Rohdaten liegen bereits als Root-GeoJSON vor (siehe Punkt 1). Es wird kein neuer Playwright-Scrape ausgeführt.

## 4. Implementierung — Schritt für Schritt

a) Neues Skript `elwas_raw_data/build_open_data_export.py` anlegen. Es liest die 7 Root-GeoJSON-Dateien (siehe Punkt 1) und erzeugt/überschreibt für jeden Layer im neuen Root-Ordner `export/`:
   - `export/<layer_key>.geojson`: identisches FeatureCollection-Objekt wie im Root, ZUSÄTZLICH ein Top-Level-Key `"metadata"` (laut RFC 7946 sind zusätzliche Top-Level-Members in GeoJSON erlaubt/"foreign members" — bricht also nichts, auch nicht Leaflets `L.geoJSON()`, das unbekannte Top-Level-Keys ignoriert):
     ```
     "metadata": {
       "layer": "<layer_key>",
       "titel": "<Klartext-Name, z.B. 'Kläranlagen'>",
       "quelle": "ELWAS-WEB (Land NRW)",
       "lizenz": "Datenlizenz Deutschland – Namensnennung – Version 2.0 (DL-DE-BY-2.0)",
       "lizenz_url": "https://www.govdata.de/dl-de/by-2-0",
       "projekt": "AquaRevier (ADB), Rheinisches Revier",
       "stand_quelldaten": "<ISO8601 UTC, aus mtime der Root-Quelldatei>",
       "export_generiert_am": "<ISO8601 UTC, Laufzeit des Skripts>",
       "anzahl_features": <int>,
       "version_hash": "<sha256(sorted, kompakt-serialisierte features-Liste)[:12]>"
     }
     ```
     `version_hash` deterministisch berechnen: `hashlib.sha256(json.dumps(features, sort_keys=True, ensure_ascii=False, separators=(",",":")).encode("utf-8")).hexdigest()[:12]`. Zweimal hintereinander mit identischem Input laufen lassen muss denselben Hash ergeben; ändert sich auch nur ein Feature, muss sich der Hash ändern — das ist Teil der Pflicht-Verifikation unten.
   - `export/<layer_key>.csv`: geflatteter Export der `properties` jedes Features (Spalten = Union aller vorkommenden Property-Keys im Layer, damit kein Feld verloren geht) PLUS zwei Spalten `lat`,`lon` (WGS84, aus `geometry.coordinates`, nur für `Point`-Geometrien — bei anderen Geometrietypen, die aktuell nicht erwartet werden, Zeile mit Warnung im Skript-Log überspringen statt crashen). Keine Kommentarzeile/Metadaten-Header IN der CSV (bricht strikte CSV-Parser/pandas) — Metadaten stehen nur im begleitenden GeoJSON und im Manifest.
   - Zusätzlich einmalig `export/manifest.json` mit einer Liste aller 7 Layer (je: `key`, `titel`, `geojson_url`, `csv_url`, `quelle`, `lizenz`, `lizenz_url`, `anzahl_features`, `stand_quelldaten`, `version_hash`) plus `generiert_am` global.
   - Docstring/Kommentar oben im Skript: kurz erklären, dass es nach jedem erneuten Lauf der `build_*_geojson.py`-Skripte manuell (oder von einem künftigen Orchestrierungs-Skript) als letzter Schritt aufgerufen werden soll — es gibt aktuell keinen automatischen Cron/Scrape-Trigger dafür.

b) Skript einmal ausführen (`python elwas_raw_data/build_open_data_export.py`), Output-Log genau lesen (Feature-Zahlen pro Layer, keine stillen 0-Feature-Layer).

c) Neue Seite `export/index.html` — eine eigenständige, leichte statische Katalogseite (gleiches Dark-Theme/Look wie `index.html`, kein Leaflet nötig), die per `fetch('manifest.json')` die Liste client-seitig lädt und pro Layer rendert: Titel, Feature-Anzahl, Stand der Quelldaten (Datum), Lizenzhinweis mit Link auf `lizenz_url`, und zwei Download-Links/Buttons (`.geojson`, `.csv`, jeweils direkt auf die Datei, kein Klick-Umweg). Oben auf der Seite ein kurzer Absatz: Quelle ELWAS-WEB (Land NRW), Lizenz DL-DE-BY-2.0 mit Namensnennungspflicht, Hinweis dass die Daten bei jedem Scrape-Update neu generiert werden und der Versions-Hash Änderungen erkennbar macht.

d) `index.html` UI-Änderung: In der Sidebar, im Bereich der bestehenden `<!-- Export Section -->` (nicht die bestehenden Buttons umbauen/ersetzen, nur additiv ergänzen — beim letzten Sidebar-Refactor (16.07.) wurden dadurch bestehende `overlayadd`/`overlayremove`-Event-Listener gekappt, das darf hier nicht nochmal passieren), einen neuen Link/Button ergänzen, Klasse `filter-btn`, Text z. B. "🌍 Daten nutzen (GeoJSON/CSV)", `href="export/index.html"` `target="_blank"`.

e) `internal.html`: dieselbe Ergänzung an der dort tatsächlich vorhandenen Stelle (eigenständig verifiziert, siehe Punkt 1 — nicht den `index.html`-Diff blind übertragen).

f) `README.md`: neuen Abschnitt "## 📂 Offene Daten / Datenexport" nach dem Muster der bestehenden Abschnitte ergänzen — was wird exportiert, wo liegt es (`export/`), Lizenz, wie wird es aktuell gehalten (manueller Lauf von `build_open_data_export.py` nach jedem Scrape-Update, kein Cron).

g) Kurz prüfen, ob `export/` versehentlich von `.gitignore` oder `.surgeignore` erfasst wird (Stand jetzt: nein, sollte also unverändert bleiben) — falls doch, NICHT die Export-Dateien selbst gitignoren, sie sollen wie die bestehenden Root-`*.geojson`-Dateien committet und deployt werden.

## 5. Sichtbares Ergebnis nach Umsetzung (konkret, inkl. Beispiel-Klickpfad)

Auf https://adb-aquarevier-secure.surge.sh (und lokal via `server.py`):
1. Sidebar öffnen, zum unteren Bereich scrollen (bestehende Export-Section mit CSV/PDF-Kontaktexport-Buttons und "Bericht generieren (PDF)").
2. Neuer Button "🌍 Daten nutzen (GeoJSON/CSV)" ist sichtbar, gleiches Styling wie die anderen `filter-btn`-Elemente.
3. Klick öffnet in neuem Tab `export/index.html`: eine Katalogseite mit 7 Zeilen/Karten (Industrielle Einleiter, Kläranlagen, Grundwassermessstellen, Pegel, Stauanlagen, Regenbecken, Querbauwerke), je mit Feature-Anzahl, Stand-Datum, Lizenzhinweis + Link, und je einem GeoJSON- und einem CSV-Download-Link.
4. Klick auf einen GeoJSON-Link lädt/öffnet `export/<layer>.geojson` direkt im Browser (valides JSON, mit `"metadata"`-Block oben, Feature-Liste identisch zur Live-Karte).
5. Klick auf den CSV-Link lädt eine `.csv` mit einer Kopfzeile aus Property-Namen + `lat`,`lon`, keine Metadaten-Zeile.
6. Alle bisherigen Sidebar-Funktionen (Layer-Toggles inkl. Live-Counter, Kontakt-Suche, bestehender CSV/PDF-Kontaktexport, "Bericht generieren") funktionieren unverändert weiter.

## 6. Pflicht-Verifikation vor "fertig"-Meldung — NICHT nur "keine Konsolenfehler"

Reine Konsolen-Fehlerfreiheit reicht ausdrücklich NICHT als Nachweis. Bei früheren Antigravity-Änderungen an diesem Repo waren trotz "fertig"-Meldung sowohl Datenfelder kaputt (Stauanlagen/Regenbecken, 15.07.) als auch UI-Event-Verdrahtung kaputt (Sidebar-Refactor kappte lazy-load Events, 16.07.) — beides wäre mit einem reinen Konsolen-Check nicht aufgefallen. Führe deshalb zusätzlich zwingend aus und protokolliere die Ergebnisse:
- Für mindestens 3 der 7 Layer (darunter Grundwassermessstellen, Pegel, Regenbecken — diese haben sichtbare Sidebar-Counter-Badges `id="cnt-layer-gwm"`, `id="cnt-layer-pegel"`, `id="cnt-layer-regenbecken"`): Live-Kartenansicht öffnen, Layer aktivieren, die im Counter-Badge angezeigte Feature-Zahl mit `anzahl_features` im exportierten `export/<layer>.geojson` vergleichen — müssen exakt übereinstimmen. Für Layer ohne eigenes Counter-Badge (Kläranlagen, Einleiter) stattdessen im Browser-DevTools-Netzwerk-Tab die Antwortgröße/Feature-Zahl des Original-`fetch()` mit der Export-Datei abgleichen.
- Für Querbauwerke gezielt: dieser Layer hatte laut Git-Historie zeitweise kaputte name/ID-Felder (Commit "fix: default-disable Querbauwerke layer, scraped name/ID data is broken", später vermeintlich korrigiert). Vor Aufnahme in den Export mindestens 3–5 zufällige Features aus `export/querbauwerke.geojson`/`.csv` gegen die tatsächliche Popup-Anzeige auf der Karte prüfen (Namen/IDs plausibel und nicht leer/kaputt) — nicht nur Dateiexistenz prüfen.
- CSV-Spotcheck: für 2 Layer die erzeugte `.csv` mit `pandas.read_csv` (oder Excel/DevTools) öffnen, Zeilenzahl == Feature-Zahl, mindestens ein bekannter Realwert (z. B. ein `betreiber`/`name`-Feld, das auch im Karten-Popup sichtbar ist) muss korrekt und nicht leer erscheinen.
- Determinismus des `version_hash`: Skript zweimal hintereinander ohne Datenänderung laufen lassen → identischer Hash. Dann testweise ein Feature in einer Kopie ändern und Skript erneut laufen lassen → Hash muss sich ändern. Beides im Terminal-Output belegen.
- JSON-Validität aller 7 `export/*.geojson` + `manifest.json` per `python -c "import json,glob; [json.load(open(f, encoding='utf-8')) for f in glob.glob('export/*.json*')]"` (Exit ohne Fehler).
- Lizenz-URL `https://www.govdata.de/dl-de/by-2-0` tatsächlich öffnen/prüfen, dass sie erreichbar ist und den erwarteten Lizenztext zeigt.
- Regressionscheck bestehender Funktionen: nach dem Sidebar-Patch die bereits vorhandenen Buttons "CSV Export", "PDF Export", "Bericht generieren (PDF)" (bzw. das internal.html-Äquivalent `btn-generate-report`) sowie mindestens 2 Layer-Toggle-Checkboxen (überprüfen, dass `overlayadd`/`overlayremove` weiterhin feuern, Counter sich aktualisieren) tatsächlich anklicken und Funktion bestätigen — nicht nur visuell vorhanden, sondern funktional geprüft.
- Nach dem Push (siehe unten): auf der LIVE-Surge-URL (nicht nur lokal) `export/manifest.json` sowie mindestens einen `.geojson`- und einen `.csv`-Link tatsächlich abrufen (curl oder Browser) und HTTP 200 + nicht-leeren Inhalt bestätigen.

## 7. Commit & Workflow

Commit-Message im etablierten Stil dieses Repos (Conventional-Commits-Präfix, danach knapper deutscher/englischer Ein-Satz-Beschrieb, siehe `git log`), z. B.:
`feat: offener GeoJSON/CSV-Datenexport mit Lizenz- und Versionsstempel fuer ELWAS-Layer`

Ablauf wie etabliert, autonom ohne Rückfrage bei jedem Einzelschritt: build/Skript ausführen → lokal über `server.py` testen (inkl. aller Punkte aus Abschnitt 6) → committen → `git pull --rebase` falls der Remote inzwischen weiterläuft → pushen auf `origin/main` → auf der live deployten Surge-URL gemäß Abschnitt 6 verifizieren, dass der Export tatsächlich funktioniert (nicht nur, dass der Workflow grün ist). Bei Konflikten beim Push: neu pullen/rebasen und erneut versuchen, niemals `--force`. Committe nur Dateien, die zu diesem Feature gehören (kein `git add -A` auf unrelated WIP-Dateien anderer Agents im selben Checkout).
```

</details>

---

## 11. Synthetic Uptime-Watchdog für externe WMS-/ELWAS-Quellen

**Kategorie:** Zuverlässigkeit/Ops

**Mehrwert:** AquaRevier hängt an mehreren externen Diensten (LANUV-WMS, GD-WMS, ELWAS-WEB als Scraping-Quelle) - fällt einer davon still aus, merkt das aktuell niemand, bis Florian live in einem Meeting eine leere Karte präsentiert. Ein automatischer Health-Check ist der fehlende Frühwarn-Layer für Produktionsstabilität bei Ausfällen Dritter.

**Technischer Ansatz (Kurzfassung):** Geplanter Job pingt alle 6h die WMS-GetCapabilities-Endpoints + ELWAS-Quell-URLs, vergleicht HTTP-Status/Content-Hash gegen eine Baseline, schreibt Status in eine JSON-Datei für ein 'Datenquellen-Status'-Badge im Frontend; bei Fehlschlag automatische Benachrichtigung an Florian/Shubham, bevor der Ausfall live auffällt.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG FÜR ANTIGRAVITY — Synthetic Uptime-Watchdog für externe WMS-/ELWAS-Quellen

Kontext: Repo `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map`, git github.com/Dtunder/adb_aquarevier_map, Branch main. Mehrere Agents (Claude + du) arbeiten parallel am selben Checkout. ZWINGEND vor jedem Schritt: `git pull` (bzw. `git pull --rebase origin main` falls lokale Änderungen). Bei Push-Konflikt NIEMALS force-push — `git pull --rebase origin main` + Retry. Arbeite den kompletten Auftrag eigenständig durch, ohne Rückfrage zwischendurch — der Scope ist unten vollständig spezifiziert.

Problem: AquaRevier lädt live 5 externe WMS-Dienste (alle unter `https://www.wms.nrw.de/...`) und scraped-Daten von ELWAS-WEB (`https://www.elwasweb.nrw.de/`). Fällt einer still aus, merkt es niemand, bis Florian live eine leere/kaputte Karte präsentiert. Baue einen automatischen Health-Check mit Frontend-Badge + Benachrichtigung.

---

## 1. Recon (zuerst ausführen, bevor du irgendetwas änderst)

- `grep -n "wms.nrw.de" index.html` → die 5 WMS-`L.tileLayer.wms(...)`-Definitionen liegen bei Zeile ~1109 (WebAtlasDE Basiskarte), ~1117 (Verwaltungsgrenzen `wms_nw_dvg`), ~1129/~1138/~1147 (Gewässernetz `umwelt/gsk3e`, dreifach mit unterschiedlichen Layer-Parametern), ~1156 (Bergbauberechtigungen `gd/wms_nw_bergbauberechtigungen`), ~1165 (Wasserschutzgebiete `umwelt/wsg`). Lies diesen Block (Zeile 1100–1175) um die exakten Base-URLs zu bestätigen.
- Lies `README.md` Abschnitt "QGIS Integration" (Zeilen 64–89) — dort stehen dieselben 4 WMS-Basis-URLs samt empfohlener Layer-Namen (`nw_dvg_la`/`nw_dvg_k`, `gsk3e_hauptgewaesser_seen`/`_linien`, `nw_bergbauberechtigungen_gewinnend`, `wsg_festgesetzt_gesamt`) nochmal dokumentiert — nutze das als Cross-Check.
- Lies `elwas_toolkit/elwas_client.py` komplett (klein, 229 Zeilen) — das ist das Playwright-Toolkit für ELWAS-WEB-Scrapes. Verstehe `BASE_URL`, `new_browser`, `accept_terms`. **Du sollst dieses Toolkit für den Watchdog NICHT direkt aufrufen** (Begründung unten in Abschnitt 3).
- `grep -n "fetch(" index.html` — zeigt das durchgängige Lade-Pattern: `fetch('datei.geojson').then(res => res.ok ? res.json() : Promise.reject()).then(data => {...})` als eigenständiger `<script>`-Block, relative Pfade, kein Bundler/Framework. Neue Fetches folgen exakt diesem Stil.
- Lies `index.html` Zeilen 830–900 (`sidebar-header`) — dort sitzt links `<h1>Akteure - AquaRevier</h1>` + `<p>`, rechts der `#theme-toggle`-Button (`class="filter-btn"`, rund, 36×36px). Das neue Status-Badge kommt in dieselbe Flex-Row, links vom oder neben dem Theme-Toggle.
- `diff <(grep -n "sidebar-header" -A20 index.html) <(grep -n "sidebar-header" -A20 internal.html)` um zu bestätigen, wie stark `internal.html` an dieser Stelle strukturell identisch ist (laut Vorgabe „meist identisch") — spiegle jede Änderung 1:1, außer wo unten explizit abweichend beschrieben.
- `cat .github/workflows/deploy-secure.yml` und `.github/workflows/static.yml` — beide triggern auf `push` auf `main` (kein bestehender Cron-Job im Repo). Du legst den ersten Cron-Workflow in diesem Repo an.
- `cat .gitignore .surgeignore server.py` (Kopf reicht) — `server.py` served das komplette Verzeichnis generisch statisch, keine Route-Registrierung nötig für neue Dateien. `.surgeignore` schließt u.a. `internal.html`/`contacts.geojson` vom öffentlichen Deploy aus — eine neue `data_status.json` ist NICHT in `.surgeignore`/`.gitignore` gelistet, muss also auch nicht ergänzt werden, damit sie mitdeployed wird.

Betroffene Dateien (neu bzw. geändert):
- **NEU** `check_data_sources.py` (Repo-Root, analog zu bestehenden Root-Skripten wie `deploy_surge.py`) — das Health-Check-Skript.
- **NEU** `data_status.json` (Repo-Root) — wird vom Skript geschrieben, von `index.html`/`internal.html` per `fetch()` gelesen.
- **NEU** `.github/workflows/data-source-watchdog.yml` — Scheduled Cron alle 6h + `workflow_dispatch` für manuelles Testen.
- **GEÄNDERT** `index.html` — CSS für Badge/Popup (in den `<style>`-Block einsortieren, dort wo `.filter-btn`/`.sidebar-header` definiert sind), HTML für das Badge im `sidebar-header`, neuer `fetch('data_status.json')`-Block nach dem bestehenden Muster (an das Ende der vorhandenen Fetch-Kette anhängen, z.B. nach dem `elwas_einleiter.geojson`-Fetch um Zeile ~1555).
- **GEÄNDERT** `internal.html` — dieselbe Badge-Logik gespiegelt, zusätzlich (siehe Abschnitt 2) ein auffälligerer Banner bei Ausfall, weil Florian dieses File tatsächlich nutzt und kein GitHub-Konto hat.
- **OPTIONAL, aber empfohlen** `README.md` — kurzer neuer Abschnitt "Datenquellen-Status" analog zum bestehenden Doku-Stil.
- **NICHT ändern**: `elwas_client.py` bleibt unangetastet, dient nur als Referenz.

---

## 2. UI/UX — GENAU das muss NACH der Umsetzung sichtbar/anders sein

Im `sidebar-header` (beide Karten), in der Zeile neben dem 🌙/☀️-Theme-Toggle-Button, erscheint ein neues kleines Pill-Badge:
- Grüner Punkt + Text „Datenquellen: OK" wenn `data_status.json.overall == "ok"`.
- Gelber Punkt + „Datenquellen: eingeschränkt" bei `"degraded"`.
- Roter Punkt + „Datenquellen: Ausfall" bei `"down"`.
- Grauer Punkt + „Status unbekannt" falls `data_status.json` (noch) nicht existiert oder der Fetch fehlschlägt (z.B. vor dem allerersten Cron-Lauf) — die Karte darf dadurch NICHT kaputtgehen, das ist nur ein zusätzliches Badge, kein Blocker fürs Kartenladen.

Klick auf das Badge öffnet ein kleines Popup/Dropdown direkt darunter (schließt bei Klick außerhalb, analog zu bestehenden Popup-Mustern falls vorhanden, sonst simples `display:none`-Toggle-Div) mit einer Liste aller geprüften Quellen: Name, Status-Icon, „zuletzt geprüft: vor X Std." (relative Zeit aus `checked_at` berechnet, nicht der rohe ISO-String), und bei degraded/down zusätzlich der `message`-Text (z.B. „HTTP 503" oder „Timeout nach 15s" oder „Erwarteter Marker fehlt").

Konkreter Klickpfad zum Verifizieren:
1. https://adb-aquarevier-secure.surge.sh öffnen.
2. Oben im Sidebar-Header, neben dem Theme-Toggle, ist ein grüner Punkt mit „Datenquellen: OK" sichtbar (sofern alle 6 Quellen ok sind).
3. Auf das Badge klicken → Popup öffnet sich, listet genau 6 Zeilen: Geobasis Verwaltungsgrenzen-WMS, LANUV Gewässernetz-WMS, GD Bergbauberechtigungen-WMS, LANUV Wasserschutzgebiete-WMS, Geobasis WebAtlasDE-WMS, ELWAS-WEB Portal — jede mit grünem Icon + „zuletzt geprüft: vor ca. X Std.".
4. Klick außerhalb des Popups → Popup schließt wieder, Kartenverhalten (Zoom/Pan/Filter) bleibt unbeeinflusst.
5. Fehlerszenario (siehe Testschritte unten): eine Quelle künstlich auf `"down"` setzen → Badge wird rot, Popup zeigt bei genau dieser Zeile ein rotes Icon + den `message`-Text.

Zusätzlich in `internal.html` (NICHT in `index.html`, da Florian kein GitHub-Konto hat und die Issue-Benachrichtigung ihn nicht erreicht): wenn `overall != "ok"`, erscheint zusätzlich zum Badge ein auffälliger, nicht wegklickbarer Banner-Streifen oben über der Karte (z.B. „⚠️ Eine oder mehrere Datenquellen sind aktuell eingeschränkt/down — Details im Badge oben rechts."), damit Florian einen Ausfall auch dann bemerkt, wenn er das Badge selbst übersieht.

---

## 3. Daten-/Prozess-Architektur — kein neuer Scrape, reines Ops-Feature

Das ist ein reines Frontend-/Prozess-Feature, KEIN neuer ELWAS-Datensatz. Es prüft ausschließlich die Erreichbarkeit/Integrität der bereits im Frontend genutzten externen Endpunkte.

Zu prüfende Quellen (6 Stück, alle URLs aus Abschnitt 1 Recon bestätigen):
1. Geobasis NRW Verwaltungsgrenzen — `https://www.wms.nrw.de/geobasis/wms_nw_dvg`
2. LANUV NRW Gewässernetz — `https://www.wms.nrw.de/umwelt/gsk3e`
3. GD NRW Bergbauberechtigungen — `https://www.wms.nrw.de/gd/wms_nw_bergbauberechtigungen`
4. LANUV NRW Wasserschutzgebiete — `https://www.wms.nrw.de/umwelt/wsg`
5. Geobasis WebAtlasDE (Basiskarte) — `https://www.wms.nrw.de/geobasis/wms_nw_webatlasde`
6. ELWAS-WEB Portal — `https://www.elwasweb.nrw.de/`

Für die WMS-Quellen (1–5): Standard-OGC-Request `?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0` an die Basis-URL. `requests.get(url, timeout=15)`. Status = `ok` NUR wenn HTTP 200 UND die Antwort das Root-Tag `<WMS_Capabilities` bzw. `<WMT_MS_Capabilities` enthält (manche WMS-Server liefern bei internen Fehlern trotzdem HTTP 200 mit einer `ServiceException`-XML — reiner Status-Code-Check reicht nicht).

Für ELWAS-WEB (6): **KEIN Playwright, KEIN `elwas_client.py`-Import.** Das Toolkit (`new_browser`, `accept_terms`, `open_dataset`) ist für echte Scrape-Läufe gebaut (Headless-Chromium-Start, ToS-Klick, Formular-Interaktion) und für einen alle-6h-Ping massiv überdimensioniert und fragiler (Playwright-Browser-Install-Overhead + Timing-Flakiness in einem GitHub-Actions-Runner). Stattdessen: einfaches `requests.get(BASE_URL, timeout=15)`, Status = `ok` wenn HTTP 200 und ein erwarteter Text-Marker im HTML vorkommt (z.B. der Cookie-/ToS-Consent-Text „Nutzungsbedingungen" aus `elwas_client.py::accept_terms`, oder der Seitentitel) — das ist ein guter Proxy dafür, ob sich am Seitenaufbau grundlegend etwas geändert hat, das später den echten Scraper brechen würde.

Retry-Logik gegen Flapping: jede Quelle bei Fehlschlag EINMAL nach 5s erneut prüfen, bevor sie als `down` markiert wird (Timeouts/kurze Blips sind bei Landesbehörden-WMS nicht selten — sonst Alarmmüdigkeit).

Content-Hash: NICHT als Pass/Fail-Kriterium verwenden (GetCapabilities-XML kann harmlose Timestamp-/Session-Felder enthalten, die bei jedem Request minimal variieren → Fehlalarm-Risiko). Hash trotzdem im JSON mitführen, aber rein informativ (z.B. Feld `content_hash` + `baseline_hash`, Abweichung wird NICHT automatisch zu `degraded`, sondern höchstens als Zusatzinfo im Popup-`message` angezeigt, falls du das umsetzen willst — Pass/Fail hängt ausschließlich an Erreichbarkeit + Root-Tag/Marker-Vorhandensein).

`data_status.json`-Schema (Skript UND Frontend müssen exakt dieses Schema teilen):
```json
{
  "last_run": "2026-07-17T12:00:00Z",
  "overall": "ok",
  "sources": [
    {
      "id": "wms_borders",
      "name": "Geobasis NRW Verwaltungsgrenzen (WMS)",
      "url": "https://www.wms.nrw.de/geobasis/wms_nw_dvg?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "status": "ok",
      "http_status": 200,
      "response_ms": 340,
      "checked_at": "2026-07-17T12:00:00Z",
      "message": ""
    }
  ]
}
```
`overall` = `"down"` wenn mindestens eine Quelle down ist, sonst `"degraded"` wenn mindestens eine degraded ist, sonst `"ok"`.

`.github/workflows/data-source-watchdog.yml`: `on: schedule: - cron: '0 */6 * * *'` + `workflow_dispatch:`. Braucht `permissions: contents: write` (um `data_status.json` zurückzucommitten) und `permissions: issues: write` (um bei Ausfall ein GitHub Issue zu erstellen/aktualisieren — z.B. Titel `🔴 Datenquellen-Ausfall: <Name>`, per `gh issue create`/`gh issue edit` mit dem automatisch verfügbaren `GITHUB_TOKEN`, KEIN neues Secret nötig). Nach dem Check: `git config user.name "aquarevier-watchdog[bot]"` + passende E-Mail, `git add data_status.json`, commit NUR falls sich der Inhalt geändert hat (sonst kein leerer Commit), dann `git pull --rebase origin main` + `git push` (mit kurzer Retry-Schleife falls ein anderer Agent parallel gepusht hat — NICHT force-pushen). Der Push auf `main` löst automatisch die bestehenden Deploy-Workflows aus (`deploy-secure.yml`/`deploy-dev.yml`/`static.yml` triggern bereits auf `push: branches: [main]`) — dadurch geht ein aktualisiertes Badge automatisch live, ohne dass du daran etwas ändern musst.

---

## 4. Test-/Verifikationspflicht — AUSDRÜCKLICH nicht nur "keine Konsolenfehler"

Referenz-Warnung: bei früheren Antigravity-Änderungen wurde trotz „fertig"-Meldung nur auf JS-Konsolenfehler geprüft — dabei waren am 2026-07-15 Datenfelder (Stauanlagen/Regenbecken) kaputt und am 2026-07-16 kappte ein Sidebar-Refactor die lazy-load Event-Verdrahtung. Beides wäre mit einem echten Spotcheck sofort aufgefallen. Diesmal gilt zwingend:

1. `python check_data_sources.py --once` lokal ausführen. Die erzeugte `data_status.json` ÖFFNEN und die tatsächlichen Werte prüfen — nicht nur, dass die Datei existiert: aktuelle, plausible `checked_at`-Timestamps, echte `http_status`-Codes, `overall` passend zu den Einzelstatus.
2. `python server.py` starten, `http://localhost:8000` UND `http://localhost:8000/internal.html` im echten Browser öffnen (Screenshot z.B. via `take_screenshot.py` als Vorlage). Badge muss sichtbar sein UND die Werte müssen 1:1 mit dem Inhalt der echten `data_status.json` übereinstimmen (Feld für Feld vergleichen, nicht nur "Popup ist nicht leer").
3. Auf das Badge KLICKEN (echte Interaktion, nicht nur visuell prüfen ob es da ist) und bestätigen, dass sich das Popup öffnet und wieder schließt.
4. Fehlerszenario aktiv durchspielen: in einer lokalen Kopie von `data_status.json` eine Quelle manuell auf `"status": "down"` setzen, Seite neu laden, verifizieren dass (a) das Badge korrekt auf Rot springt, (b) die richtige Zeile im Popup den Fehlergrund zeigt, (c) in `internal.html` der Banner erscheint. Erst danach zurücksetzen.
5. `.github/workflows/data-source-watchdog.yml` per `gh workflow run data-source-watchdog.yml` (oder `workflow_dispatch` im UI) manuell einmal anstoßen, mit `gh run watch` / `gh run view --log` den Lauf tatsächlich verfolgen und bestätigen: (a) `data_status.json` wurde committet und gepusht, (b) bei einer absichtlich kurzzeitig kaputten Test-URL wird tatsächlich ein GitHub Issue erzeugt — danach die Test-URL zurücksetzen und den Test-Issue schließen.
6. Nach dem echten Push und Live-Deploy (~1–2 Min warten, `gh run list` für den Deploy-Workflow prüfen): `https://adb-aquarevier-secure.surge.sh` (NICHT nur localhost) im echten Browser öffnen und Badge dort ebenfalls sichtbar + korrekt befüllt verifizieren.

Kein „fertig" ohne: echten Blick auf die gerenderten Werte im Browser, tatsächliches Klicken auf das neue Badge, und mindestens ein durchgespieltes Fehlerszenario.

---

## 5. Commit & Workflow

- Commit-Message im etablierten Conventional-Commit-Stil dieses Repos (siehe `git log --oneline`, z.B. `feat: ...`, `fix: ...`). Vorschlag: `feat: synthetic uptime-watchdog fuer WMS/ELWAS-Datenquellen + Status-Badge`. Falls mehrere sinnvolle Teilschritte entstehen (Skript, Workflow, Frontend), gerne mehrere kleine Commits statt einem riesigen.
- Vor Start: `git pull` (bzw. `--rebase` bei lokalen Änderungen). Bei Push-Konflikt: `git pull --rebase origin main` + Retry, NIE force-push.
- Ablauf komplett autonom, ohne Zwischen-Rückfrage: bauen → lokal testen (Abschnitt 4, Punkte 1–4) → committen → pushen → Live-Deploy abwarten und über GitHub Actions verfolgen (Abschnitt 4, Punkte 5–6) → auf der echten Live-URL verifizieren → erst dann als abgeschlossen melden.
- Abschluss-Meldung kurz und faktenbasiert (Stil wie `EMAIL_AN_FLORIAN.txt`: kein Marketing, konkrete Aussagen) — welche Dateien geändert wurden, dass der Cron-Workflow einmal erfolgreich manuell getriggert und verifiziert wurde, und ein Link/Hinweis wo das Badge live zu sehen ist.
```

</details>

---

## 12. Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis

**Kategorie:** Datenqualität

**Mehrwert:** Bei 7 Kreisen und 35 Datensätzen fällt ein stiller Ausfall einer einzelnen ELWAS-Teilquelle (z.B. plötzlich nur 2 statt 40 Grundwassermessstellen) im laufenden Betrieb kaum auf, weil die Karte weiterhin funktioniert - nur mit Lücken. Eine historische Baseline pro Layer/Kreis macht solche stillen Datenverluste sofort sichtbar.

**Technischer Ansatz (Kurzfassung):** Nach jedem Scrape wird die Feature-Anzahl pro Layer und Kreis in eine Zeitreihen-Tabelle geschrieben; ein Schwellwert-Check (Abweichung >30% vom gleitenden Durchschnitt der letzten 5 Läufe) löst eine Warnung aus - trendbasiert über mehrere Läufe, anders als das bereits geplante Pre-/Post-Scrape-Feldvalidierungs-Gate innerhalb eines Laufs.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis

Projekt-Root: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map (git repo, branch main, remote origin = github.com/Dtunder/adb_aquarevier_map). Vor Start: `git pull` (mehrere Agenten arbeiten parallel im selben Checkout). Bei Push-Konflikten: pull/rebase + retry, KEIN force-push.

Kontext/Begründung (für dein Verständnis, nicht Teil der Umsetzung): Bei 7 Kreisen und aktuell 7 ELWAS-Punkt-Layern fällt ein stiller Ausfall einer einzelnen Teilquelle (z.B. plötzlich nur 2 statt 40 Grundwassermessstellen bei einem Kreis) im laufenden Betrieb nicht auf, weil die Karte weiterhin normal funktioniert - nur mit Lücken. Diese Aufgabe baut eine Zeitreihen-Baseline pro Layer+Kreis, die solche Abweichungen bei jedem Scrape/Build-Lauf automatisch erkennt und sichtbar macht. Das ist trendbasiert über mehrere Läufe hinweg - unterscheidet sich bewusst von einem separat geplanten Pre-/Post-Scrape-Feldvalidierungs-Gate, das innerhalb EINES Laufs prüft (z.B. ob Pflichtfelder leer sind). Beide Mechanismen sind unabhängig voneinander, dieser Auftrag betrifft NUR die Zeitreihen-Baseline.

=== 1. SCHRITT-FÜR-SCHRITT-ANLEITUNG ===

1.1 Erst orientieren (grep/lesen, bevor du irgendetwas änderst):
- `grep -n "geojson = {\"type\": \"FeatureCollection\", \"features\": features}"` über alle Dateien in `elwas_raw_data\build_*.py` - das ist in JEDEM der folgenden 7 Scripts die exakte Ziel-Zeile für die spätere Einbindung:
  - `elwas_raw_data\build_geojson.py` → Layer-Key `elwas_einleiter`, Label "Industrieeinleiter", Root-Datei `elwas_einleiter.geojson`
  - `elwas_raw_data\build_klaeranlagen_geojson.py` → `klaeranlagen`, "Kläranlagen", `klaeranlagen.geojson`
  - `elwas_raw_data\build_gwm_geojson.py` → `grundwassermessstellen`, "Grundwassermessstellen", `grundwassermessstellen.geojson`
  - `elwas_raw_data\build_pegel_geojson.py` → `pegel`, "Pegel", `pegel.geojson`
  - `elwas_raw_data\build_stauanlagen_geojson.py` → `stauanlagen`, "Stauanlagen", `stauanlagen.geojson`
  - `elwas_raw_data\build_regenbecken_geojson.py` → `regenbecken`, "Regenbecken/-entlastungsanlagen", `regenbecken.geojson`
  - `elwas_raw_data\build_querbauwerke_geojson.py` → `querbauwerke`, "Querbauwerke", `querbauwerke.geojson`
- WICHTIGE FALLE, die du beachten musst: In `build_geojson.py` werden die Kreis-Namen über ein `DISTRICT_TO_KREIS`-Dict auf Strings wie "Kreis Düren", "Stadt Mönchengladbach", "Städteregion Aachen" gemappt. Die anderen 6 Scripts benutzen dagegen bare Namen wie "Düren", "Mönchengladbach", "Städteregion Aachen" (ohne "Kreis "/"Stadt "-Präfix, siehe deren jeweilige `KREISE = [...]`-Liste). Das heißt: NIEMALS eine einzelne globale Kreis-Namensliste hart codieren und Vollständigkeit dagegen prüfen - stattdessen die Kreis-Gruppen bei jedem Lauf DYNAMISCH aus den tatsächlich vorkommenden `properties.kreis`-Werten der übergebenen Features bilden (z.B. via `collections.Counter`). Fehlender/None-Wert → in die Gruppe `"UNBEKANNT"` einsortieren (nicht verwerfen), aber `"UNBEKANNT"` von der Anomalie-Prüfung ausschließen (nur zur Diagnose mitloggen).

1.2 Neue Datei anlegen: `elwas_raw_data\coverage_tracker.py`
Zweck: gemeinsam genutztes Modul, das sowohl von den 7 build_*.py-Scripts importiert wird als auch eigenständig lauffähig ist. Enthält:

a) Konstanten:
```python
THRESHOLD = 0.30       # 30% Abweichung
MIN_BASELINE = 5        # rolling_avg muss >=5 sein, sonst zu verrauscht/kleine Zahl -> Ausnahme siehe c)
HISTORY_RUNS = 5         # gleitender Durchschnitt der letzten 5 Läufe VOR dem aktuellen
MIN_RUNS_FOR_CHECK = 2   # <2 Vorläufe = nur Baseline aufzeichnen, keine Prüfung möglich
HISTORY_CSV = <project_root>/elwas_raw_data/coverage_history.csv
STATUS_JSON = <project_root>/coverage_status.json   # Projekt-ROOT, nicht elwas_raw_data! (Frontend braucht relativen Fetch-Pfad)
LAYERS = {   # für den Standalone-Modus (1.3)
    "elwas_einleiter": ("Industrieeinleiter", "elwas_einleiter.geojson"),
    "klaeranlagen": ("Kläranlagen", "klaeranlagen.geojson"),
    "grundwassermessstellen": ("Grundwassermessstellen", "grundwassermessstellen.geojson"),
    "pegel": ("Pegel", "pegel.geojson"),
    "stauanlagen": ("Stauanlagen", "stauanlagen.geojson"),
    "regenbecken": ("Regenbecken/-entlastungsanlagen", "regenbecken.geojson"),
    "querbauwerke": ("Querbauwerke", "querbauwerke.geojson"),
}
```

b) `record_and_check(layer_key: str, layer_label: str, features: list) -> list[dict]`:
   - Zeitstempel EINMAL pro Aufruf erzeugen (ISO 8601 UTC, z.B. `datetime.now(timezone.utc).isoformat(timespec="seconds")`), für alle Zeilen dieses Aufrufs wiederverwenden.
   - Zähle Features gruppiert nach `properties.get("kreis") or "UNBEKANNT"` (Counter).
   - Lies `coverage_history.csv` (falls nicht vorhanden: nur Header anlegen, erster Lauf = reine Baseline, keine Prüfung).
   - CSV-Header/Spalten: `timestamp,layer,layer_label,kreis,count`
   - Für jede aktuelle (kreis, count)-Kombination außer "UNBEKANNT":
     - Hole aus der CSV alle vorherigen Zeilen mit gleichem `layer`+`kreis`, sortiert nach Timestamp absteigend, nimm die letzten `HISTORY_RUNS` (=5).
     - Ist `len(prior) < MIN_RUNS_FOR_CHECK` → keine Prüfung, nur aufzeichnen.
     - `rolling_avg = mean(prior_counts)`
     - Sonderfall Totalausfall: wenn `count == 0 and rolling_avg > 0` → IMMER Anomalie, unabhängig von MIN_BASELINE.
     - Sonst: wenn `rolling_avg < MIN_BASELINE` → überspringen (zu kleine Basiszahl, sonst falsche Alarme bei kleinen Kreisen/Layern).
     - Sonst: `deviation = (count - rolling_avg) / rolling_avg`; wenn `abs(deviation) > THRESHOLD` → Anomalie.
     - Anomalie-Eintrag: `{layer, layer_label, kreis, current, rolling_avg (1 Nachkommastelle), deviation_pct (gerundet), runs_compared}`
   - Hänge die aktuellen (kreis, count)-Zeilen IMMER an die CSV an (auch "UNBEKANNT", auch wenn keine Prüfung möglich war) - die Baseline muss weiterwachsen.
   - Schreibe/aktualisiere `coverage_status.json` im Projekt-Root: sammle darin über ALLE Layer die zuletzt gefundenen Anomalien (nicht nur des gerade aufgerufenen Layers überschreiben - bestehende Einträge anderer Layer erhalten bleiben, da die 7 build-Scripts oft an unterschiedlichen Tagen einzeln laufen). Struktur z.B.:
     ```json
     {"last_checked": "<ISO-Timestamp des letzten Aufrufs>",
      "layers_last_run": {"<layer_key>": "<ISO-Timestamp>", ...},
      "anomalies": [ {layer, layer_label, kreis, current, rolling_avg, deviation_pct, detected_at}, ... ]}
     ```
     `anomalies` enthält nur die Anomalien aus dem JEWEILS letzten Lauf jedes Layers (alte Anomalien eines Layers verwerfen, sobald für diesen Layer ein neuer Lauf ohne diese Anomalie durchläuft - sonst bleiben stale Warnungen ewig stehen).
   - Gib die Anomalie-Liste zurück UND drucke sie lesbar auf stdout (klar mit "⚠ ANOMALIE" markiert, damit ein Mensch/Agent es beim Ausführen sofort sieht). Kein Exception werfen, kein Non-Zero-Exit bei Anomalien - das Feature ist advisory/Warnung, kein Deploy-Blocker.

c) `if __name__ == "__main__":` Standalone-Modus: iteriert über `LAYERS`, liest jeweils die Root-Geojson-Datei (falls vorhanden) und ruft `record_and_check` auf. Damit lässt sich das Feature auch ohne einen echten Scrape testen/nachträglich befüllen (siehe Abschnitt 4).

1.3 In jedem der 7 `build_*.py`-Scripts (Liste aus 1.1): Import oben ergänzen (`from coverage_tracker import record_and_check` - funktioniert ohne sys.path-Hack, da die Datei im selben Verzeichnis liegt) und direkt NACH der Zeile `geojson = {"type": "FeatureCollection", "features": features}` einfügen: `record_and_check("<layer_key>", "<Label>", features)` mit den layer_key/Label-Werten aus der Tabelle in 1.1.

1.4 Frontend NUR in `internal.html` (bewusst NICHT in `index.html` - Begründung: das ist ein Betriebs-/Datenqualitätssignal für Florian als Editor, kein Feature für öffentliche Kartenbesucher, die mit einer "Achtung, Daten fehlen"-Meldung nur verunsichert würden). Genaue Umsetzung in Abschnitt 2.

1.5 Am Ende `STATUS_FUER_ANTIGRAVITY.md` um einen neuen Abschnitt "## 10. Coverage-Anomalie-Erkennung (Antigravity, <Datum>)" ergänzen (gleiche Konvention wie Abschnitte 6-9 dort: was umgesetzt, was verifiziert, was noch offen) - das ist der etablierte Handoff-Mechanismus in diesem Projekt.

=== 2. SICHTBARES ERGEBNIS AUF DER WEBSEITE (internal.html) ===

Grep zuerst `id="sidebar"` und `class="filter-block-header"` in `internal.html` (Zeile ~765ff: `<div id="sidebar"><div class="sidebar-header">...</div><div class="sidebar-content">` gefolgt von 3 `.filter-block`-Abschnitten). Neuer Block direkt NACH `sidebar-header`, VOR dem ersten bestehenden `.filter-block`, als eigener `<div class="filter-block" id="coverage-status-block">`, visuell im selben Stil wie die 3 bestehenden Blöcke (gleiche CSS-Klassen wiederverwenden, keine neue Design-Sprache erfinden).

Interaktionsverhalten und Zustände:
- Beim Laden von internal.html: `fetch('coverage_status.json')` (relativer Pfad, `.catch()` absichern - Datei kann beim allerersten Laden nach diesem Feature noch fehlen).
- Fetch schlägt fehl / Datei fehlt (404): Block zeigt neutral-grau "📊 Datenqualität: noch keine Läufe erfasst" - kein Konsolenfehler, keine kaputte Optik.
- Fetch erfolgreich, `anomalies` leer: Block zeigt grün "📊 Datenqualität: ✅ Keine Auffälligkeiten (Stand: <last_checked lesbar formatiert, z.B. 17.07.2026 14:32>)". Nicht klickbar/aufklappbar nötig (oder klickbar mit "keine Auffälligkeiten"-Hinweis beim Aufklappen - beides ok).
- Fetch erfolgreich, `anomalies` nicht leer: Block zeigt orange/rot, klickbar (`cursor:pointer`), z.B. "📊 Datenqualität: ⚠ 2 Auffälligkeiten (Stand: 17.07.2026 14:32)".

Beispiel-Klickpfad (so muss es nach der Umsetzung tatsächlich funktionieren):
1. Florian öffnet https://adb-aquarevier-secure.surge.sh/internal.html (oder lokal via `python server.py`).
2. Direkt unter dem Sidebar-Header sieht er den neuen Block, z.B. orange: "📊 Datenqualität: ⚠ 2 Auffälligkeiten (Stand: 17.07.2026 14:32)".
3. Er klickt auf den Block.
4. Darunter klappt eine Liste (`<ul>`) auf, ein `<li>` pro Anomalie, z.B.: "Querbauwerke – Düren: 12 (Ø letzte 5 Läufe: 70.4, -83%)" und "Grundwassermessstellen – Heinsberg: 3 (Ø letzte 5 Läufe: 41.2, -93%)".
5. Erneuter Klick auf den Block → Liste klappt wieder zu.
6. Die Kartenlayer selbst (stauanlagenLayer, regenbeckenLayer etc.) bleiben unverändert - dieses Feature ändert NICHTS an der Kartenfunktionalität, nur an der Sidebar.

=== 3. DATENQUELLE ===

Kein neuer ELWAS-Scrape, keine externe Quelle (LANUV/IT.NRW) nötig. Reines Backend-Prozess- + Frontend-Feature auf Basis bereits vorhandener Daten: alle 7 relevanten `*.geojson`-Dateien im Projekt-Root haben pro Feature bereits eine `properties.kreis`-Angabe (siehe 1.1) - die wird nur noch mitgezählt und historisiert, nicht neu erhoben. `elwas_toolkit/elwas_client.py` (Playwright-Toolkit) wird für DIESEN Auftrag nicht gebraucht, nur bei zukünftigen neuen Datensätzen relevant. Zum Testen/Befüllen der Historie kannst und sollst du die bestehenden `build_*.py`-Scripts gegen die bereits lokal vorhandenen Rohdaten (`elwas_raw_data\*.json`) erneut laufen lassen - die lesen lokale Dateien, kein Playwright/Live-Website-Zugriff nötig.

=== 4. TEST-/VERIFIKATIONSSCHRITTE (PFLICHT, nicht überspringen) ===

Bei früheren Antigravity-Änderungen an diesem Projekt waren sowohl Datenfelder (Stauanlagen/Regenbecken/Querbauwerke, 2026-07-15: Felder wie "betreiber" enthielten wörtlich "Absperrbauwerk" oder "stationierungskarte" statt echter Werte) als auch UI-Event-Verdrahtung (Sidebar-Refactor kappte lazy-load Events, 2026-07-16) trotz "fertig, 0 Konsolenfehler"-Meldung tatsächlich kaputt. "Keine Konsolenfehler" ist deshalb HIER AUSDRÜCKLICH NICHT AUSREICHEND. Folgende Schritte sind Pflicht, mit echten beobachteten Werten (nicht nur "Skript lief durch"):

4.1 Logik-Test OHNE die echten Produktions-Geojsons anzufassen (damit `coverage_history.csv` nicht mit Test-Müll verfälscht wird): Schreibe ein Wegwerf-Testscript, das `record_and_check()` mit einem erfundenen `layer_key="test_layer"` und synthetischen Feature-Listen mehrfach hintereinander aufruft, z.B. Kreis "TestKreis" mit Counts [40, 42, 38, 41, 39, 12] über 6 Aufrufe. Beweise am tatsächlichen Rückgabewert/stdout-Output: Aufrufe 2-5 lösen KEINE Anomalie aus (zu wenig Historie bzw. innerhalb 30%), Aufruf 6 (12 vs. Ø~40) LÖST eine Anomalie aus mit plausibler `deviation_pct` (~-70%). Prüfe auch den Totalausfall-Sonderfall (Count 0 nach normaler Historie) und den `MIN_BASELINE`-Fall (z.B. Historie 2,2,3,2,2 → aktuell 1: KEINE Anomalie, weil rolling_avg < 5). Danach alle `"test_layer"`-Zeilen wieder aus `coverage_history.csv` entfernen und `coverage_status.json` von Test-Einträgen bereinigen, bevor committed wird.

4.2 Mindestens EINEN echten Lauf gegen echte Daten: führe z.B. `python elwas_raw_data\build_stauanlagen_geojson.py` (nutzt lokale `stauanlagen.json`, kein Live-Scrape) tatsächlich aus und bestätige im Terminal-Output, dass `record_and_check` aufgerufen wurde und (beim ersten echten Lauf) "Baseline aufgezeichnet, noch keine Vorläufe" meldet. Öffne danach `coverage_history.csv` und `coverage_status.json` und prüfe mit eigenen Augen, dass dort plausible echte Zahlen stehen (Summe der Kreis-Counts = Gesamtzahl der Features in `stauanlagen.geojson`, nicht z.B. 0 oder alles in "UNBEKANNT").

4.3 Frontend-Spotcheck (nicht nur "keine Exception"): Starte `python server.py` lokal, öffne `internal.html` im Browser (oder per Playwright-Screenshot), prüfe im Netzwerk-Tab/Response, dass `coverage_status.json` mit Status 200 geladen wird, mache einen Screenshot des neuen Blocks, und gleiche die dort ANGEZEIGTEN TEXTWERTE (nicht nur "Element ist sichtbar") mit dem tatsächlichen Inhalt von `coverage_status.json` ab. Klicke den Block an und prüfe, dass die aufklappende Liste echten, korrekt formatierten Text zeigt (kein `undefined`, kein `[object Object]`, keine leere Liste trotz vorhandener Anomalien-Daten). Nach dem Push zusätzlich live auf https://adb-aquarevier-secure.surge.sh/internal.html denselben Spotcheck wiederholen.

4.4 Bestätige, dass `index.html` UNVERÄNDERT bleibt (Diff prüfen) - dieses Feature ist bewusst internal-only (siehe 1.4/2).

=== 5. COMMIT-KONVENTION & WORKFLOW ===

Etablierter Workflow in diesem Projekt: build/ändern → lokal testen (Abschnitt 4) → committen → pushen auf `main` → live verifizieren. Arbeite dabei autonom ohne Rückfrage bei jedem Einzelschritt, sobald der Scope (dieser Prompt) klar ist - keine Zwischen-Bestätigung beim User einholen.

Commit-Message-Stil wie in der bestehenden Historie (`git log --oneline`, z.B. "feat: ...", "fix: ..."), kurzer deutscher Titel + optional Body mit Details. Vorschlag für den Haupt-Commit:
`feat: Coverage-Anomalie-Erkennung ueber Record-Counts pro Layer/Kreis (Zeitreihen-Baseline)`
Body kurz stichpunktartig: neue `coverage_tracker.py`, Einbindung in 7 build-Scripts, neuer Sidebar-Block in internal.html, Verifikation durchgeführt (echte Werte, nicht nur "keine Fehler").

Vor dem allerersten Commit: `git pull` erneut (falls in der Zwischenzeit ein anderer Agent gepusht hat) → bei Konflikt: rebase + retry, kein `--force`. `coverage_history.csv` und `coverage_status.json` gehören ins Repo (git add, NICHT in .gitignore/.surgeignore aufnehmen - beide Dateien fehlen dort aktuell und sollen es auch bleiben, da `internal.html` sie live per fetch laden muss und `internal.html` in BEIDEN GitHub-Actions-Workflows (`deploy-dev.yml`, `deploy-secure.yml`) per `sed -i '/internal.html/d' .surgeignore` vor dem Surge-Deploy wieder eingeschlossen wird - internal.html landet also tatsächlich live unter /internal.html auf beiden Surge-Zielen). Nach Push: Deployment abwarten (GitHub Actions), dann Abschnitt 4.3 live wiederholen, dann `STATUS_FUER_ANTIGRAVITY.md`-Abschnitt final committen/pushen (kann im selben oder einem zweiten Commit erfolgen).
```

</details>

---

## 13. Rollenbasiertes Onboarding mit Kontext-Tour (ERLEDIGT)

**Kategorie:** UX/Onboarding

**Mehrwert:** Neue Nutzer (Gemeinderat, Bürger, Industrie-Kontakt) landen ohne Vorwissen auf einer komplexen Karte mit 35+ Datenquellen und wissen nicht, wo sie anfangen sollen - das kostet Florian Erklärzeit bei jeder neuen Person. Kein Duplikat des Präsentations-/Beamer-Modus: dort führt Florian live ein Publikum, hier führt sich ein einzelner Erstnutzer selbstständig durch UI-Bedienelemente.

**Technischer Ansatz (Kurzfassung):** Beim ersten Besuch (kein localStorage-Flag) leichtgewichtiges Coachmark-Overlay über Suchleiste, Filter-Sidebar, Layer-Toggle mit Next/Skip; vorgeschaltete 1-Klick-Rollenwahl (Politik/Gemeinde/Industrie/Bürger) aktiviert vordefinierte Filter-Presets.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG FÜR ANTIGRAVITY: Rollenbasiertes Onboarding mit Kontext-Tour (AquaRevier Akteurskarte)

═══════════════════════════════════════════
0. KONTEXT & ARBEITSMODUS (verbindlich)
═══════════════════════════════════════════
Repo-Root: C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\
Git: github.com/Dtunder/adb_aquarevier_map, Branch main. Push auf origin/main deployt automatisch via GitHub Actions auf https://adb-aquarevier-secure.surge.sh (index.html = öffentliche Karte).
Mehrere KI-Agenten arbeiten parallel im selben Checkout. VOR Arbeitsbeginn: `git pull` (bzw. `git pull --rebase`). Bei Push-Konflikt: pull/rebase + Retry, NIEMALS `git push --force`.
Arbeite eigenständig durch build → lokal testen → committen → pushen → live verifizieren, ohne bei jedem Zwischenschritt nachzufragen — der Scope ist mit diesem Prompt vollständig definiert.

═══════════════════════════════════════════
1. WAS DU VORAB VERIFIZIEREN MUSST (grep, nicht raten)
═══════════════════════════════════════════
Zeilennummern verschieben sich zwischen Commits — IMMER frisch grep'en, nicht auf untenstehende Zahlen verlassen (sie sind Stand heute als Orientierung, keine Garantie).

```
grep -n "let activeFilters\|let elwasActiveBranchen\|const overlayMaps\|function renderMapAndSidebar\|function renderElwasLayer\|function updateButtonVisualStates\|function updateSidebarCounters" index.html
grep -n "filter-btn\[data-group\]\|filter-btn\[data-branche\]\|filter-btn\[data-layer-name\]" index.html
grep -n "map.on('overlayadd'" index.html
grep -n "</style>\|</body>\|id=\"theme-toggle\"\|id=\"reset-filters-btn\"\|unified-search-control" index.html
```

Betroffene Datei: NUR `index.html` (öffentliche Karte). `internal.html` ist Florians Editor-Werkzeug für einen erfahrenen Poweruser — der bekommt KEIN Onboarding, dort NICHTS ändern. index.html und internal.html sind zwei komplett unabhängige, in sich geschlossene HTML-Dateien ohne gemeinsame `<script src="...">`-Datei (nur CDN-Includes für Leaflet/jsPDF/html2canvas) — ein Edit in index.html kann internal.html technisch nicht brechen, trotzdem am Ende per `git diff --stat` verifizieren, dass wirklich nur index.html verändert wurde. `elwas_raw_data/*.py`, `elwas_toolkit/elwas_client.py` sind für dieses Feature NICHT relevant (siehe Punkt 3).

Bereits vorhandene Bausteine, die du WIEDERVERWENDEN musst (nicht neu erfinden):
- Drei Filter-Blöcke in der Sidebar (`#sidebar` → `.sidebar-content`): Block 1 "👥 Regionale Akteure" mit `.filter-btn[data-group]` (Werte exakt: `Behörde`, `Forschung`, `Gebietskörperschaft`, `Gewerbe/ Industrie`, `Landwirtschaft`, `Netzwerk/ Multiplikator`, `Ver-/ Entsorger`, `Sonstige`), Block 2 "🏭 Industrie-Branchen" mit `.filter-btn[data-branche]` (`Papierindustrie`, `Textilindustrie`, `Chemieindustrie`, `Metallindustrie`, `Lebensmittelindustrie`), Block 3 "🗺️ Fachdaten & Layer" mit `.filter-btn[data-layer-name]` (exakte Attributwerte inkl. Emoji, siehe Punkt 2).
- State-Variablen: `let activeFilters = new Set(...)` (Gruppen, Default = alle aktiv), `let elwasActiveBranchen = new Set(...)` (Branchen, Default = alle aktiv), `const overlayMaps = {...}` (Objekt: exakter `data-layer-name`-String → Leaflet-Layer-Objekt).
- Render-Funktionen, die nach jeder Preset-Änderung aufgerufen werden müssen: `updateButtonVisualStates()` (setzt `.active`/`.inactive` Klassen anhand der Sets/`map.hasLayer()`), `renderMapAndSidebar()` (Akteure), `renderElwasLayer()` (Branchen-Layer), `updateSidebarCounters()` (Live-Zähler-Badges).
- Zusätzlicher Suchbereich oben links auf der Karte: Leaflet-Control `.unified-search-control` mit `#usearch-input` ("🔍 Alles durchsuchen …") — das ist die prominenteste Suchleiste und dein primäres Coachmark-Ziel für "Suche", NICHT nur das kleinere `#search-input` in der Sidebar (das filtert nur die Kontaktliste).
- `#reset-filters-btn` (setzt Filter zurück), `#theme-toggle` (Dark/Light).
- KRITISCHE FALLE (Ursache des 2026-07-16-Bugs): Einige Layer laden ihre Daten NICHT beim Seitenaufbau, sondern erst lazy per `map.on('overlayadd', function(e) { if (e.layer === X) loadX(); })` — betrifft u.a. `gwmLayer` (Grundwassermessstellen), `gewFlaecheLayer`, `gewKanalLayer`. Der bestehende Klick-Handler auf `.filter-btn[data-layer-name]` ruft deshalb NICHT nur `map.addLayer(layer)` auf, sondern zusätzlich manuell `map.fire('overlayadd', { layer: layer, name: name })` — nur das triggert den lazy Load. Wenn dein Preset-Code Layer programmatisch aktiviert, MUSST du exakt dasselbe Muster (`map.addLayer` + `map.fire('overlayadd', {layer, name})`) verwenden, sonst wird der Layer als "aktiv" angezeigt, bleibt aber leer — exakt der Bug-Typ vom 16.07.

═══════════════════════════════════════════
2. IMPLEMENTIERUNG — SCHRITT FÜR SCHRITT
═══════════════════════════════════════════

A) Rollen-Presets (4 Rollen, exakte Werte — nicht neu aushandeln, direkt so umsetzen):

Rolle "Politik / Gemeinderat":
- Gruppen AN: Behörde, Gebietskörperschaft, Netzwerk/ Multiplikator — AUS: Forschung, Gewerbe/ Industrie, Landwirtschaft, Ver-/ Entsorger, Sonstige
- Branchen: alle AUS
- Layer AN: "Landkreisgrenzen (Rheinisches Revier)", "Kreisgrenzen (Schwarz gestrichelt)", "🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser)" — Rest AUS

Rolle "Gemeinde / Verwaltung":
- Gruppen AN: Gebietskörperschaft, Behörde, Ver-/ Entsorger — AUS: Forschung, Gewerbe/ Industrie, Landwirtschaft, Netzwerk/ Multiplikator, Sonstige
- Branchen: alle AUS
- Layer AN: "💧 Grundwassermessstellen (ELWAS, 3700+)", "⛰️ Stauanlagen (ELWAS)", "🌧️ Regenbecken/-entlastungsanlagen (ELWAS)", "📏 Pegel (ELWAS)", "Kreisgrenzen (Schwarz gestrichelt)" — Rest AUS

Rolle "Industrie / Gewerbe":
- Gruppen AN: Gewerbe/ Industrie, Ver-/ Entsorger, Behörde — AUS: Forschung, Gebietskörperschaft, Landwirtschaft, Netzwerk/ Multiplikator, Sonstige
- Branchen: ALLE AN (Papierindustrie, Textilindustrie, Chemieindustrie, Metallindustrie, Lebensmittelindustrie)
- Layer AN: "Wasserschutzgebiete (LANUV)", "🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser)", "🧱 Querbauwerke (ELWAS)" — Rest AUS

Rolle "Bürger / Öffentlichkeit":
- Gruppen AN: Behörde, Gebietskörperschaft, Netzwerk/ Multiplikator, Ver-/ Entsorger — AUS: Forschung, Gewerbe/ Industrie, Landwirtschaft, Sonstige
- Branchen: alle AUS
- Layer AN: "Eigene Gewässer mit Namen", "Wasserschutzgebiete (LANUV)", "Landkreisgrenzen (Rheinisches Revier)" — Rest AUS

Implementiere eine Funktion `applyRolePreset(role)`, die:
1. `activeFilters` und `elwasActiveBranchen` direkt anhand der obigen Listen neu befüllt (Set leeren, gewünschte Werte adden).
2. für JEDEN `.filter-btn[data-layer-name]`-Button im DOM den exakten `data-layer-name`-Attributwert liest, gegen die "Layer AN"-Liste der Rolle prüft (exaktes String-Match, KEIN `.includes()` — Verwechslungsgefahr z.B. "Kreisgrenzen" vs. "Landkreisgrenzen"), und NUR bei tatsächlicher Zustandsänderung `map.addLayer`+`map.fire('overlayadd',...)` bzw. `map.removeLayer`+`map.fire('overlayremove',...)` aufruft (State vorher mit `map.hasLayer(overlayMaps[name])` prüfen, um keine Layer doppelt zu (de)aktivieren).
3. danach EINMAL `updateButtonVisualStates()`, `renderMapAndSidebar()`, `renderElwasLayer()`, `updateSidebarCounters()` aufruft (in dieser Reihenfolge, analog zu den bestehenden Quick-Action-Handlern `btn-actors-all` etc.).

B) Rollen-Auswahl-Modal (vorgeschaltet, blockierend):
- Neues `<div id="onboarding-role-modal">` mit abgedunkeltem Hintergrund (`position:fixed; inset:0; z-index:10001`) und einer zentrierten Karte im bestehenden Glassmorphism-Look (wiederverwende CSS-Variablen `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`, `var(--accent-primary)` — dann funktioniert Dark/Light automatisch mit, kein neues Farbschema erfinden).
- Titel z.B. "Willkommen bei der AquaRevier-Akteurskarte" + Subtext "Wähle deine Rolle, damit wir dir die Karte passend vorfiltern" + 4 große klickbare Rollen-Karten (Politik/Gemeinderat, Gemeinde/Verwaltung, Industrie/Gewerbe, Bürger/Öffentlichkeit), je mit Icon/Emoji + 1-Zeiler-Beschreibung.
- Zusätzlich EIN unauffälliger Link/Button "Überspringen, ich kenne mich aus" unten (schließt Modal ohne Preset-Änderung, aktiviert aber trotzdem die Coachmark-Tour NICHT — Skip heißt wirklich skip, kein Preset UND keine Tour).
- Klick auf eine Rollenkarte: `applyRolePreset(role)` aufrufen, Modal schließen, Coachmark-Tour starten (siehe C).

C) Coachmark-Tour (leichtgewichtig, max. 4 Schritte, NICHT der Beamer-/Präsentationsmodus — es gibt aktuell keinen solchen Modus im Code, aber falls du im Zuge dessen darauf stößt: das hier ist explizit ein selbstgeführter Einzelnutzer-Flow, kein von Florian live vorgeführter Publikumsmodus, also keine Auto-Play-Timer, keine Fernsteuerung):
Schritt 1 → Ziel `.unified-search-control` (oben links): "Hier durchsuchst du alle 35+ Datenquellen auf einmal — Akteure, Gewässer, Gemeinden, Anlagen."
Schritt 2 → Ziel erster `.filter-group` in Block "👥 Regionale Akteure": "Über diese Buttons blendest du Akteursgruppen ein oder aus. Deine Rollenwahl hat hier schon vorgefiltert."
Schritt 3 → Ziel `.filter-group` in Block "🗺️ Fachdaten & Layer": "Hier aktivierst du amtliche Fachdaten wie Pegel, Grundwassermessstellen oder Wasserschutzgebiete."
Schritt 4 → Ziel `#reset-filters-btn`: "Verirrst du dich? Ein Klick setzt alle Filter zurück auf die Vollansicht."
Technik: Ein `<div id="coachmark-overlay">` mit (a) einem "Spotlight"-Highlight-Rahmen, der per `getBoundingClientRect()` des Zielelements positioniert wird (`position:fixed; box-shadow:0 0 0 9999px rgba(0,0,0,.6); border:2px solid var(--accent-primary); border-radius:12px; pointer-events:none; transition:all .25s ease;`) und (b) einer kleinen Tooltip-Karte daneben mit Titel, Text, Fortschrittsanzeige ("Schritt 2 von 4"), Buttons "Zurück" (deaktiviert bei Schritt 1), "Weiter" (wird bei Schritt 4 zu "Fertig"), "Tour überspringen" (schließt sofort, überall verfügbar). Bei Fensterresize die Highlight-Position neu berechnen (`window.addEventListener('resize', ...)`), sonst hängt der Rahmen an alter Position.
Am Ende der Tour (Fertig ODER Skip an beliebiger Stelle): `localStorage.setItem('aquarevier_onboarding_completed_v1', '1')`.

D) Erneutes Aufrufen (Testbarkeit + echter Nutzen, nicht nur für Erstbesuch):
Kleiner permanenter Button neben `#theme-toggle` (gleicher Stil, z.B. 🎓-Icon, `title="Tour erneut starten"`), der beim Klick jederzeit wieder das Rollen-Modal öffnet — OHNE den localStorage-Flag zu löschen (Flag bleibt gesetzt, das ist nur ein manueller Re-Trigger).

E) Einstiegslogik:
Beim Laden (nach der bestehenden `setTimeout(..., 100)`-Initialisierung, NICHT davor, da `overlayMaps`/`groupColors` erst dort final aufgebaut sind): `if (!localStorage.getItem('aquarevier_onboarding_completed_v1')) { showRoleModal(); }`.

═══════════════════════════════════════════
3. NEUE DATEN NÖTIG? NEIN.
═══════════════════════════════════════════
Reines Frontend-/UI-Feature. Es werden ausschließlich bereits vorhandene Datenquellen, Layer und Filterzustände orchestriert (siehe `overlayMaps`, `activeFilters`, `elwasActiveBranchen` — alle Daten sind längst über bestehende `.geojson`-Dateien und ELWAS-Scrapes geladen). KEIN neuer ELWAS-Scrape, KEIN Aufruf von `elwas_client.py`, KEINE Änderung an `elwas_raw_data/*.py` oder `elwas_toolkit/*`. Falls du bei der Umsetzung merkst, dass eine der 4 Rollen fachlich eine Datenquelle bräuchte, die es noch nicht gibt (z.B. LANUV/IT.NRW) — NICHT eigenmächtig scrapen, sondern stattdessen einen bestehenden, thematisch nächstliegenden Layer aus der obigen Preset-Liste nehmen und das als TODO in den Commit-Body schreiben.

═══════════════════════════════════════════
4. SICHTBARES ERGEBNIS NACH UMSETZUNG (konkreter Klickpfad)
═══════════════════════════════════════════
Beispiel-Spotcheck als Nutzer:
1. Browser im Inkognito-/frischen Profil öffnet https://adb-aquarevier-secure.surge.sh/ (oder lokal `index.html`) zum allerersten Mal.
2. SOFORT erscheint ein abgedunkeltes Overlay mit einer zentrierten Karte "Willkommen bei der AquaRevier-Akteurskarte" und 4 anklickbaren Rollen-Kacheln (Politik/Gemeinderat, Gemeinde/Verwaltung, Industrie/Gewerbe, Bürger/Öffentlichkeit) + "Überspringen"-Link. Karte im Hintergrund ist noch unbedienbar (durch Overlay blockiert).
3. Nutzer klickt "Industrie / Gewerbe". Modal verschwindet sofort. In der Sidebar sind jetzt sichtbar NUR noch die Buttons "Gewerbe/ Industrie", "Ver-/ Entsorger", "Behörde" farbig/aktiv (Rest sichtbar abgedunkelt/inaktiv), alle 5 Industrie-Branchen-Buttons aktiv, im Block "Fachdaten & Layer" sind "Wasserschutzgebiete", "Einzugsgebiet-Statistik" und "Querbauwerke" aktiv — die Karte zeigt entsprechend weniger, thematisch passende Marker/Layer als vorher (Kontakt-Zähler unten links ("X von Y Kontakten angezeigt") ist jetzt kleiner als die Gesamtzahl).
4. Direkt danach startet automatisch die Coachmark-Tour: ein hell umrandeter Ausschnitt legt sich über die Suchleiste oben links ("🔍 Alles durchsuchen"), daneben eine Tooltip-Karte "Schritt 1 von 4" mit Erklärtext und Buttons "Weiter"/"Tour überspringen". Klick auf "Weiter" bewegt den Spotlight-Rahmen sichtbar (mit kurzer Animation) zum ersten Filter-Block, dann zum Fachdaten-Block, dann zum Reset-Button. Bei Schritt 4 heißt der Button "Fertig" statt "Weiter".
5. Nach "Fertig" ist die Tour weg, die Karte voll bedienbar, und neben dem Dark/Light-Toggle-Button ist jetzt dauerhaft ein kleiner 🎓-Button sichtbar.
6. Browser-Reload (gleiches Profil): Kein Modal mehr, Karte lädt direkt normal (mit den zuletzt gesetzten Filtern, wie bisher üblich — Onboarding-Flag verhindert nur das erneute Modal, ändert nichts an der sonstigen Filterpersistenz-Logik).
7. Klick auf den 🎓-Button: Rollen-Modal öffnet sich erneut, jederzeit wiederholbar.

═══════════════════════════════════════════
5. TEST-/VERIFIKATIONSPFLICHT (nicht nur "keine Konsolenfehler")
═══════════════════════════════════════════
Referenz-Vorfälle, die sich NICHT wiederholen dürfen: 2026-07-15 waren Datenfelder (Stauanlagen/Regenbecken) trotz "fertig"-Meldung kaputt, 2026-07-16 hat ein Sidebar-Refactor lazy-load Events gekappt — beides wurde jeweils nur mit "keine JS-Fehler in der Konsole" für erledigt erklärt und war es nicht. Deshalb ist hier PFLICHT, zusätzlich zu Konsolenfehlern die tatsächlichen Datenwerte zu prüfen:

Baue (analog zu vorhandenem `test_live_errors.py`/`take_screenshot.py`-Muster, gleiches Verzeichnis, Playwright sync API) ein Skript, das für JEDE der 4 Rollen automatisiert:
a) mit frischem Browser-Context (localStorage geleert) startet, das Modal öffnet, die Rollen-Kachel klickt.
b) per `page.evaluate` NACH dem Klick prüft: welche `.filter-btn[data-group]`/`[data-branche]`/`[data-layer-name]` die Klasse `active` tragen — muss exakt der Preset-Liste aus Punkt 2A entsprechen (nicht "ungefähr richtig", vollständiger Soll-Ist-Vergleich der Attributwerte).
c) FÜR DIE ROLLE "Gemeinde / Verwaltung" explizit prüft, dass der lazy-geladene Grundwassermessstellen-Layer nach Aktivierung tatsächlich Daten enthält, nicht nur als "aktiv" markiert ist — z.B. `page.evaluate(() => window.gwmLayer && window.gwmLayer.getLayers().length > 0)` (ggf. `gwmLayer` vorher bewusst auf `window` hängen, falls es aktuell nur eine lokale Variable im Closure ist, damit der Test von außen zugreifen kann) ODER per DOM-Check auf tatsächlich gerenderte Marker-/Cluster-Icons warten (`page.wait_for_selector`) statt nur `map.hasLayer()` zu prüfen — genau das ist die Prüfung, die den 2026-07-16-Bug erkannt hätte.
d) die Zähler-Badges (`.counter-badge`) der aktivierten Layer/Gruppen prüft — müssen von "(0/0)" abweichen bzw. sinnvolle Zahlen zeigen (echter Daten-Spotcheck, kein reiner Vorhandenseins-Check).
e) die Coachmark-Tour durchklickt (alle 4 Schritte "Weiter", dann "Fertig") und danach per Reload verifiziert, dass das Modal nicht erneut erscheint.
f) den 🎓-Replay-Button testet: erneuter Klick öffnet das Modal wieder.
g) Konsolenfehler UND `pageerror`-Events mitloggt (wie in `test_live_errors.py`) — als zusätzliche, nicht alleinige Prüfung.
h) `internal.html` separat lädt und verifiziert, dass dort weiterhin KEIN Onboarding-Modal erscheint und die bestehenden Sidebar-Filter-Klicks (`data-group` Buttons) unverändert funktionieren (Regressionsschutz für die andere Datei, auch wenn technisch unabhängig).
i) einen mobilen Viewport (z.B. 375×667) testet: Modal und Coachmark-Tooltip dürfen nicht abgeschnitten/unbedienbar sein.

Lokal ausführen, ALLE Checks müssen grün sein, BEVOR committet wird. Nach dem Push zusätzlich dieselben Kern-Checks (mind. b, c, d, e) gegen die echte Live-URL https://adb-aquarevier-secure.surge.sh/ wiederholen (nicht nur lokal) — erst dann gilt der Task als fertig.

═══════════════════════════════════════════
6. COMMIT & WORKFLOW
═══════════════════════════════════════════
Commit-Message-Stil wie bestehende Historie (`git log --oneline`), Conventional-Commits-Präfix + deutscher Beschreibungstext, z.B.:
`feat: rollenbasiertes Onboarding mit Kontext-Tour (Rollen-Presets Politik/Gemeinde/Industrie/Buerger + Coachmarks)`
Bei Bedarf zweiter Fix-Commit, falls der Spotcheck aus Punkt 5 Nacharbeit ergibt, z.B.:
`fix: Onboarding-Coachmark Positionierung + lazy-load Event fuer Grundwassermessstellen-Preset`
Ablauf: implementieren → lokale Playwright-Spotchecks aus Punkt 5 (a–i) grün → `git add index.html <neues Testskript>` (gezielt, nicht `git add -A`, andere unversionierte Dateien im Verzeichnis wie `get_dom.py`/`take_screenshot.py`/`test_live_errors.py` unangetastet lassen bzw. nur mit aufnehmen falls du sie selbst neu anlegst) → committen → `git pull --rebase` erneut vor dem Push (Parallelagenten!) → `git push origin main` → GitHub Actions abwarten → Live-Spotcheck gegen surge.sh laut Punkt 5 letzter Absatz → kurze Ergebniszusammenfassung (was umgesetzt, was getestet, Live-URL-Status) als Abschlussmeldung, keine Rückfrage nötig, wenn alle Checks grün sind.
```

</details>

---

## 14. Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung)

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Die Querbauwerk-Rohdaten existieren bereits (Scraper-Vorfall vom 15.07.), wurden bisher aber nur als reine Struktur-Daten gedacht. Eine Durchgängigkeits-Bewertung (passierbar/teilweise/Barriere) ist eine fachlich eigenständige Auswertungsebene derselben Rohdaten, relevant für Vernetzungs- und Renaturierungs-Diskussionen im Strukturwandel-Fördergebiet.

**Technischer Ansatz (Kurzfassung):** Nach Fix der Querbauwerk-Scraper-Daten: Durchgängigkeitsklasse (ELWAS/LANUV-Bewertung) als zusätzliches Icon-Attribut statt reiner Bauwerks-Marker, Kartenfilter 'nur Wanderhindernisse' für Renaturierungspriorisierung.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
## Auftrag: Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung)

**Repo:** `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map` — GitHub `Dtunder/adb_aquarevier_map`, Branch `main`. Push auf `origin/main` deployt automatisch via GitHub Actions → Surge.sh auf https://adb-aquarevier-secure.surge.sh (`index.html` = öffentliche Karte, `internal.html` = Florians Editor-Tool, strukturell fast identisch).

**Wichtig — Parallelbetrieb:** Andere Agenten (Claude, ggf. du selbst in einer anderen Session) arbeiten am selben Checkout. **Vor Arbeitsbeginn:** `git pull --rebase origin main`. Bei Push-Konflikten: `git pull --rebase origin main`, Konflikte lösen, erneut versuchen — **niemals** `git push --force`.

Arbeite den kompletten Auftrag **autonom** ab, ohne bei jedem Einzelschritt nachzufragen — der Scope ist mit diesem Prompt vollständig definiert. Nur bei echten fachlichen Sackgassen (z. B. keine brauchbare Datenquelle auffindbar) im Abschlussbericht transparent machen, nicht stillschweigend improvisieren.

---

### 0. Ausgangslage (bereits verifiziert, nicht neu recherchieren)

- `elwas_raw_data/querbauwerke.json` enthält 70 Objekte mit Feldern `name`, `kreis`, `utm_east`, `utm_north`, `betreiber` (immer `null`), `gewaesser`, `typ`. Verteilung von `typ`: Fischaufstieg 40, Bewegliches Wehr 14, Absturz 10, Rampe 2, Gleite 2, Sohlschwelle 1, "Fischaufstieg Gnadenthal" 1 (Sonderfall/Eigenname, kein Bug).
- Die UTF-8-Kodierung dieser Datei ist **korrekt** (mit `open(..., 'rb')` verifiziert — mojibake wie "Städteregion" tritt nur in manchen Terminal-Ausgaben mit falscher Codepage auf, ist **kein** echter Datenfehler. Nicht wieder als Bug behandeln.
- `elwas_raw_data/build_querbauwerke_geojson.py` liest `querbauwerke.json`, transformiert UTM (EPSG:25832) → WGS84, schreibt `elwas_raw_data/querbauwerke.geojson` und kopiert die Datei zusätzlich ins Repo-Root `querbauwerke.geojson` (das ist die Datei, die `index.html`/`internal.html` per `fetch('querbauwerke.geojson')` laden). Property `bauwerksart` wird im Build-Skript zwar vorgesehen, ist aber aktuell immer `null`, weil der Scraper sie nie befüllt — kein Teil dieses Auftrags, nur FYI.
- **Zentraler Befund, der die Datenquellen-Frage entscheidet:** Die ELWAS-Detailseite für Querbauwerke hat laut vorheriger Recon (`elwas_toolkit/dataset_recon_2026-07-15.json`, Eintrag `"name": "Bauwerke (Querbauwerke)"`) **keinen separaten Sub-Tab** für eine Durchgängigkeitsbewertung (`get_detail_tab_options()` lieferte `[]`). Das Such-Formular auf ELWAS exponiert aber ein numerisches Range-Feld **"Absturzhöhe von/bis"** — das deutet stark darauf hin, dass jedes Objekt einen Absturzhöhen-Wert in seinen Stammdaten trägt, den der bestehende Scraper `scrape_querbauwerke.py` bisher **nicht** ausliest (nur `name`, `kreis`, Koordinaten, `betreiber`, `gewaesser`, `typ`).

---

### 1. Datenquelle klären (zuerst, nicht direkt zur Heuristik springen)

**a) Live-Check auf ELWAS (Playwright, elwas_client.py wiederverwenden):**
Öffne 2–3 bekannte Bauwerks-Detailseiten (z. B. über `elwas_toolkit/elwas_client.py`-Funktionen `new_browser`, `open_dataset`, `get_frame`, `fill_regional_search`, `submit_search` — exakt das Navigationsmuster, das `scrape_querbauwerke.py` schon nutzt) und dumpe den vollständigen Stammdaten-Text (Vorbild: `elwas_raw_data/dump_html_around_tabs.py` / `test_inspect_details_page.py`, die es für andere Datensätze schon vorgemacht haben). Prüfe:
- Gibt es im Klartext ein Feld "Absturzhöhe" (oder "Fallhöhe" / ähnlich benannt)?
- Taucht irgendwo ein Feld mit einer offiziellen Durchgängigkeits-/Passierbarkeits-Bewertung auf (z. B. "ökologische Durchgängigkeit", "Durchwanderbarkeit")? Bisher wurde das für dieses Dataset noch nicht vollständig geprüft — das jetzt nachholen, nicht auf den alten Recon-Befund allein verlassen.

**b) Kurze Web-Recherche parallel:** Prüfe, ob LANUV NRW oder Open.NRW / Geoportal NRW einen offiziellen offenen Datensatz "Durchgängigkeit an Querbauwerken" bzw. "Fischdurchgängigkeit" NRW als WFS/Shapefile/CSV bereitstellt, der sich über Bauwerks-ID oder Koordinaten mit den bestehenden 70 ELWAS-Objekten matchen ließe. Falls ja und die Qualität/Abdeckung stimmt: **Plan A** — echte amtliche Klassifikation verwenden, in `build_querbauwerke_geojson.py` als Join-Schritt einbauen (Quelle + Lizenz im Popup/Quellenzeile nennen, analog zum bestehenden "Quelle: ELWAS-WEB..."-Muster).

**c) Wahrscheinlichstes Ergebnis — Plan B (Heuristik), falls (a) ein Absturzhöhen-Feld liefert, aber (b) keine belastbare externe Quelle:**
Klassifikationsfunktion `classify_durchgaengigkeit(typ, absturzhoehe)` mit folgender Logik, **explizit als Näherung gekennzeichnet, nicht als amtliche LANUV-Bewertung ausgeben**:
- `typ` enthält "Fischaufstieg" (inkl. "Fischaufstieg Gnadenthal"), "Rampe" oder "Gleite" → `"passierbar"` (diese Bauwerkstypen sind konstruktiv auf Durchgängigkeit ausgelegt).
- Absturzhöhe bekannt und < 0,10 m → `"passierbar"`; 0,10–0,30 m → `"teilweise"`; > 0,30 m → `"barriere"` (gängige Faustregel-Größenordnung aus der Fischdurchgängigkeits-Literatur, **kein** amtlicher LANUV-Schwellenwert — das muss im Disclaimer stehen).
- `typ` = "Bewegliches Wehr", "Absturz", "Sohlschwelle" ohne bekannte Absturzhöhe → `"unbekannt"` (grau), **nicht** automatisch als Barriere werten — fehlende Daten ≠ Barriere.
- Falls (a) auch kein Absturzhöhen-Feld liefert: nur die typ-basierte Grobklassifikation (Fischaufstieg/Rampe/Gleite → passierbar, Rest → unbekannt) — dann transparent im Popup/Doku vermerken, dass "Barriere" mangels Daten aktuell nicht vergeben werden kann.
- **Nicht** einfach die 40 Fischaufstiege als "passierbar" hinstempeln und den Rest pauschal als "Barriere" — das Feature soll gerade die echte Differenzierung liefern.

---

### 2. Scraper erweitern (nur falls Plan B nötig)

Datei: `elwas_raw_data/scrape_querbauwerke.py`
- Bestehende Regex-Helper `extract_num()`/`extract_text()` (Zeilen ~27–45) wiederverwenden, zusätzlich `extract_num("Absturzhöhe", detail_text)` auslesen und als Feld `absturzhoehe` ins `results`-Dict schreiben (Stelle: der `results[anlagen_nr] = {...}`-Block, Zeile ~147).
- Skript ist idempotent (überspringt bereits geladene IDs, Zeile ~117 "bereits geladen") — für reine Feld-Ergänzung ggf. den Skip-Check anpassen, sonst läuft der Re-Scrape nicht neu für bestehende Einträge.
- **Lehre aus dem Vorfall vom 15.07.** (siehe `walkthrough.md` Abschnitt 7 "Code-Review von Claude"): beim Parsen peinlich genau auf Zeilenumbruch-Grenzen achten (`[ \t]*` statt `\s*` in den Regexes), sonst bluten Werte aus nachfolgenden Tabellenzeilen in falsche Felder — exakt der Bugtyp, der letztes Mal mehrere Datensätze korrumpiert hat.

---

### 3. Build/Klassifikation

Datei: `elwas_raw_data/build_querbauwerke_geojson.py`
- Neue Funktion `classify_durchgaengigkeit(typ, absturzhoehe)` gemäß Schritt 1c (oder Plan-A-Join-Logik), **nicht** inline im Feature-Dict verstreuen.
- Pro Feature zwei neue Properties ergänzen: `durchgaengigkeit` (`"passierbar" | "teilweise" | "barriere" | "unbekannt"`) und roh `absturzhoehe` (float Meter oder `null`) — Rohwert mitschreiben, damit das Popup ihn transparent zeigen kann.
- Bestehendes Verhalten (Schreiben nach `elwas_raw_data/querbauwerke.geojson` + Kopie nach Root, Zeilen ~62–63) nicht anfassen, nur die `properties` im Feature-Dict erweitern (Zeile ~47–56).
- Nach dem Lauf: Verteilung prüfen mit
  ```
  python -c "import json; d=json.load(open('querbauwerke.geojson',encoding='utf-8')); from collections import Counter; print(Counter(f['properties'].get('durchgaengigkeit') for f in d['features']))"
  ```
  Ergebnis muss mehrere Klassen zeigen, nicht 70× dieselbe.

---

### 4. Frontend: Icon/Popup/Filter (index.html **und** internal.html — beide pflegen, sie sind strukturell fast identisch, `grep -n "querbauwerk" internal.html` liefert ~21 Treffer)

**Vorher immer:** `grep -n "querbauwerk" index.html` bzw. `internal.html` laufen lassen — die unten genannten Zeilennummern sind Stand jetzt und können sich verschoben haben.

1. **Marker-Icon** (`// Querbauwerke (ELWAS)`-Block, aktuell ca. Zeile 1863–1910 in `index.html`, `pointToLayer`-Callback): aktuell einheitliche orange Farbe `#E69F00` und Symbol 🧱 für **alle** Objekte hart codiert. Muss jetzt von `feature.properties.durchgaengigkeit` abhängen. Farbschema (colorblind-safe, konsistent zu Commit `e4609b2` "Okabe-Ito palette"): passierbar = `#009E73` (Grün), teilweise = `#F0E442` (Gelb), barriere = `#D55E00` (Rot-Orange), unbekannt = `#94a3b8` (Grau, bereits im File als Meta-Textfarbe genutzt). Symbol kann gleich bleiben (🧱) oder je Klasse variieren — Entscheidung liegt bei dir, aber **konsistent über beide HTML-Dateien**.
2. **Popup** (`onEachFeature`, ca. Zeile 1891–1907): neue Zeile ergänzen, z. B. `Durchgängigkeit: Passierbar/Teilweise passierbar/Barriere/Unbekannt` (Klartext-Label, nicht den rohen Enum-Wert anzeigen). Falls Plan B (Heuristik) verwendet wurde: **zwingend** ein kleiner Disclaimer-Satz im Popup, z. B. "Näherungswert auf Basis Bauwerkstyp/Absturzhöhe, keine amtliche LANUV-Bewertung" — fachlich wichtig für die Renaturierungs-Diskussion, nicht weglassen.
3. **Weitere Fundstellen, die synchron gehalten werden müssen** (leicht zu übersehen — genau dieser Fehlertyp hat beim Sidebar-Refactor am 16.07. die Lazy-Load-Events gekappt, weil eine von mehreren Stellen vergessen wurde): das `catColors`-Objekt (`querbauwerk: '#E69F00'`, ca. Zeile 3056) und `catLabels` (ca. Zeile 3069) sowie der PDF/PNG-Report-Generator-Block (Kommentar `// Querbauwerke`, ca. Zeile 3225–3236), der sein eigenes `popupHtml` separat aus den GeoJSON-Properties zusammenbaut. Alle Grep-Treffer für `querbauwerk` durchgehen, nicht nur die Marker-Definition.

**Neuer Sidebar-Filter "nur Wanderhindernisse":**
- Es gibt aktuell **kein** Muster für einen Sub-Filter innerhalb einer Layer-Kategorie (die Filter-Buttons im Block "🗺️ Fachdaten & Layer", ca. Zeile 938–1000, sind reine An/Aus-Toggles pro Layer). Das ist neues UI, keine Kopie eines bestehenden Patterns — aber dieselbe CSS-Klassensprache (`filter-btn`/`filter-group`/`swatch`) verwenden, damit es sich optisch einfügt.
- Direkt unter dem bestehenden Querbauwerke-Button (`data-layer-name="🧱 Querbauwerke (ELWAS)"`, ca. Zeile 968) eine kompakte Checkbox ergänzen, z. B. `<label class="sub-filter"><input type="checkbox" id="filter-only-barriers"> nur Wanderhindernisse</label>`.
- JS: beim Toggle das bestehende `querbauwerkeLayer` (`L.layerGroup`, ca. Zeile 1864) leeren und aus der schon vorhandenen Variable `querbauwerkeGeoData` neu rendern, gefiltert auf `durchgaengigkeit === 'barriere' || durchgaengigkeit === 'teilweise'` (Default: `unbekannt` **nicht** als Wanderhindernis anzeigen, da nicht belegt). Counter-Badge für Querbauwerke (`updateSidebarCounters()`, ca. Zeile 2507, Block "3. Layer counters" ca. Zeile 2548–2582) soll bei aktivem Sub-Filter die gefilterte Zahl zeigen, nicht die Gesamtzahl.

---

### 2. Was auf der Webseite sichtbar/anders sein soll

- Sidebar-Block "🗺️ Fachdaten & Layer": Button "Querbauwerke" wie bisher vorhanden und aktiv. **Neu:** direkt darunter eine kleine Checkbox-Zeile "nur Wanderhindernisse" — die gab es vorher nicht.
- Auf der Karte im Bereich der Rur / Städteregion Aachen (dort liegen die meisten der 70 Querbauwerke): Marker sind jetzt **farblich unterschiedlich** — vorher waren alle 70 identisch orange mit 🧱, jetzt grün/gelb/rot/grau je nach Durchgängigkeitsklasse.
- Klick auf einen roten (Barriere-)Marker öffnet das gewohnte Popup (Name, Kreis, Gewässer, Typ) **plus** neuer Zeile "Durchgängigkeit: Barriere" und ggf. Disclaimer-Zeile.
- Checkbox "nur Wanderhindernisse" aktiviert: grüne (passierbar, und je nach Entscheidung graue/unbekannt) Marker verschwinden von der Karte, nur rote+gelbe bleiben; Counter-Badge neben "Querbauwerke" zeigt jetzt die reduzierte Zahl (z. B. "(12/70)" statt "(70/70)"). Checkbox wieder deaktivieren → alle 70 wieder sichtbar.
- PDF/PNG-Reportexport (bestehendes Feature) exportiert die Karte inklusive der neuen Farbkodierung korrekt, nicht mehr mit der alten Einheitsfarbe.

**Beispiel-Klickpfad:**
1. https://adb-aquarevier-secure.surge.sh laden.
2. Sidebar-Block "Fachdaten & Layer" öffnen, "Querbauwerke" ist aktiv (Standard).
3. Auf der Karte zur Städteregion Aachen zoomen/pannen (Marker entlang der Rur).
4. Auf einen Marker klicken → Popup zeigt Durchgängigkeitsklasse (+ Disclaimer bei Heuristik).
5. Checkbox "nur Wanderhindernisse" unter dem Querbauwerke-Button aktivieren.
6. Beobachten: Marker-Anzahl auf der Karte reduziert sich sichtbar, Counter-Badge aktualisiert sich.
7. Checkbox wieder deaktivieren → alle Marker sind wieder da.

---

### 3. Datenquelle — Zusammenfassung

Kein reines Frontend-Feature ohne neue Daten — die amtlichen ELWAS-Rohdaten enthalten aktuell keine Durchgängigkeitsklasse. Vorgehen: zuerst prüfen ob ein externer amtlicher NRW-Datensatz (LANUV/Open.NRW) existiert und matchbar ist (Plan A); wahrscheinlicher ist, dass keiner in brauchbarer Form auffindbar ist, dann Scraper-Erweiterung um `Absturzhöhe` (Wiederverwendung von `elwas_toolkit/elwas_client.py`, gleiches Navigationsmuster wie `scrape_querbauwerke.py`) + dokumentierte Heuristik (Plan B), siehe Schritt 1–3 oben.

---

### 4. Test-/Verifikationspflicht (NICHT nur "keine Konsolenfehler")

Referenz, warum das hier ausdrücklich verlangt wird: Bei früheren Antigravity-Änderungen waren sowohl Datenfelder (Stauanlagen/Regenbecken-Feldvertauschung, 15.07.) als auch UI-Event-Verdrahtung (Sidebar-Refactor kappte Lazy-Load-Events, 16.07.) trotz "fertig"-Meldung kaputt — weil jeweils nur auf 0 JS-Fehler in der Konsole geprüft wurde. Das reicht hier nicht.

1. **Daten-Spotcheck (Python, vor jedem Frontend-Test):**
   - Verteilungscheck (Befehl siehe Schritt 3 oben) — mehrere Klassen, nicht eine.
   - Mindestens 3 konkrete Einzelfälle von Hand nachrechnen: je 1 Objekt mit `typ` "Fischaufstieg", "Bewegliches Wehr", "Absturz" — im rohen `querbauwerke.json` **und** im finalen `querbauwerke.geojson` prüfen, dass Typ, Absturzhöhe (falls vorhanden) und die daraus resultierende `durchgaengigkeit`-Klasse tatsächlich der gewählten Klassifikationslogik entsprechen. Nachrechnen, nicht nur "sieht plausibel aus" abnicken.
2. **Funktionaler Frontend-Spotcheck (Playwright, lokal über den vorhandenen `server.py`):**
   - `test_filters.py` als Vorlage nehmen und erweitern (es demonstriert bereits das richtige Muster: echte `assert`s auf Button-Klassen/Counter-Text, nicht nur `console.on('error')` abhören) — für die neuen Marker-Farben/Popup-Inhalte/Checkbox dasselbe Assert-Pattern verwenden.
   - Screenshot nach dem Laden **und** nach Klick auf einen einzelnen Querbauwerke-Marker (Popup muss sichtbar sein) — Screenshot tatsächlich ansehen, nicht nur "kein Fehler geworfen" als Erfolg werten.
   - Popup-Text der 3 Spotcheck-Objekte aus Schritt 1 per `page.locator(...).inner_text()` auslesen und programmatisch gegen die erwartete Durchgängigkeitsklasse assert-en.
   - Checkbox "nur Wanderhindernisse" klicken, Marker-Anzahl (Counter-Badge-Text) vor und nach dem Klick auslesen und assert-en, dass sie sich reduziert.
   - Denselben Test-Lauf für `internal.html` separat wiederholen — nicht annehmen, dass es identisch funktioniert, nur weil der Code gespiegelt wurde.
3. **Regressionscheck:** kurz durch die übrigen Sidebar-Buttons klicken (Stauanlagen, Regenbecken, Branchen-Filter etc.) und bestätigen, dass sie durch die Änderungen nicht kaputtgegangen sind — genau das haben frühere Sidebar-Refactorings übersehen.
4. **Live-Verifikation nach Push ist Pflicht, nicht optional:** nach `git push origin main` ca. 60–90s auf den GitHub-Actions-Deploy warten, dann https://adb-aquarevier-secure.surge.sh live öffnen (Playwright/`take_screenshot.py`), denselben Klickpfad wie oben nochmal fahren, Screenshot/Popup-Text erneut prüfen. Deploy-Erfolg nicht am grünen GitHub-Actions-Haken ablesen, sondern die tatsächlich live ausgelieferte Seite anfassen.

---

### 5. Commit-Konvention & Workflow

- Conventional-Commit-Stil wie im bestehenden Log (`git log --oneline`): `feat:` für das Feature, ggf. separater `fix:`-Commit falls beim Scraper vorab etwas repariert werden muss, `docs:` für Doku-Updates. Beispiel Hauptcommit: `feat: Durchgaengigkeitsklassifikation fuer Querbauwerke (Fischwanderung) + Sidebar-Filter`. Kurzer präziser erster Satz, kein generisches KI-Boilerplate.
- Workflow autonom, ohne Rückfrage bei jedem Schritt: implementieren → lokal mit dem vollständigen Test-Protokoll aus Abschnitt 4 verifizieren (echte Spotchecks, nicht nur Konsolenfehler-Freiheit) → committen → `git pull --rebase origin main` (falls parallel ein anderer Agent committed hat) → Konflikte per Rebase lösen, niemals force-push → `git push origin main` → Live-Verifikation wie in Abschnitt 4.4 → danach kurze Zusammenfassung an `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` **anhängen** (nicht überschreiben): welche Klassifikation/Quelle gewählt wurde (Plan A oder B), Verteilung der Klassen, was noch offen ist.
- Falls die fachliche Entscheidung (Plan A vs. B, genaue Schwellenwerte) unsicher ist: recherchebasiert selbst entscheiden und die Entscheidung + Begründung explizit im Commit-Body **und** in `STATUS_FUER_ANTIGRAVITY.md` dokumentieren — nicht stillschweigend einen Wert raten und verbauen.
```

</details>

---

## 15. Embed-Widget-Generator für Drittseiten (iframe/oEmbed)

**Kategorie:** Öffentlichkeitsarbeit

**Mehrwert:** Presse, Kreisverwaltungen und Bürgerinitiativen wollen die Karte oft nicht nur verlinken, sondern direkt in eigene Artikel/Websites einbetten. Ein fertiges Embed-Snippet senkt die Hürde von 'Link teilen' zu aktiver Sichtbarkeit auf fremden Seiten und erhöht die Reichweite über die Gremien-Zielgruppe hinaus - anders als die bereits geplante teilbare Filter-URL, die ein Link mit Zustand ist, kein eigenständiger chromeless-Embed-Modus mit Redaktions-Vorschau.

**Technischer Ansatz (Kurzfassung):** Neuer URL-Parameter ?embed=1 blendet Sidebar/Header aus, zeigt nur Karte + Mini-Legende; Generator-UI erzeugt <iframe>-Snippet mit responsiver Breite/Höhe; statische oEmbed-JSON-Discovery-Datei, damit CMS wie WordPress automatisch eine Live-Vorschau rendern.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
AUFTRAG FÜR ANTIGRAVITY: Embed-Widget-Generator für Drittseiten (iframe/oEmbed)

REPO: github.com/Dtunder/adb_aquarevier_map, Branch main, lokaler Checkout C:\Users\user\.gemini\antigravity-ide\scratch\contact_map. Mehrere KI-Agenten arbeiten parallel im selben Checkout.

SCHRITT 0 (Pflicht, vor jeder Zeile Code): `git pull` im Repo-Root. Falls dabei ein Konflikt auftritt: `git pull --rebase origin main`, Konflikte lösen, NIEMALS `git push --force`. Das gilt für jeden Push in diesem Auftrag, nicht nur den ersten.

═══════════════════════════════════════
1. SCOPE-GRENZEN — ZUERST LESEN
═══════════════════════════════════════
- Betroffen wird NUR `index.html` (die öffentliche, anonymisierte Karte) + eine neue Datei `oembed.json` im Repo-Root + ein kurzer neuer Abschnitt in `README.md`.
- `internal.html` wird NICHT angefasst — bewusst, nicht vergessen: `internal.html` lädt die volle PII-Datei `contacts.geojson` und wird laut `.github/workflows/deploy-secure.yml` und `deploy-dev.yml` trotz `.surgeignore`-Eintrag zur Deploy-Zeit per `sed -i '/internal.html/d' .surgeignore` DOCH live auf Surge deployt (nur nicht von der Startseite verlinkt). Ein Embed-Modus oder Embed-Generator-Button darf dort niemals landen — das würde faktisch einen Weg schaffen, personenbezogene Kontaktdaten oder den Editor-Modus in ein fremdes iframe einzubetten. Falls du aus Konsistenzgründen versucht bist, den gleichen Patch 1:1 auch in `internal.html` zu spiegeln (wie in den historischen Commits, wo Sidebar-Refactors in beiden Dateien parallel gemacht wurden): NICHT TUN für dieses Feature. Verifiziere am Ende explizit `git diff internal.html` == leer.
- Kein neuer Scrape, keine neue Datenquelle nötig. Das ist ein reines Frontend-/Prozess-Feature. `elwas_toolkit/elwas_client.py`, `elwas_raw_data/*`, alle `*.geojson`-Dateien bleiben unangetastet.

═══════════════════════════════════════
2. REPO-ERKUNDUNG (exakte grep-Befehle, im Repo-Root ausführen)
═══════════════════════════════════════
```
grep -n "<head>\|<title>" index.html          # Zeile 3-6: <head>-Block, <title>Akteurskarte - AquaRevier</title> → Anker für oEmbed <link>-Tag
grep -n "<body" index.html                     # Zeile 832: <body class="light-theme"> → Anker für Embed-Detection-Script
grep -n "#app-container {" index.html          # Zeile ~151: flex-Layout, Sidebar+Map
grep -n "#sidebar {" index.html                # Zeile ~159: width:440px, Anker für embed-mode CSS
grep -n "#map {" index.html                    # Zeile ~172: flex:1 → füllt automatisch die Breite wenn Sidebar weg ist
grep -n "id=\"sidebar\"" index.html             # Zeile 835: Sidebar-Markup-Start
grep -n "export-csv-btn" index.html            # Zeile ~1030: Export-Section, Anker für neuen "Einbetten"-Button
grep -n "const groupColors" index.html         # Zeile ~1057: Farb-Map für Gruppen → für Mini-Legende wiederverwenden, NICHT neu erfinden
grep -n "L.map('map'" index.html               # Zeile ~1070: Map-Init
grep -n "L.control.zoom(" index.html           # Zeile ~1083: Zoom-Control auf position 'bottomright'
grep -n "L.control.layers(" index.html         # Zeile ~2008: Layer-Switcher auf position 'topright'
grep -n "position: 'topleft'" index.html       # Zeile ~3346: Unified-Search-Control auf position 'topleft'
```
Wichtig: top-left (Suche) und top-right (Layer-Switcher) sind schon belegt, bottom-right ist von Zoom-Control + Leaflet-Attribution belegt. Neue Embed-Only-UI-Elemente (Mini-Legende, "Vollständige Karte ansehen"-Link) gehören daher in die freie Ecke unten links (bottom-left), gestapelt.

Diese Zeilennummern sind Stand jetzt und können sich durch parallele Agent-Edits leicht verschieben — grep zur Laufzeit erneut ausführen statt blind auf Zeilennummern zu vertrauen.

═══════════════════════════════════════
3. IMPLEMENTIERUNG — SCHRITT FÜR SCHRITT (alles in index.html, außer h)
═══════════════════════════════════════

a) Embed-Erkennung so früh wie möglich, VOR dem Leaflet-Init, um Flash-of-Sidebar und Leaflet-Sizing-Race zu vermeiden: direkt nach `<body class="light-theme">` ein kleines inline `<script>` einfügen, das `new URLSearchParams(location.search).get('embed') === '1'` prüft und bei true die Klasse `embed-mode` synchron auf `document.body` setzt (nicht erst in DOMContentLoaded).

b) CSS-Regeln direkt neben den bestehenden `#sidebar`/`#map`-Regeln ergänzen:
   - `body.embed-mode #sidebar { display: none !important; }` (durch `flex:1` auf `#map` füllt die Karte automatisch die volle Breite, keine weitere Breiten-Anpassung nötig)
   - `body.embed-mode html, body.embed-mode { margin:0; padding:0; }`
   - Neue Klassen `.embed-mini-legend` (position:absolute, bottom, left, kompaktes Panel mit halbtransparentem Hintergrund passend zu `--bg-surface`, nur sichtbar wenn `body.embed-mode`) und `.embed-back-link` (kleine Pill/Button, ebenfalls bottom-left, oberhalb der Mini-Legende gestapelt, auch nur im embed-mode sichtbar). z-index über den Leaflet-Panes (>1000) wählen, damit nichts von Kartenlayern verdeckt wird.

c) HTML-Markup für beide Elemente als Geschwister von `#map` einfügen (nach dem `<!-- Map -->`-Kommentar, Zeile ~1039), initial per CSS versteckt:
   - `<div id="embed-mini-legend" class="embed-mini-legend"></div>` (wird per JS aus `groupColors` befüllt: pro Eintrag ein farbiger Punkt + Label, rein statisch/nicht klickbar — keine Filterfunktion in der Embed-Ansicht, das ist bewusst out of scope)
   - `<a id="embed-back-link" class="embed-back-link" target="_blank" rel="noopener noreferrer">↗ Vollständige Karte ansehen</a>`

d) JS-Wiring direkt nach dem bestehenden Map-Init-Block (nach Zeile ~1085, also nach `L.control.zoom(...).addTo(map)`), gated mit `if (document.body.classList.contains('embed-mode')) { ... }`:
   - Mini-Legende aus `groupColors` befüllen (Object.entries iterieren, Swatch + Label rendern) — keine eigene Farbliste pflegen, sonst laufen beide bei zukünftigen Gruppen-Änderungen auseinander.
   - `embed-back-link`-href setzen auf die aktuelle URL OHNE den `embed`-Parameter (URL-Objekt nehmen, `searchParams.delete('embed')`, `toString()`), NICHT hart auf die Produktions-URL verdrahten (funktioniert dann auch auf `adb-aquarevier-dev.surge.sh` und localhost beim Testen).
   - Bekannter Leaflet-in-iframe-Bug ("graue Kacheln"): `window.addEventListener('resize', () => map.invalidateSize())` UND zusätzlich einmalig `setTimeout(() => map.invalidateSize(), 300)` kurz nach Init, da eingebettete iframes ihre Größe oft erst nach dem ersten Leaflet-Render final bekommen (v.a. bei responsiven WordPress-Embeds, die die Höhe per JS nachträglich setzen).

e) Neuer Button "🔗 Karte einbetten" in der Export-Section der Sidebar (Zeile ~1027-1034, neben `export-csv-btn`/`export-pdf-btn`/`generate-report-btn`, gleicher `filter-btn`-Stil). Klick öffnet ein neues Modal `#embed-modal` (analog zu evtl. vorhandenen Modal-Patterns im File, sonst simples `position:fixed` Overlay + zentrierte Box, vanilla JS/CSS — keine neue Library einführen, das Projekt hat keine).

f) Modal-Inhalt + Live-Logik:
   - Zwei Eingaben: "Breite" (Radio/Select: "Responsive (100%)" [Standard] vs. "Feste Breite (px)" mit Zahlenfeld) und "Höhe (px)" (Zahlenfeld, Standard 600).
   - `<textarea readonly id="embed-snippet-output">` mit generiertem Code, z.B.:
     `<iframe src="https://adb-aquarevier-secure.surge.sh/?embed=1" width="100%" height="600" style="border:0;" loading="lazy" title="AquaRevier Akteurskarte"></iframe>`
     Die Basis-URL im Snippet dynamisch aus `location.origin + location.pathname` (ohne Query) ableiten, nicht hardcoden — läuft dann korrekt auch beim lokalen Testen.
   - Button "📋 Code kopieren" → `navigator.clipboard.writeText(...)`, Button-Label kurz zu "✅ Kopiert!" ändern als Feedback.
   - Live-Vorschau: ein echtes `<iframe>` im Modal, dessen `src`/`width`/`height` bei jeder Eingabe-Änderung sofort aktualisiert wird (nicht nur der Text-Snippet — die Vorschau muss tatsächlich die `?embed=1`-Ansicht laden).
   - Hinweistext im Modal: "Für WordPress & andere oEmbed-fähige CMS reicht es, den reinen Link https://adb-aquarevier-secure.surge.sh/ in einen eigenen Absatz/Block einzufügen — die Vorschau erscheint dann automatisch."

g) Im `<head>` (neben `<title>`, Zeile 6) einen oEmbed-Discovery-Link ergänzen:
   `<link rel="alternate" type="application/json+oembed" href="https://adb-aquarevier-secure.surge.sh/oembed.json" title="AquaRevier Akteurskarte" />`
   Bewusste Vereinfachung dokumentieren (Kommentar im HTML oder README): da die Seite statisch gehostet ist (Surge/GitHub Pages, kein Server-Endpoint), liefert `oembed.json` eine feste JSON-Antwort statt dynamisch auf den `url=`-Query-Parameter zu reagieren. Das deckt den Hauptfall (WordPress rendert die Root-URL der Karte) ab, ist aber keine vollständige oEmbed-Spec-Implementierung — das ist für dieses Feature ausreichend, nicht weiter aufbohren.

h) Neue Datei `oembed.json` im Repo-Root (gleiche Ebene wie `index.html`):
```json
{
  "type": "rich",
  "version": "1.0",
  "provider_name": "AquaRevier Akteurskarte",
  "provider_url": "https://adb-aquarevier-secure.surge.sh",
  "title": "AquaRevier Akteurskarte – Regionale Institutionen im Untersuchungsgebiet",
  "width": 800,
  "height": 600,
  "html": "<iframe src=\"https://adb-aquarevier-secure.surge.sh/?embed=1\" width=\"800\" height=\"600\" style=\"border:0;\" loading=\"lazy\" title=\"AquaRevier Akteurskarte\"></iframe>"
}
```
Kein Workflow-File anfassen: `.surgeignore` schließt `oembed.json` nicht aus (nur explizit gelistete Dateien), und `static.yml` (GitHub Pages) deployt ohnehin `path: '.'` — die neue Datei landet automatisch in allen drei Deploy-Zielen (deploy-secure, deploy-dev, GitHub Pages) ohne YAML-Änderung.

i) Kurzer neuer README.md-Abschnitt (Stil wie bestehende `## 🗺️ Kartenfunktionen`), der beschreibt: `?embed=1`-Parameter, den "🔗 Karte einbetten"-Button, und dass für CMS mit oEmbed-Support der reine Link reicht.

═══════════════════════════════════════
4. SICHTBARES ERGEBNIS NACH UMSETZUNG (genau)
═══════════════════════════════════════
Normalmodus (`https://adb-aquarevier-secure.surge.sh/`, kein Query-Param) ändert sich NUR dadurch, dass unten in der Sidebar (Export-Section) ein neuer Button "🔗 Karte einbetten" neben CSV/PDF-Export erscheint. Alles andere (Filter, Suche, Layer, Theme-Toggle, Marker, Popups, Export) bleibt exakt wie vorher.

Embed-Modus (`https://adb-aquarevier-secure.surge.sh/?embed=1`):
- Komplette Sidebar (Filter, Suche, Kontaktliste, Export-Buttons, Header "Akteure - AquaRevier") ist unsichtbar, Karte füllt 100% der Fläche.
- Unten links: kompaktes Mini-Legende-Panel mit den Farbpunkten + Kurzlabels der Akteursgruppen (Behörde, Forschung, Gebietskörperschaft, Gewerbe/Industrie, Landwirtschaft, Netzwerk/Multiplikator, Ver-/Entsorger, Sonstige), rein informativ, nicht klickbar.
- Direkt darüber: kleiner Link "↗ Vollständige Karte ansehen", öffnet die volle interaktive Karte (ohne `embed=1`) in einem NEUEN Browser-Tab.
- Zoom-Control (unten rechts), Layer-Switcher (oben rechts), Suche (oben links), Leaflet/OSM-Attribution bleiben sichtbar und funktional — nur die eigene Sidebar ist weg.
- Marker-Klicks, Popups, Zoom, Pan funktionieren normal.

Konkreter Klickpfad, Beispiel 1 (manuelles Einbetten):
1. Redakteur öffnet `https://adb-aquarevier-secure.surge.sh/`.
2. Klickt in der Sidebar unten auf "🔗 Karte einbetten".
3. Modal "Karte einbetten" öffnet sich: Breite-Auswahl (Standard "Responsive 100%"), Höhe-Feld (Standard 600), darunter das generierte `<iframe>`-Snippet in einer Textarea, darunter eine echte Live-Vorschau der eingebetteten Karte.
4. Redakteur ändert Höhe auf 800 → Snippet-Text UND Live-Vorschau aktualisieren sich sofort.
5. Klickt "📋 Code kopieren" → Button zeigt kurz "✅ Kopiert!".
6. Fügt das Snippet in die eigene Website/CMS ein → beim Laden zeigt das iframe die Karte ohne Sidebar, mit Mini-Legende unten links und funktionierenden Zoom/Pan/Marker-Klicks.

Konkreter Klickpfad, Beispiel 2 (oEmbed/WordPress):
1. Redakteur fügt in einem Gutenberg-Block nur die nackte URL `https://adb-aquarevier-secure.surge.sh/` in eine eigene Zeile ein (kein iframe-Code).
2. WordPress erkennt beim Speichern über den `<link rel="alternate" type="application/json+oembed">`-Tag im `<head>` der Seite automatisch den Discovery-Endpunkt, lädt `oembed.json` und rendert daraus automatisch dasselbe iframe wie in Beispiel 1 — ohne dass der Redakteur HTML anfassen muss.

═══════════════════════════════════════
5. DATEN-BEDARF
═══════════════════════════════════════
Keiner. Reines Frontend-/Prozess-Feature auf Basis der bereits geladenen `contacts_anonymized.geojson` und bestehenden Leaflet-Layer. `elwas_client.py`/Playwright-Toolkit, `elwas_raw_data/*.py`, LANUV/IT.NRW-Quellen werden nicht angefasst und sind für diesen Auftrag irrelevant.

═══════════════════════════════════════
6. TEST-/VERIFIKATIONSPFLICHT (verbindlich, "keine Konsolenfehler" reicht NICHT)
═══════════════════════════════════════
Hintergrund: bei früheren Antigravity-Änderungen waren sowohl Datenfelder (Stauanlagen/Regenbecken, 2026-07-15) als auch UI-Event-Verdrahtung (Sidebar-Refactor kappte lazy-load Events, 2026-07-16) trotz "fertig"-Meldung kaputt, weil nur auf JS-Fehler in der Konsole geprüft wurde. Diesmal explizit:

Lokal (`python server.py`, `http://localhost:8000`):
1. `?embed=1` direkt öffnen: Sidebar visuell wirklich weg (nicht nur kurz da und dann versteckt), Karte füllt volle Breite.
2. Mindestens 3 verschiedene Marker aus verschiedenen Layern anklicken (z.B. ein Behörde-Akteur, ein Grundwassermessstelle-Cluster-Punkt, eine Stauanlage) und prüfen, dass die Popups dieselben echten Datenfelder wie im Normalmodus zeigen (Seite-an-Seite-Vergleich gegen `http://localhost:8000/` ohne Param).
3. NICHT nur die direkte URL testen — echten iframe-Nesting-Fall prüfen: eine Scratch-Datei `test_embed.html` mit `<iframe src="http://localhost:8000/?embed=1" width="100%" height="500"></iframe>` erstellen, öffnen, prüfen dass Kacheln vollständig laden (kein Grau/Leer — klassischer Leaflet-Resize-Bug in iframes).
4. Mini-Legende: Farben stichprobenartig (mind. 2-3 Gruppen) gegen die tatsächlich gerenderten Marker-Farben abgleichen.
5. "Vollständige Karte ansehen"-Link anklicken → muss in NEUEM Tab öffnen, landet auf Vollversion ohne `embed=1`, Sidebar da.
6. Normalmodus (`http://localhost:8000/`, kein Param) erneut komplett durchklicken: mindestens einen Filter-Toggle, die Suche, einen Layer-Toggle, CSV-Export, PDF-Export, Theme-Toggle je einmal auslösen und prüfen, dass sich nichts gegenüber vorher verändert hat (Regressionscheck gegen die UI-Event-Verdrahtung-Fehlerklasse vom 2026-07-16).
7. Embed-Generator-Modal: Breite/Höhe ändern, prüfen dass Snippet + Live-Vorschau live mitgehen; "Code kopieren" klicken und den Zwischenablage-Inhalt tatsächlich irgendwo einfügen (z.B. Adressleiste), um zu bestätigen, dass wirklich kopiert wurde statt nur den Button-Text zu vertrauen.
8. `oembed.json` validieren (z.B. `python -m json.tool oembed.json`), dann den `html`-Feld-Wert in eine Scratch-HTML-Datei kopieren, öffnen und bestätigen, dass die eingebettete Karte tatsächlich lädt und funktioniert.
9. `git diff internal.html` muss leer sein.

Nach Push (siehe Abschnitt 7) zusätzlich LIVE auf Produktion wiederholen: `https://adb-aquarevier-secure.surge.sh/?embed=1` real öffnen und Punkte 2, 3, 4, 5 gegen die Live-Domain erneut prüfen, sowie `https://adb-aquarevier-secure.surge.sh/oembed.json` direkt abrufen und bestätigen, dass die Datei wirklich ausgeliefert wird (Surge-Deploy-Excludes sind über `.surgeignore` + den `sed`-Schritt im Workflow nicht auf den ersten Blick offensichtlich — deshalb live verifizieren, nicht nur lokal).

Erst wenn ALLE Punkte oben bestanden sind, gilt die Aufgabe als fertig — nicht nach "keine Fehler in der Konsole".

═══════════════════════════════════════
7. COMMIT / PUSH / DEPLOY-WORKFLOW
═══════════════════════════════════════
- Nur gezielt stagen, kein `git add -A`/`git add .`: `git add index.html oembed.json README.md` (Scratch-/Test-Dateien wie `test_embed.html` NICHT mit committen).
- Commit-Message-Konvention (siehe Historie, `feat:`/`fix:`-Präfix, klein geschrieben, prägnant, Präsens):
  `feat: embed-widget generator (iframe + oEmbed) fuer Drittseiten-Einbettung`
  Optional 1-2 Bullet-Zeilen im Body, analog zu bestehenden Commits wie `e58c586` oder `e46b41a`.
- Direkt vor dem Push erneut: `git pull --rebase origin main` (Mehrere Agenten arbeiten parallel). Bei Konflikt lösen und die komplette Testliste aus Abschnitt 6 NOCHMAL lokal durchlaufen (ein Rebase kann Regressionen unbemerkt zurückholen) — dann erst pushen. Niemals `git push --force`.
- `git push origin main`.
- GitHub Actions abwarten (`gh run list`/`gh run watch`, falls `gh` verfügbar, sonst https://github.com/Dtunder/adb_aquarevier_map/actions) für alle drei Workflows: deploy-secure, deploy-dev, static (Pages).
- Live-Verifikation auf Produktion durchführen wie in Abschnitt 6 beschrieben (Pflicht, nicht optional).
- Autonom durcharbeiten: keine Rückfragen zwischen den Schritten, solange der Scope wie hier beschrieben klar ist — nur bei echten Widersprüchen zur vorgefundenen Code-Struktur (z.B. falls sich die Datei-Struktur seit Erstellung dieses Auftrags grundlegend geändert hat) kurz innehalten und das konkret benennen, statt zu raten.
```

</details>

---


---


## 16. Cross-Layer-Korrelation Industrielast/Pegel-Abfluss

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Verknüpft die Abwassermengen der Industrieeinleiter mit den aktuellen Pegelabflüssen, um das Verdünnungsverhältnis im Niedrigwasserfall aufzuzeigen.

**Technischer Ansatz (Kurzfassung):** Dynamische Berechnung der Abwasserlast relativ zum MQ/NQ-Pegelabfluss für jeden Flussabschnitt.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Cross-Layer-Korrelation Industrielast/Pegel-Abfluss

1. Berechne die Abwasser-Verdünnung an jedem Flussabschnitt basierend auf dem Pegel MQ/NQ.
2. Füge einen Korrelations-Layer in index.html und internal.html ein.
3. Teste und verifiziere lokal.
```
</details>

## 17. Grundwasserwiederanstieg-Layer

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Zeigt Gebiete mit signifikantem Grundwasserwiederanstieg und dessen Auswirkungen auf Kellernässung und Infrastruktur.

**Technischer Ansatz (Kurzfassung):** Interpolierter Raster- oder Konturen-Layer basierend auf historischen GWM-Messreihen.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Grundwasserwiederanstieg-Layer

1. Generiere Konturen-Layer für Grundwasserwiederanstieg.
2. Integriere in index.html und internal.html.
3. Teste und verifiziere.
```
</details>

## 18. Niedrigwasser-Trend

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Trendanalyse der Niedrigwasserabflüsse an Pegeln zur Früherkennung von Dürreperioden.

**Technischer Ansatz (Kurzfassung):** Pegel-Metriken-Erweiterung um gleitende NQ-Mittelwerte der letzten Jahre.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Niedrigwasser-Trend

1. Berechne gleitende NQ-Mittelwerte für Pegel.
2. Zeige Dürre-Indikatoren in Pegel-Popups.
3. Teste und verifiziere.
```
</details>

## 19. Risiko-Ampel pro Einleiter (ERLEDIGT)

**Kategorie:** Datenqualität

**Mehrwert:** Bewertung des Umweltrisikos einzelner Einleiter anhand ihrer Stofffrachten und Grenzwerteinhaltung.

**Technischer Ansatz (Kurzfassung):** Farbliche Kennzeichnung (Rot/Gelb/Grün) der Einleiter-Symbole auf Basis statistischer Auswertungen.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Risiko-Ampel pro Einleiter

1. Klassifiziere Einleiter nach Risikokriterien (Stofffrachten).
2. Passe Marker-Farben und Popups auf der Karte an.
3. Teste und verifiziere.
```
</details>

## 20. Fördergebiete-Overlay

**Kategorie:** Stakeholder-Kommunikation

**Mehrwert:** Visualisierung von Wassergewinnungs- und Trinkwasserfördergebieten im Vergleich zu Einleitungsstellen.

**Technischer Ansatz (Kurzfassung):** Zusätzlicher Overlay-Layer mit Konturen der offiziellen Wassergewinnungsgebiete.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Fördergebiete-Overlay

1. Lade Geodaten der Fördergebiete und erstelle Layer.
2. Integriere in index.html und internal.html.
3. Teste und verifiziere.
```
</details>

## 21. teilbare Filter-Links

**Kategorie:** UX

**Mehrwert:** Ermöglicht es Nutzern, den aktuellen Zustand der Karte (aktive Layer, Filter, Zoom, Center) über einen Link direkt zu teilen.

**Technischer Ansatz (Kurzfassung):** URL-Parameter Serialisierung und Deserialisierung beim Laden der Seite.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: teilbare Filter-Links

1. Serialisiere den Kartenzustand in URL-Hash oder Query-Parameter.
2. Lese URL beim Seitenstart aus und stelle Filter wieder her.
3. Teste und verifiziere.
```
</details>

## 22. Kläranlagen-Kapazitätsreserve

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Zeigt die verbleibende Ausbaugröße bzw. Kapazitätsreserve der Kläranlagen für zukünftige Revierentwicklungen auf.

**Technischer Ansatz (Kurzfassung):** Kreis-Choropleth-Erweiterung und Scorecard-Ergänzung um die Kapazitätsreserven der Kläranlagen.

<details>
<summary><strong>Vollständiger Antigravity-Auftrag (zum Kopieren aufklappen)</strong></summary>

```
Auftrag: Kläranlagen-Kapazitätsreserve

1. Berechne Kapazitätsreserven je Kläranlage.
2. Zeige freie EW-Kapazitäten je Kreis in der Scorecard und Karte.
3. Teste und verifiziere.
```
</details>


# Runde 3 (Neuentwürfe)

## 1. Industrielle Hitzebelastung & Kühlwassereinleitungen (Thermalbelastung)

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Industriebetriebe leiten oft Kühlwasser mit erhöhter Temperatur ein (z.B. Papierwerke, Chemie). Ein Layer, der Einleitungsstellen mit maximalen/zulässigen Einleitungstemperaturen darstellt, zeigt ökologische Hitzebelastungspunkte im Flusslauf auf.

**Technischer Ansatz (Kurzfassung):** Vektor-Overlay an Einleitern; farbliche Kodierung der thermischen Last; Tooltip mit Temperatur-Grenzwerten aus den ELWAS-Indirekteinleiterdaten.

## 2. Historischer Pegelvergleich & Dürre-Trend-Radar

**Kategorie:** Hydrologie

**Mehrwert:** Einzelne Pegelmessungen sind ohne Kontext schwer zu deuten. Eine Trend-Sektion visualisiert für jeden Pegel die Abweichung vom langjährigen Mittelwert und warnt bei anhaltender Trockenheit.

**Technischer Ansatz (Kurzfassung):** Popup-Erweiterung mit Chart-Integration (Chart.js / SVG) der monatlichen Durchschnittsabflüsse im Vergleich zu den Vorjahren.

## 3. Mischwassereinleitungen & Starkregen-Risiko-Hotspots

**Kategorie:** Fachdaten/Stadtplanung

**Mehrwert:** Klärt darüber auf, welche Flussabschnitte bei Starkregen durch Mischwasserentlastungen (ungeklärtes Abwasser) ökologisch belastet werden.

**Technischer Ansatz (Kurzfassung):** Punkt-Layer der Entlastungsbauwerke (Regenüberläufe) gekoppelt mit Gefährdungsklassen basierend auf dem angeschlossenen Einwohnerwert.

## 4. Schadstoff-Fingerabdruck (Schwermetalle/PFAS im Sediment)

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Macht unsichtbare Altlasten im Flussbett sichtbar. Wichtig für Naturschutz und Gewässerqualität.

**Technischer Ansatz (Kurzfassung):** Choropleth-Abschnitte für die Rur basierend auf den LANUV-Sedimentuntersuchungsdaten (Blei, Zink, PFAS).

## 5. Ökologischer Gewässerkorridor (Renaturierungspotenziale)

**Kategorie:** Fachdaten/Naturschutz

**Mehrwert:** Zeigt auf einen Blick, wo der Fluss noch Raum hat und wo Uferverbauungen Renaturierungen verhindern, um planerische Hebel für Wasserverbände zu bieten.

**Technischer Ansatz (Kurzfassung):** Linien-Layer des Gewässerumfelds mit Klassifizierung (naturnah / anthropogen geprägt / kritisch verbaut).

## 6. Klimawandel-Szenarien-Schieberegler (Pegelprognosen 2050)

**Kategorie:** Zukunftsszenarien/Stakeholder

**Mehrwert:** Ein Werkzeug für politische Gremien, um die langfristigen Auswirkungen des Klimawandels auf die Wasserführung der Rur visuell zu demonstrieren.

**Technischer Ansatz (Kurzfassung):** Schieberegler im UI, der die mittlere Abflussmenge (MQ) nach RCP-Szenarien (2.6 vs 8.5) für 2050 an den Pegeln interpoliert und farblich markiert.

## 7. Virtuelle Gewässerbegehung (360°-Panoramen / Foto-Layer)

**Kategorie:** UX/Öffentlichkeitsarbeit

**Mehrwert:** Macht das Gewässer virtuell erlebbar. Perfekt für Bürgerinformationen und Präsentationen.

**Technischer Ansatz (Kurzfassung):** Foto-Punkt-Layer auf der Karte; Klick öffnet Lightbox mit Vor-Ort-Bildern oder Links zu 360-Grad-Uferpanoramen.

## 8. Industrie-Gewässer-Koeffizient (Abwasser-Abfluss-Verhältnis)

**Kategorie:** Analysetools/Industrie

**Mehrwert:** Setzt die industrielle Abwassermenge ins direkte Verhältnis zur realen Wasserführung des Flusses. Beantwortet: Wie viel Prozent des Flusswassers ist an Stelle X gereinigtes Industrieabwasser?

**Technischer Ansatz (Kurzfassung):** Dynamische Berechnung des Verhältnisses Einleitungsmenge / MQ des Gewässerabschnitts und Kartierung als Risikofaktor.

## 9. Bürgerwissenschaftlicher Daten-Upload (Citizen Science Portal)

**Kategorie:** Öffentlichkeitsarbeit/Community

**Mehrwert:** Ermöglicht es der Bevölkerung, direkt an der Datenpflege mitzuwirken (z.B. Meldung von Müll oder ausgetrockneten Bachläufen).

**Technischer Ansatz (Kurzfassung):** Karten-Rechtsklick öffnet Formular mit Koordinaten-Auto-Ausfüllung und Bild-Upload, speichert im Feedback-Repo.

## 10. Trinkwasser-Versorgungsgebiete & Gewinnungsanlagen

**Kategorie:** Fachdaten/Hydrologie

**Mehrwert:** Zeigt den Zusammenhang zwischen Oberflächengewässern/Grundwasser und unserer alltäglichen Trinkwasserversorgung.

**Technischer Ansatz (Kurzfassung):** Flächen-Layer der Wasserschutzgebiete verknüpft mit den Standorten der Wasserwerke und deren Förderkapazitäten.

## 11. CO2-Speicherpotenzial von Auenwäldern & Mooren

**Kategorie:** Klimaschutz/Ökologie

**Mehrwert:** Demonstriert den Beitrag von Gewässerrenaturierungen zum Klimaschutz durch Wiedervernässung.

**Technischer Ansatz (Kurzfassung):** Flächen-Layer der Auen und Feuchtgebiete mit berechnetem jährlichen CO2-Bindungswert in Tonnen.

## 12. Dynamische Fließzeit-Simulation bei Schadstoffunfällen

**Kategorie:** Katastrophenschutz/Planung

**Mehrwert:** Simuliert die Ausbreitung von Schadstoffen im Gewässernetz. Großartiges Feature für Behörden und Gefahrenabwehr.

**Technischer Ansatz (Kurzfassung):** Interaktiver Klick auf Gewässer berechnet flussabwärts liegende Wegpunkte mit Zeitschätzungen basierend auf mittlerer Fließgeschwindigkeit.

## 13. Mehrsprachigkeits-Support (Englisch/Deutsch)

**Kategorie:** UX/International

**Mehrwert:** Erleichtert die Nutzung der Karte für EU-Verbundpartner und internationale Forschungsgruppen.

**Technischer Ansatz (Kurzfassung):** Sprach-Toggle im Header; Übersetzung aller statischen UI-Labels und Layer-Namen über ein JSON-Wörterbuch.

## 14. QR-Code-Generator für Vor-Ort-Schilder

**Kategorie:** Öffentlichkeitsarbeit/Community

**Mehrwert:** Verbindet physische Infotafeln an Flüssen/Pegeln direkt mit den Echtzeitdaten der AquaRevier-Karte.

**Technischer Ansatz (Kurzfassung):** Button im Popup, der einen QR-Code mit der URL inklusive Koordinaten-Hash generiert (z.B. map#lat,lng,zoom).

## 15. Integrierte Projektdokumentation (Wiki-Sidebar)

**Kategorie:** UX/Wissensmanagement

**Mehrwert:** Verknüpft wissenschaftliche Berichte und LANUV-Veröffentlichungen direkt mit dem geografischen Ort der Messung.

**Technischer Ansatz (Kurzfassung):** Sidebar-Bereich, der kontextabhängig PDF-Dokumente und Forschungsberichte basierend auf der aktiven Gemeinde oder dem aktiven Layer vorschlägt.

---

# Runde 4 (Zusatzvorschläge)

## Runde 4 - 1. Mikroplastik-Belastung im Sediment
**Kategorie:** Analytik  
**Mehrwert:** Kartierung von Mikroplastik-Messungen (Teilchen/kg) an ausgewählten Gewässerabschnitten.  
**Technischer Ansatz:** Marker-Layer mit Heatmap-Darstellung für hochbelastete Uferzonen.

## Runde 4 - 2. PFT/PFAS-Grenzwerte-Radar
**Kategorie:** Analytik  
**Mehrwert:** Vergleich von PFAS-Messergebnissen an Grundwassermessstellen mit den neuen EU-Grenzwerten.  
**Technischer Ansatz:** Farblich abgestufte Marker an GWMs; Grenzwert-Ampel im Detail-Popup.

## Runde 4 - 3. Sauerstoffgehalt-Trendlinie
**Kategorie:** Analytik  
**Mehrwert:** Echtzeit-Sauerstoffgehalt-Messungen (mg/L) zur Identifikation von Fischsterben-Risiko bei Sommerhitze.  
**Technischer Ansatz:** Visualisierung als Sparkline im Pegel-/Messstellen-Popup.

## Runde 4 - 4. Schwermetall-Akkumulation (Blei/Cadmium)
**Kategorie:** Analytik  
**Mehrwert:** Darstellung historischer Schadstoff-Einträge aus dem Bergbau im Rur-Einzugsgebiet.  
**Technischer Ansatz:** Polygon-Klassifizierung der Gewässerabschnitte nach Belastungsklassen.

## Runde 4 - 5. Trinkwasser-Nitrat-Choropleth
**Kategorie:** Analytik  
**Mehrwert:** Flächenhafte Darstellung der Nitratbelastung im oberen Grundwasserleiter nach Gemeindegrenzen.  
**Technischer Ansatz:** Choropleth-Overlay basierend auf den gemittelten LANUV-Werten der letzten 3 Jahre.

## Runde 4 - 6. Pestizid-Rückstands-Kataster
**Kategorie:** Analytik  
**Mehrwert:** Darstellung von Pflanzenschutzmittel-Rückständen in landwirtschaftlich geprägten Bächen.  
**Technischer Ansatz:** Punkt-Layer mit Ampelfarben für Überschreitung der ökologischen Qualitätsnormen.

## Runde 4 - 7. Wassertemperatur-Längsprofil
**Kategorie:** Analytik  
**Mehrwert:** Ein interaktives Diagramm, das den Temperaturverlauf der Rur von der Quelle bis zur Mündung zeigt.  
**Technischer Ansatz:** Klickbarer Längsprofil-Chart in der Sidebar bei Auswahl des Rur-Hauptlaufs.

## Runde 4 - 8. Trübung & Schwebstoff-Frachten
**Kategorie:** Analytik  
**Mehrwert:** Messdaten zur Wassertrübung (NTU) nach Starkregenereignissen zur Erosionsabschätzung.  
**Technischer Ansatz:** Visualisierung als zeitliche Abweichung vom Basiswert im Messstellen-Popup.

## Runde 4 - 9. pH-Wert-Schwankungs-Alarm
**Kategorie:** Analytik  
**Mehrwert:** Erkennung unüblicher pH-Wert-Abweichungen zur Detektion von Industrie-Störfällen.  
**Technischer Ansatz:** Push-Notification-Simulation im Dashboard bei pH-Werten außerhalb von 6.5 - 8.5.

## Runde 4 - 10. Leitfähigkeit als Versalzungskriterium
**Kategorie:** Analytik  
**Mehrwert:** Messung der elektrischen Leitfähigkeit (µS/cm) zur Überwachung von Bergwerkseinleitungen.  
**Technischer Ansatz:** Farbcodierter Linien-Layer für betroffene Nebenbäche.

## Runde 4 - 11. Retentionsraum-Simulationsschieberegler
**Kategorie:** Hydrologie  
**Mehrwert:** Simulation der Auswirkung von Deichrückverlegungen auf den Hochwasserscheitel.  
**Technischer Ansatz:** Schieberegler verändert die Breite der blauen Überflutungsfläche auf der Karte.

## Runde 4 - 12. Auen-Renaturierungs-Scorecard
**Kategorie:** Hydrologie  
**Mehrwert:** Bewertung des Renaturierungspotenzials von Gewässerrandstreifen.  
**Technischer Ansatz:** Sidebar-Steckbrief mit ökologischem Score (0-100) pro Gemeinde.

## Runde 4 - 13. Grundwasser-Dürre-Index (SGI)
**Kategorie:** Hydrologie  
**Mehrwert:** Berechnung und Darstellung des Standardized Groundwater Index zur Dürreüberwachung.  
**Technischer Ansatz:** Klassifizierung der GWMs von extrem trocken (rot) bis extrem nass (blau).

## Runde 4 - 14. Niedrigwasser-Abfluss-Warnsystem
**Kategorie:** Hydrologie  
**Mehrwert:** Automatisches Warnsignal an Pegeln, wenn das MQ (mittlere Abflussmenge) unterschritten wird.  
**Technischer Ansatz:** Blinkendes Warnsymbol am Pegel-Marker inklusive Abfluss-Defizit-Anzeige.

## Runde 4 - 15. Bodenfeuchte-Anomalie-Raster
**Kategorie:** Hydrologie  
**Mehrwert:** Integration von DWD-Bodenfeuchtedaten zur Darstellung landwirtschaftlicher Trockenheit.  
**Technischer Ansatz:** Transparentes Kachel-Overlay (WMS-Dienst des DWD) über das Projektgebiet.

## Runde 4 - 16. Quellschutzgebiete-Kataster
**Kategorie:** Hydrologie  
**Mehrwert:** Schutzgebiete um Trinkwasserquellen zur Sensibilisierung bei Bauvorhaben.  
**Technischer Ansatz:** Grün schraffierte Schutzflächen als zuschaltbares Overlay.

## Runde 4 - 17. Klimawandel-Abfluss-Prognose 2100
**Kategorie:** Hydrologie  
**Mehrwert:** Pegelprognosen für das Jahr 2100 basierend auf IPCC-Szenarien.  
**Technischer Ansatz:** Zusätzlicher Reiter im Pegel-Popup mit Zukunftskurven für RCP 4.5 und 8.5.

## Runde 4 - 18. Starkregen-Fließweg-Analyse
**Kategorie:** Hydrologie  
**Mehrwert:** Darstellung von Sturzflutwegen im urbanen Raum bei Starkregen.  
**Technischer Ansatz:** Blau schattierte Flieﬂpfade auf Basis eines 1m-Raster-DGM.

## Runde 4 - 19. Wasserspeicherpotenzial von Talsperren
**Kategorie:** Hydrologie  
**Mehrwert:** Füllstands-Visualisierung der großen Talsperren (Rurtalsperre, Urfttalsperre) in Echtzeit.  
**Technischer Ansatz:** Balkendiagramm im Talsperren-Popup mit Kapazitäts-Prozenten.

## Runde 4 - 20. Entwässerungsgräben-Struktur
**Kategorie:** Hydrologie  
**Mehrwert:** Erfassung des landwirtschaftlichen Grabennetzwerks und dessen Auswirkung auf den Abfluss.  
**Technischer Ansatz:** Feine graue Liniengeometrien; Filter für Entwässerungs- vs. Bewässerungsfunktion.

## Runde 4 - 21. Klärschlamm-Verwertungs-Pfade
**Kategorie:** Infrastruktur  
**Mehrwert:** Darstellung der Wege von Klärschlamm (Verbrennung, Landwirtschaft) pro Kläranlage.  
**Technischer Ansatz:** Flussdiagramm/Sankey-Diagramm im Kläranlagen-Popup.

## Runde 4 - 22. Mischwasser-Entlastungshäufigkeit
**Kategorie:** Infrastruktur  
**Mehrwert:** Statistik über die jährlichen Überlaufstunden der Regenüberlaufbecken.  
**Technischer Ansatz:** Kreisdiagramm-Marker, deren Größe mit der Entlastungsmenge korreliert.

## Runde 4 - 23. Industrielle Indirekteinleiter-Verknüpfung
**Kategorie:** Infrastruktur  
**Mehrwert:** Visualisierung der Rohrleitungswege von Industriebetrieben zur kommunalen Kläranlage.  
**Technischer Ansatz:** Gestrichelte Verbindungslinien zwischen Industriemarker und Kläranlagenmarker.

## Runde 4 - 24. Kanalsanierungs-Dringlichkeitsindex
**Kategorie:** Infrastruktur  
**Mehrwert:** Bewertung des Alters und Zustands des Abwassernetzes pro Gemeinde.  
**Technischer Ansatz:** Gemeinde-Choropleth mit Sanierungs-Prioritätenscore.

## Runde 4 - 25. Trinkwasserleitungs-Netzdichte
**Kategorie:** Infrastruktur  
**Mehrwert:** Statistische Dichte des Trinkwassernetzes pro km² zur Infrastrukturplanung.  
**Technischer Ansatz:** Raster-Overlay (Dichtekarte) im Versorgungsgebiet.

## Runde 4 - 26. Eigenüberwachungsverordnung (EÜV) Status
**Kategorie:** Infrastruktur  
**Mehrwert:** Anzeige, ob die gesetzlichen Prüffristen der technischen Anlagen eingehalten wurden.  
**Technischer Ansatz:** Status-Badge (grün/gelb/rot) im Anlagensteckbrief.

## Runde 4 - 27. Energieeffizienz von Kläranlagen
**Kategorie:** Infrastruktur  
**Mehrwert:** Stromverbrauch pro Kubikmeter gereinigtem Abwasser im Vergleich zum Bundesdurchschnitt.  
**Technischer Ansatz:** Energie-Effizienz-Label (A-G) im Kläranlagen-Popup.

## Runde 4 - 28. Regenwasserversickerungs-Potenzial
**Kategorie:** Infrastruktur  
**Mehrwert:** Flächenhafte Eignung für Entsiegelungs- und Versickerungsmaßnahmen.  
**Technischer Ansatz:** Choropleth-Layer basierend auf der Bodendurchlässigkeit (kf-Wert).

## Runde 4 - 29. Notstrom-Resilienz von Wasserwerken
**Kategorie:** Infrastruktur  
**Mehrwert:** Einstufung der Krisensicherheit von Wasserwerken bei Blackout-Szenarien.  
**Technischer Ansatz:** Resilienz-Icon (Batteriesymbol) mit autarker Laufzeit in Stunden.

## Runde 4 - 30. Starkregenspeicher-Kapazität
**Kategorie:** Infrastruktur  
**Mehrwert:** Summiertes Rückhaltevolumen aller Regenbecken pro Stadt/Gemeinde.  
**Technischer Ansatz:** Vergleichs-Balken-Chart in der Gemeinde-Sidebar.

## Runde 4 - 31. Müll-Hotspot-Melderegister
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Bürger können illegale Müllablagerungen an Gewässern markieren und Fotos hochladen.  
**Technischer Ansatz:** Formular-Marker; temporärer roter Marker, der nach Behördenprüfung grün wird.

## Runde 4 - 32. Fischbeobachtungs-Tagebuch
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Angler und Bürger können Sichtungen von Wanderfischen (z.B. Lachs, Aal) eintragen.  
**Technischer Ansatz:** Fisch-Icon-Marker mit Foto-Lightbox und Artendetails.

## Runde 4 - 33. Trockene-Bäche-Melder
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Crowdsourcing zur Erfassung von temporär trockenfallenden Gewässern 2. Ordnung.  
**Technischer Ansatz:** Rote Linienmarkierung des Gewässerabschnitts bei Klick durch Bürger.

## Runde 4 - 34. Bade- & Freizeit-Eignungsampel
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Bewertung der Gewässerqualität an offiziellen Badestellen nach EU-Richtlinie.  
**Technischer Ansatz:** Bade-Icon mit tagesaktueller Freigabe (Grün/Rot) basierend auf Bakterienwerten.

## Runde 4 - 35. Neophyten-Ausbreitungs-Kataster
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Meldung invasiver Pflanzenarten (z.B. Riesenbärenklau, Springkraut) am Ufer.  
**Technischer Ansatz:** Farbige Punkte auf der Karte mit Ausbreitungsradius und Bekämpfungshinweisen.

## Runde 4 - 36. Historische Gewässergeschichten
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Erfassung von Zeitzeugenberichten, alten Fotos und Anekdoten zu Flüssen und Mühlen.  
**Technischer Ansatz:** Buch-Symbol auf der Karte öffnet Audio-/Text-Story-Modal.

## Runde 4 - 37. Gewässer-Patenschaften-Portal
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Schulen oder Vereine können Patenschaften für Bachabschnitte übernehmen und eintragen.  
**Technischer Ansatz:** Uferlinien-Highlighting in der Farbe des betreuenden Vereins.

## Runde 4 - 38. Trinkwasser-Refill-Stationen
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Darstellung von kostenlosen Trinkwasser-Spendern und Refill-Geschäften in NRW.  
**Technischer Ansatz:** Wassertropfen-Icon; Filter für öffentlich zugängliche Brunnen.

## Runde 4 - 39. Vogelbeobachtungs-Gebiete an Gewässern
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Sichtungen geschützter Wasservögel (z.B. Eisvogel) zur Kartierung sensibler Zonen.  
**Technischer Ansatz:** Fernglas-Marker verlinkt mit eBird-Datenbank.

## Runde 4 - 40. Hochwassermarken-Archiv
**Kategorie:** Bürgerbeteiligung  
**Mehrwert:** Bürger können historische Hochwassermarken an Gebäuden fotografieren und eintragen.  
**Technischer Ansatz:** Pegel-Symbol mit Jahreszahl und historischer Überflutungshöhe.

## Runde 4 - 41. GeoJSON-Brotli-Kompression
**Kategorie:** Performance  
**Mehrwert:** Reduktion der Dateigröße der GeoJSONs durch serverseitige Vorkompression.  
**Technischer Ansatz:** Express-Middleware / Build-Schritt zur Bereitstellung komprimierter Assets.

## Runde 4 - 42. IndexedDB Spatial Cache
**Kategorie:** Performance  
**Mehrwert:** Speicherung geladener GeoJSONs im Browser für sofortigen Wiederbesuch.  
**Technischer Ansatz:** Service Worker fängt Netzanfragen ab und liest bevorzugt aus IndexedDB.

## Runde 4 - 43. Dynamisches Layer-Pruning nach Viewport
**Kategorie:** Performance  
**Mehrwert:** Rendern von Markern nur im aktuell sichtbaren Kartenausschnitt zur Entlastung des DOM.  
**Technischer Ansatz:** Leaflet event 'moveend' löscht Marker außerhalb der Bounding Box.

## Runde 4 - 44. Automatische Koordinaten-Anonymisierung
**Kategorie:** Performance  
**Mehrwert:** Präzisionsreduktion bei privaten Akteuren im Build-Prozess zum Datenschutz.  
**Technischer Ansatz:** Python-Skript rundet Koordinaten auf 4 Dezimalstellen (~11m Genauigkeit).

## Runde 4 - 45. WMS-Fallback-Kachel-Server
**Kategorie:** Performance  
**Mehrwert:** Automatischer Wechsel auf OSM-Kacheln bei Ausfall der offiziellen WebAtlasDE-Server.  
**Technischer Ansatz:** JS-Error-Handler an WMS-Layer lädt alternative Kachel-URL nach Timeout.

## Runde 4 - 46. OpenAPI-Schnittstelle für Rohdaten
**Kategorie:** Performance  
**Mehrwert:** Automatisierte API-Dokumentation für Dritte zur Abfrage der bereinigten ELWAS-Daten.  
**Technischer Ansatz:** Swagger/Redoc UI-Generierung aus Python-FastAPI Backend.

## Runde 4 - 47. Visual Regression Test Automation
**Kategorie:** Performance  
**Mehrwert:** Automatischer Screenshot-Vergleich bei jedem Push zur Entdeckung von UI-Layout-Shifts.  
**Technischer Ansatz:** Playwright-Workflow vergleicht Vorher-Nachher-Bilder im Headless-Modus.

## Runde 4 - 48. Leaflet-VectorGrid Slice Rendering
**Kategorie:** Performance  
**Mehrwert:** Umwandlung großer Punktwolken in Mapbox Vector Tiles (MVT) zur schnellen Web-Darstellung.  
**Technischer Ansatz:** Vorteilhaft bei der GWM-Karte mit über 4000 Messstellen.

## Runde 4 - 49. Sentry-Error-Tracking Integration
**Kategorie:** Performance  
**Mehrwert:** Fehlerüberwachung für JavaScript-Syntaxfehler und fehlgeschlagene Dateidownloads im Livebetrieb.  
**Technischer Ansatz:** Sentry-SDK Initialisierung im HTML-Header.

## Runde 4 - 50. Lighthouse Performance-Budget-Gate
**Kategorie:** Performance  
**Mehrwert:** Automatisierter Lighthouse-Test im CI-Workflow zur Einhaltung schneller Ladezeiten.  
**Technischer Ansatz:** Workflow bricht ab, wenn Performance-Score unter 90 Punkte fällt.
