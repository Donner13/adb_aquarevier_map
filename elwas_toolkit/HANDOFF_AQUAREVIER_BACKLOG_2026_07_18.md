# Handoff: AquaRevier-Backlog (Claude → Antigravity)

**Adressat:** Antigravity-Agent
**Auftrag in einem Satz:** Setze die 15 unten gelisteten, bereits vollständig spezifizierten Backlog-Items aus `Aquarevier_Map_Backlog.md` eigenständig um (Build → Test → Commit → Push → Deploy-Verify, wie im Projekt etabliert), dokumentiere Fortschritt/Abweichungen in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` und trage das Ergebnis in Abschnitt E dieses Dokuments ein. Verweis auf `AGENT_COORDINATION_PROTOCOL.md` §8 für Concurrency-Regeln (Claude arbeitet aktuell NICHT parallel an diesem Repo, aber der Nutzer kann jederzeit dazwischenfunken).

Grund für diesen Handoff: Tagesbudget von Claude ist bereits bei ~380% des Ziels überschritten — der Nutzer möchte die restliche Backlog-Abarbeitung bewusst auf Antigravity verlagern, um Claude-Kontingent zu schonen.

---

## Bereits heute erledigt (Claude, 2026-07-18) — NICHT nochmal machen

| Item | Commit(s) | Status |
|---|---|---|
| #8 Playwright-basierte UI-Regressionssuite (Node/`@playwright/test`) | `d46d868`…`907416c` (Python-Vorversion verworfen, dann `81cbea5`/`907416c` Node-Migration) | Live, CI-Gate grün vor jedem Surge-Deploy |
| #16 Cross-Layer-Korrelation Industrielast/Pegel-Abfluss (Pegel-Popup) | `dfc3d88`, `94d1405` | Live |
| #11 Synthetic Uptime-Watchdog | kein Commit-Feature nötig — `tools/synthetic_watchdog.py` (Commit `e885365`) | Läuft lokal auf dem Claude-Rechner (PID aus dieser Session, nicht persistent über Reboot), pure Python, self-terminiert nach 37h. **Nicht doppelt bauen.** |
| Kontakt-Marker-Duplikat-Fix (StädteRegion Aachen 3x → 1x) | `f79014c` | Live, `import_contacts_anonymized.py` hat jetzt einen 300m-Merge-Pass |
| Impressum & Datenschutzerklärung | — (existierte schon) | `impressum.html`/`datenschutz.html` bereits vorhanden, kein offenes Backlog-Item mehr |

---

## A) Datei-Inventar

| Bereich | Datei | Zweck | Relevanz |
|---|---|---|---|
| Repo-Root | `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\` | Arbeitsverzeichnis, git repo (`github.com/Dtunder/adb_aquarevier_map`, Branch `main`) | direkt relevant |
| Backlog | `G:\Meine Ablage\Antigravity\10_Projects\Aquarevier_Map_Backlog.md` | Vollständige Spezifikationen aller 15 Items unten (Schritt-für-Schritt, Test-/Verifikationspflicht, Commit-Konvention pro Item) | direkt relevant — **selbst lesen, hier nicht dupliziert** |
| Muster | `elwas_raw_data/build_catchment_stats.py` | Etabliertes Spatial-Join-Pattern (shapely point-in-polygon) für neue Geo-Layer | direkt relevant für Items 4, 6, 14 |
| Muster | `elwas_toolkit/elwas_client.py` | Generische ELWAS-WEB-Scraping-Helpers (Regional-Suche, Objektdetails-Navigation) | direkt relevant für neue ELWAS-Datensätze |
| Muster | `elwas_toolkit/sitemap_links.json` | Deep-Links aller 34 ELWAS-WEB-Datensätze | nutzbar bei Bedarf |
| Handoff-Log | `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` | Laufendes Protokoll zwischen den Agents — hier Fortschritt/Blocker zu den 15 Items eintragen | direkt relevant, Pflicht-Protokollstelle |
| CI | `.github/workflows/deploy-secure.yml` | Deploy-Pipeline: Data-Quality-Gate → Playwright-UI-Gate (NEU seit heute) → Surge-Deploy. Jeder Push auf `main` deployt automatisch. | direkt relevant, nicht kaputt machen |
| CI | `.github/workflows/regen-ui-baselines.yml` | `workflow_dispatch`-Job zum Neu-Erzeugen der Playwright-Screenshot-Baselines auf dem echten `ubuntu-latest`-Runner (nötig bei jeder bewussten visuellen Änderung) | nutzbar, nicht Pflicht — nur falls ein Item absichtlich das Kartenbild ändert |
| Tests | `tests/ui-regression/*.spec.js` | Neue Node/Playwright-Suite — muss grün bleiben, prüft Layer-Toggles, Netzwerk-Requests, `<style>`-Balance, Konsolen-Fehler | direkt relevant, jeder PR muss hierdurch |
| Tool (neu) | `tools/synthetic_watchdog.py` | Lokaler Uptime-Watchdog (Claude-Rechner), Logs in `tools/watchdog_log.jsonl`/`watchdog_alerts.log` (beide `.gitignore`d) | nur zur Kenntnis, nicht anfassen |

Kein uncommitted User-WIP im Repo zum Zeitpunkt dieses Handoffs (`git status --short` leer, letzter Commit `e885365`).

---

## B) Dauerhafte Regeln (bereits etabliert, hier nur referenziert — nicht neu duplizieren)

Diese gelten bereits projektweit (siehe `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` §4 und die bisherige Zusammenarbeit) und bleiben für alle 15 Items bindend:

1. **"Keine Konsolenfehler" ist NICHT ausreichend als Verifikation.** Echter Daten-Spotcheck (Werteverteilung/Counter über alle Features, nicht nur einen), echter Browser-Klickpfad mit Playwright, sichtbares Popup-/UI-Ergebnis prüfen.
2. **`<style` vs `</style` Tag-Count muss nach jeder HTML-Änderung in `index.html` UND `internal.html` gleich bleiben** (ein einzelnes falsches Tag hat schonmal die gesamte Seiten-Formatierung zerschossen, Commit `527cc3e`).
3. **Build → Test lokal → Commit (aussagekräftige Message) → Push → Auto-Deploy → Live-Verify** — ohne bei jedem Schritt nachzufragen, sobald der Scope (dieses Handoff-Dokument) freigegeben ist.
4. Bei Push-Konflikt: `git pull --rebase`, niemals `force-push`.
5. Jedes neue ELWAS-Dataset: Koordinaten können unter "Lage" statt "Stammdaten" liegen, ggf. dekameter-maskiert (×10-Fehler-Falle, siehe `aquarevier_file_locations`-Memory bzw. `build_gwm_geojson.py`-Fix vom 16.07.).

---

## C) Checkliste (nachprüfbar, pro abgeschlossenem Item)

- `cd contact_map && npx playwright test` → alle Tests PASS (lokal UND im echten GitHub-Actions-Run, `gh run list --limit 3` zeigt `success` für den Push-Commit)
- `grep -c "<style" index.html internal.html` und `grep -c "</style" index.html internal.html` → jeweils identische Zahlenpaare
- `git log origin/main --oneline -1` nach jedem Push → neuer Commit-Hash sichtbar
- Live-Check: `curl -s https://adb-aquarevier-secure.surge.sh/<neue-datei>.geojson` liefert echte, nicht-degenerierte Daten (Stichprobe: mind. 2 unterschiedliche Werte über mehrere Features, keine 100%-identischen Platzhalter-Strings)

---

## D) Was schon automatisch läuft (nicht doppelt bauen)

- **Playwright-CI-Gate** (`.github/workflows/deploy-secure.yml`) — läuft bei jedem Push auf `main` automatisch, blockt den Surge-Deploy bei Fehlern.
- **Synthetic Uptime-Watchdog** (`tools/synthetic_watchdog.py`) — läuft lokal auf dem Claude-Rechner, bis zu 37h, prüft Live-Seite + alle Root-Geojsons + ELWAS-WEB-Erreichbarkeit alle 15 Min. Falls Antigravity auf einem anderen Rechner arbeitet, läuft dieser Watchdog dort NICHT mit — für Item 12 (Coverage-Anomalie-Erkennung) trotzdem eigenständig implementieren, das ist ein anderer Scope (Record-Count-Drift, nicht Uptime).
- **Data Quality Gate** (`validate_geojson.py --all`) — läuft vor dem Playwright-Gate, unverändert seit vorherigen Sessions.

---

## Die 15 offenen Items (volle Spezifikation jeweils in der Backlog-Datei, Zeilennummern als Startpunkt)

Reihenfolge = grobe Priorität, keine Pflicht-Sequenz. Parallelisierung nach eigenem Ermessen, aber auf Datei-Überschneidungen achten (mehrere Items ändern vermutlich `index.html`/`internal.html` gleichzeitig — dort sequenziell oder mit Merge-Vorsicht arbeiten, alles andere kann parallel laufen).

1. **#12 Geometrie-Vereinfachung als Build-Step vor dem Deploy** — `Aquarevier_Map_Backlog.md:1542` — Polygon-Geometrien vor Deploy vereinfachen (kleinere Payloads, schnelleres Laden).
2. **#14 Barrierefreiheit** — `Aquarevier_Map_Backlog.md:1838` — Tastatur-/Screenreader-Zugänglichkeit + Kontrastmodus.
3. **#15 Golden-Sample-Regressionstest für Extraktionslogik** — `Aquarevier_Map_Backlog.md:1996` — schützt die Scraper selbst vor stillen Regressionen (wie bei den Stauanlagen/Regenbecken-Bugs im Juli).
4. **Gewässergüte-Layer (EU-WRRL)** — `Aquarevier_Map_Backlog.md:2299` — chemischer & ökologischer Zustand nach EU-Wasserrahmenrichtlinie.
5. **Automatisierte Sprechzettel-/Beschlussvorlagen-Generierung** — `Aquarevier_Map_Backlog.md:2403` — aus Kartenzustand.
6. **Nährstoff-/Nitratbelastung im Grundwasser** — `Aquarevier_Map_Backlog.md:2540`.
7. **Zuständigkeits-/Ansprechpartner-Layer** — `Aquarevier_Map_Backlog.md:2674`.
8. **Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking** — `Aquarevier_Map_Backlog.md:2948`.
9. **Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf** — `Aquarevier_Map_Backlog.md:3110` — **zuerst Punkt 0 "KRITISCHE ARCHITEKTUR-VORGABE" bei Zeile 2968 lesen**, bevor implementiert wird.
10. **Update-Radar: Was hat sich seit dem letzten Besuch geändert?** — `Aquarevier_Map_Backlog.md:3490`.
11. **Offener Datenexport (GeoJSON/CSV) mit Lizenz-/Versionsstempel** — `Aquarevier_Map_Backlog.md:3644`.
12. **Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis** — `Aquarevier_Map_Backlog.md:3890`.
13. **Rollenbasiertes Onboarding mit Kontext-Tour** — `Aquarevier_Map_Backlog.md:4023`.
14. **Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung)** — `Aquarevier_Map_Backlog.md:4167`.
15. **Embed-Widget-Generator für Drittseiten (iframe/oEmbed)** — `Aquarevier_Map_Backlog.md:4309`.

Bei Unklarheiten in der jeweiligen Spezifikation: in `elwas_toolkit/STATUS_FUER_ANTIGRAVITY.md` dokumentieren statt zu raten (etablierte Praxis, siehe §7 dort).

---

## E) Ergebnis-Protokoll (von Antigravity auszufüllen)

Folgende 14 Jules-Sessions wurden erfolgreich gestartet ( requirePlanApproval = false ):

| Item-Nr. | Name | Jules-Session-ID | Status |
|---|---|---|---|
| 1 | #12 Geometrie-Vereinfachung als Build-Step vor dem Deploy | `13836614534977748868` | In Progress (Planning) |
| 2 | #14 Barrierefreiheit | `9318671150969150642` | In Progress (Planning) |
| 3 | #15 Golden-Sample-Regressionstest für Extraktionslogik | `1809416754322623431` | In Progress (Planning) |
| 4 | Gewässergüte-Layer (EU-WRRL) | `10645251576571155227` | In Progress (Planning) |
| 5 | Automatisierte Sprechzettel-/Beschlussvorlagen-Generierung | `18371965529749343016` | In Progress (Planning) |
| 6 | Nährstoff-/Nitratbelastung im Grundwasser | `3499680581847724697` | In Progress (Planning) |
| 7 | Zuständigkeits-/Ansprechpartner-Layer | `3693227844040025174` | In Progress (Planning) |
| 8 | Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking | `2552069854641125953` | In Progress (Planning) |
| 9 | Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf | `11641480847977696458` | In Progress (Planning) |
| 10 | Update-Radar: Was hat sich seit dem letzten Besuch geändert? | `14359277126961797898` | In Progress (Planning) |
| 11 | Offener Datenexport (GeoJSON/CSV) mit Lizenz-/Versionsstempel | `11678614609895992831` | In Progress (Planning) |
| 12 | Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis | `13338112907572766119` | In Progress (Planning) |
| 13 | Rollenbasiertes Onboarding mit Kontext-Tour | `15462952812341638289` | In Progress (Planning) |
| 14 | Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung) | `11717272380955906268` | In Progress (Planning) |
| 15 | Embed-Widget-Generator für Drittseiten (iframe/oEmbed) | - | Warteschlange (Limit von 14 parallelen Sessions erreicht) |

*Hinweis*: Sobald eine der ersten 14 Sessions fertiggestellt wurde, kann Item 15 nachgestartet werden.

