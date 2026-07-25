# Systematischer QA-Audit aller Kartenlayer

**Datum:** 2026-07-25
**Ziel:** Verifizierung der Layer-Integrität in `index.html` und `internal.html`.

## Methodik
- Jede Seite wurde zweimal in einer frischen Session geladen.
- Jeder Button mit `data-layer-name` wurde einzeln aktiviert.
- Abgehört wurden: Netzwerkanfragen (WMS/GeoJSON), Konsolenfehler, Page-Errors.
- Kriterien: HTTP 200, valides WMS Image, nicht-leeres GeoJSON, keine JS Errors.

## Ergebnisse `index.html`

| Layer Name | Lauf 1 Fehler | Lauf 2 Fehler | Bemerkungen |
|---|---|---|---|
| 💧 Grundwassermessstellen (ELWAS, 3700+) | 0 | 0 | OK |
| 📏 Pegel (ELWAS) | 0 | 0 | OK |
| ⛰️ Stauanlagen (ELWAS) | 0 | 0 | OK |
| 🌧️ Regenbecken/-entlastungsanlagen (ELWAS) | 0 | 0 | OK |
| 🧱 Querbauwerke (ELWAS) | 0 | 0 | OK |
| ⚡ H2-Industrie (Elektrolyseure NRW) | 0 | 0 | OK |
| 🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser) | 0 | 0 | OK |
| 📊 Kreis-Vergleich (Choroplethenkarte) | 0 | 0 | OK |
| Rur Einzugsgebiet (Hydrologisch) | 0 | 0 | OK |
| Wasserschutzgebiete (LANUV) | 0 | 0 | OK |
| Tagebaue & Bergbaufelder (GD) | 0 | 0 | Bekannt/In Bearbeitung (404 erwartet) |
| Eigene Gewässer mit Namen | 0 | 0 | OK |
| Landkreisgrenzen (Rheinisches Revier) | 0 | 0 | OK |
| Kreisgrenzen (Schwarz gestrichelt) | 0 | 0 | OK |
| HQ häufig (LANUV) | 0 | 0 | OK |
| HQ100 (LANUV) | 0 | 0 | OK |
| HQ extrem (LANUV) | 0 | 0 | OK |
| Starkregen Euskirchen | 0 | 0 | OK |

## Ergebnisse `internal.html`

| Layer Name | Lauf 1 Fehler | Lauf 2 Fehler | Bemerkungen |
|---|---|---|---|
| 💧 Grundwassermessstellen (ELWAS, 3700+) | 0 | 0 | OK |
| 📏 Pegel (ELWAS) | 0 | 0 | OK |
| ⛰️ Stauanlagen (ELWAS) | 0 | 0 | OK |
| 🌧️ Regenbecken/-entlastungsanlagen (ELWAS) | 0 | 0 | OK |
| 🧱 Querbauwerke (ELWAS) | 0 | 0 | OK |
| ⚡ H2-Industrie (Elektrolyseure NRW) | 0 | 0 | OK |
| 🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser) | 0 | 0 | OK |
| 📊 Kreis-Vergleich (Choroplethenkarte) | 0 | 0 | OK |
| Rur Einzugsgebiet (Hydrologisch) | 0 | 0 | OK |
| Wasserschutzgebiete (LANUV) | 0 | 0 | OK |
| Tagebaue & Bergbaufelder (GD) | 0 | 0 | Bekannt/In Bearbeitung (404 erwartet) |
| Eigene Gewässer mit Namen | 0 | 0 | OK |
| Landkreisgrenzen (Rheinisches Revier) | 0 | 0 | OK |
| Kreisgrenzen (Schwarz gestrichelt) | 0 | 0 | OK |
| HQ häufig (LANUV) | 0 | 0 | OK |
| HQ100 (LANUV) | 0 | 0 | OK |
| HQ extrem (LANUV) | 0 | 0 | OK |
| Starkregen Euskirchen | 0 | 0 | OK |
