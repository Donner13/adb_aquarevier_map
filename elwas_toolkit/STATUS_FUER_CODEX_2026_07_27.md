# Prompt für Codex — AquaRevier/Akteurskarte: Verbesserung, Bug-Hunt, Qualität

## Projektkontext (bitte zuerst lesen, nicht raten)

Repo-Root: dieses Verzeichnis (`contact_map/`). Git: github.com/Dtunder/adb_aquarevier_map,
Branch `main`. **Push auf `main` deployt automatisch live** via GitHub Actions → Surge.sh
(https://adb-aquarevier-secure.surge.sh). Zwei Haupt-Frontends: `index.html` (öffentliche
Karte, ~6400 Zeilen) und `internal.html` (Florians interner Editor, ~6900 Zeilen) — beide
sind eigenständige, große HTML-Dateien mit Leaflet + viel Inline-JS, kein Build-Step/Bundler.

Datenquelle: ELWAS-WEB (NRW-Umweltportal) wurde per Playwright gescraped (`elwas_raw_data/`,
`elwas_toolkit/elwas_client.py`) und in GeoJSON konvertiert (UTM EPSG:25832 → WGS84 via
pyproj). Aktuell ~24 GeoJSON-Dateien im Root, ~18 Layer in beiden HTML-Seiten (Grundwasser-
messstellen, Pegel, Stauanlagen, Regenbecken, Querbauwerke, Kläranlagen, Industrieeinleiter,
Wasserschutzgebiete, H2-Elektrolyseure, Einzugsgebiet-Statistik, Kreis-Vergleich-Choropleth,
Hochwassergefahrenkarten HQ/HQ100/HQextrem, Starkregen Euskirchen, Bergbaufelder u.a.).

Referenzdokumente in `elwas_toolkit/` (lies die, bevor du rätst was fehlt):
- `LAYER_QA_AUDIT_2026-07.md` — letzter systematischer Layer-Check (2026-07-25): alle Layer
  grün, außer "Tagebaue & Bergbaufelder" (bekannter 404, in Bearbeitung)
- `Aquarevier_Map_Backlog.md` — laufendes Backlog (groß, 580 KB — mit offset/limit oder grep
  lesen, nicht komplett auf einmal)
- `ELWAS_GESAMTPLAN.md` — Katalog aller 34 ELWAS-Datasets + welche integriert sind
- `HANDOFF_AQUAREVIER_BACKLOG_2026_07_18.md`, `STATUS_FUER_ANTIGRAVITY.md` — ältere Handoffs,
  ggf. teilweise überholt, per `git log` gegenprüfen was seither erledigt wurde

**Wichtig:** Frühere Scraper-Bugs bei Stauanlagen/Regenbecken/Querbauwerke (falsche
`betreiber`/`gewaesser`-Werte durch Regex-Leak) wurden bereits gefixt (Commits `0dc1522`,
`94b7e44`) und sind laut QA-Audit vom 2026-07-25 sauber — nicht erneut "entdecken" und melden,
sondern kurz gegenchecken (Value-Frequency-Check pro Feld) ob das immer noch stimmt.

## Deine Aufgabe

1. **Vollständigen Health-Check fahren**: alle Layer in `index.html` UND `internal.html`
   einzeln aktivieren (lokal, z.B. `python -m http.server`), auf Konsolenfehler UND auf
   tatsächliche Datenqualität prüfen — nicht nur "keine JS-Exception", sondern:
   - Popup-Inhalte stichprobenartig auf Plausibilität prüfen (keine literalen Platzhalter-
     Strings, keine offensichtlich vertauschten Felder)
   - Für jedes wichtige Feld pro Layer: `Counter(feature['properties'][field] for ...)` —
     wenn ein Feld über nahezu 100% der Features identisch ist, ist das ein Scraping-Bug-
     Indikator, kein Zufall
   - Koordinaten-Sanity: liegen alle Punkte tatsächlich im Rheinischen Revier (7 Kreise:
     Städteregion Aachen, Heinsberg, Mönchengladbach, Rhein-Kreis Neuss, Düren,
     Rhein-Erft-Kreis, Euskirchen), nicht z.B. bei (0,0) oder in einem anderen Kontinent
   - Mobile/responsive Verhalten beider Seiten (Sidebar, Layer-Panel, Popups auf schmalem
     Viewport)
   - Barrierefreiheit: es gibt bereits einen High-Contrast-Mode (#32) — prüfen ob neue
     Layer/Features seither diesen Kontrakt brechen
2. **Gefundene Bugs fixen**, mit Playwright lokal verifizieren (Konsole + echte Werte, nicht
   nur "lädt ohne Fehler"), aussagekräftig committen.
3. **Backlog abarbeiten**: `Aquarevier_Map_Backlog.md` nach offenen, noch nicht erledigten
   Punkten durchsuchen (grep nach offenen Checkboxen/Status-Markern) und die sinnvollsten
   umsetzen — priorisiere Dinge mit klarem Nutzen für Florian als Stakeholder, nicht Nice-
   to-have-Spielereien.
4. **"Tagebaue & Bergbaufelder"-Layer** (bekannter 404 laut QA-Audit) reparieren oder,
   falls die Quelle dauerhaft weg ist, sauber deaktivieren statt einen kaputten Request
   still weiterlaufen zu lassen.
5. **Perf-Check**: bei ~24 GeoJSON-Dateien und 2× ~6500-Zeilen-HTML-Dateien lohnt ein Blick
   auf Ladezeiten (v.a. Grundwassermessstellen mit 3700+ Punkten) — Lazy-Loading/Clustering
   ist teilweise schon drin, prüfen ob es überall konsequent angewendet wird.

## Nicht tun

- Keine neuen Datasets aus ELWAS-WEB integrieren, ohne vorher `ELWAS_GESAMTPLAN.md` und
  `dataset_recon_2026-07-15.json` zu checken, was schon evaluiert/verworfen wurde
  (z.B. Grubenwasser/Wasserhaltungen: falsche Region, bewusst nicht integriert).
- Kein stiller Force-Push, kein Rebase der Historie.
- Keine Secrets/Credentials in Commits oder Logs (Editor-Login `EDITOR_USER`/Passwort
  liegen als Env-Vars beim laufenden `editor_backend/server.py`, niemals hardcoden).
- Vor jedem Deploy (Push auf `main`) lokal mit Playwright testen — Push deployt automatisch,
  es gibt keinen manuellen Freigabeschritt danach.

## Definition of Done

- Alle Layer in beiden HTML-Seiten laden fehlerfrei UND mit plausiblen Daten (Value-
  Frequency-Check dokumentiert, nicht nur behauptet).
- Gefundene Bugs sind gefixt, committed mit klarer Nachricht, und ein kurzer Bericht
  (welche Bugs, welcher Fix, wie verifiziert) liegt in `elwas_toolkit/` als neues
  `STATUS_*.md`-Dokument mit Datum im Namen.
- Backlog-Fortschritt ist in `Aquarevier_Map_Backlog.md` markiert, nicht nur im Kopf.
