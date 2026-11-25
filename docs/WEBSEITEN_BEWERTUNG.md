# AquaRevier Akteurskarte – Webseiten-Bewertung

Stand: 2026-11-25 · Branch `claude/intelligent-mendel-hgfyf7` · Grundlage: `main` @ `f3b4c07`

Noten: 1 = kritisch, 5 = sehr gut. Alle Zahlen stammen aus Läufen in dieser Cloud-VM
(Chromium headless, lokaler Server). **Einschränkung:** Die VM erreicht keine externen
Hosts. Die Live-Seite (`adb-aquarevier-secure.surge.sh`), OSM-/Carto-Kacheln und die
Partner-Logos waren nicht abrufbar. Befunde zur Live-Seite (404 bei `legal/*.md`,
öffentliche `contacts.geojson`) stammen aus dem Systemtest vom 2026-11-13 und wurden
hier **nicht** neu bestätigt.

## Übersicht

| Bereich | Note | Kurzbegründung |
|---|---|---|
| Performance / Datenmenge | 3 | Lighthouse Performance 62 (Desktop) / 54 (Mobil); 13 MB pro Seitenaufruf; zwei GeoJSON werden doppelt geladen |
| Barrierefreiheit | 3 | Lighthouse 89 / 92; 135 Buttons/Links ohne Namen, 14 Kontrastfehler, 80 zu kleine Touch-Ziele |
| Mobile Ansicht | 3 | Viewport-Meta vorhanden, kein horizontales Scrollen bei 390 px; Mobil-Performance schwach, Mobil-Tests rot |
| Konsolenfehler | 3 | `internal.html` war vollständig defekt (3 JS-Fehler), `index.html` ohne eigene Fehler; Rest sind Sandbox-Artefakte |
| Links / Statische Seiten | 3 | `legal/*.md` lokal 200, live laut Systemtest 404 (Ursache plausibel: fehlender Build); 4 Hotlink-Hosts für Logos |
| Tests | 2 | Playwright: auf `main` 6 von 78 vergleichbaren Tests grün, auf dem Branch 51 von 78 |
| CI / Deploy | 1 → 2 | Build-Skript fehlte, Workflow veröffentlichte `internal.html`; repariert, aber in CI noch nicht gelaufen |
| Sicherheit | 2 | 345 Kontakt-E-Mails und Klartext-Zugangsdaten im Repo; dompurify behoben |
| Datenqualität | 3 | Gate besteht; ein Layer ohne Datei; Demo-Werte im WRRL-Modal |

## Belege je Bereich

### Performance / Datenmenge (3)
- Lighthouse 12 gegen den lokalen Build (`dist_public`), simulierte Drosselung:
  Desktop Performance 62, FCP 2,2 s, **LCP 12,0 s**, TBT 0 ms, CLS 0.
  Mobil Performance 54, FCP 11,7 s, **LCP 70,4 s**, TBT 150 ms.
  Die LCP-Werte sind durch die gesperrten externen Hosts (Kacheln, Logos) verzerrt und
  nur als Obergrenze zu lesen.
- `index.html` lädt 73 Requests, laut Lighthouse 13 MB (unkomprimiert, lokaler Server).
  Playwright-Messung: 19,5 MB inkl. Doppelladungen.
- **Doppelt geladen:** `kreise_rr.geojson` (2,3 MB) und `grundwassermessstellen.geojson`
  (3,0 MB) werden je zweimal angefordert.
- Größte Dateien (roh / gzip): `wasserschutzgebiete.geojson` 6,15 / 1,11 MB,
  `gsk3c_gew_kanal_plm.geojson` 6,04 / 2,24 MB, `kreise_scorecard.geojson` 5,37 / 0,97 MB,
  `rur_einzugsgebiet.geojson` 4,70 / 0,87 MB. Alle 25 GeoJSON im Release zusammen:
  38,3 MB roh, 9,7 MB gzip.
- `logos/stadt_eschweiler.jpg` hat 1,08 MB für ein Logo.
- `index.html`: DOMContentLoaded 177 ms, Load 710 ms (lokal, ohne Netzlatenz).

### Barrierefreiheit (3)
Lighthouse Desktop 89, Mobil 92. Offene Audits: `aria-command-name` (135 Elemente),
`color-contrast` (14), `target-size` (80), `label-content-name-mismatch` (2).
`lang="de"`, ein `h1`, alle Bilder mit `alt`. Playwright zählt 3 Buttons ohne Namen auf
`index.html`, 8 auf `internal.html`.

### Mobile Ansicht (3)
Viewport-Meta vorhanden; bei 390 × 844 px `scrollWidth` = 390 (kein Überlauf).
Mobil-Lighthouse: Performance 54, Barrierefreiheit 92. Die Mobil-Tests
(`mobile-sidebar`, `mobile-touch`) sind rot, vermutlich wegen derselben Ursachen wie bei
den übrigen Tests (siehe unten).

### Konsolenfehler (3)
- `internal.html` (vor den Fixes): `SyntaxError: Unexpected token '}'`, danach
  `map.on is not a function` und `t.addLayer is not a function`. Die Karte
  initialisierte nicht.
- `index.html`: keine eigenen JS-Fehler. Die 34 Konsolenfehler in der VM sind
  `ERR_TUNNEL_CONNECTION_FAILED` für gesperrte Hosts (Kacheln, Partner-Logos).
- `gewaesserguete.geojson` fehlt im Repo, der Layer erzeugte bei „Alle an“,
  Gemeinde-Steckbrief und Radius-Analyse einen 404 und lehnte das Laden ab.
- `internal.html` ruft `/api/contacts` auf, das mit dem Test-Server `server.py` 404 liefert.

### Links (3)
- `legal/datenschutz.md` und `legal/impressum.md` liefern lokal HTTP 200 (`text/markdown`).
  Die Seiten `datenschutz.html` / `impressum.html` laden sie per `fetch`.
  Dass sie live 404 liefern, passt dazu, dass das öffentliche Release früher über
  das fehlende Build-Skript gebaut wurde: der neue Build nimmt `legal/` ausdrücklich auf
  und bricht ab, wenn die Dateien fehlen. **Live nicht bestätigt.**
- Partner-Logos sind von vier fremden Hosts eingebunden (`www.fiw.rwth-aachen.de`,
  `www.schoellershammer.de`, `wver.de`, `www.rlv.de`). `npm run check:links` wurde wegen
  gesperrter Hosts nicht ausgeführt.

### Tests (2)
Playwright-Suite (`tests/ui-regression`, 153 Tests), VM-Anpassung: lokaler
Chromium-Pfad, 30 s Timeout je Test.
- `main`: Lauf nach 28 Minuten abgebrochen (Timeouts). Von 78 abgeschlossenen Tests
  6 grün, 72 rot.
- Branch, dieselben 78 Tests: **51 grün, 27 rot, 45 Tests von rot auf grün, keine
  Verschlechterung.** Gesamt auf dem Branch: 63 grün, 90 rot (153 Tests).
- Hauptursachen der verbleibenden Fehler (Stichprobe der Fehlermeldungen):
  - 57 Tests in `layer-toggles.spec.js` prüfen Standardzustände und Lazy-/Eager-Listen
    (`tests/ui-regression/layer-data.js`), die nicht mehr zur Konfiguration passen
    (z. B. „wrong initial button class“, „click did not flip the active class“).
  - Tests, die einen Dark-Mode-Schalter erwarten (`window.toggleDarkMode`), obwohl der
    Commit `fe80ca9` ein einziges Theme eingeführt hat.
  - `internal.html` braucht `/api/contacts` (Editor-Backend).
- Die vom Systemtest genannten „47 Fehler“ ließen sich in dieser VM nicht
  reproduzieren; die Fehlerzahl hängt stark von Browser, Netz und Timeouts ab.

### CI / Deploy (1 → 2)
- `.github/workflows/deploy-secure.yml` (nur `main` / manuell) führt Daten-Gate,
  Playwright-Suite und Deploy aus. Die Suite ist rot, damit ist der Deploy rot.
- `deploy_surge.py` ruft `tools/build_public_release.py` auf – die Datei existierte nicht.
- Der Workflow löschte `internal.html` per `sed` aus `.surgeignore`, veröffentlichte also
  die interne Seite.
- Reparatur: Build-Skript mit Allowlist, Workflow deployt `dist_public`.
  In GitHub Actions noch nicht gelaufen, deshalb nur Note 2.

### Sicherheit (2)
- `contacts.geojson`: 345 von 345 Einträgen mit E-Mail-Adresse, im Git-Verlauf.
  `.surgeignore` schließt die Datei vom Surge-Deploy aus; ob sie live erreichbar ist,
  wurde hier nicht geprüft (Host gesperrt). Der Systemtest meldet sie als öffentlich.
- Klartext-Zugangsdaten (`florian` / `AquaRevier2026`) in `playwright.config.js`,
  `server.py`, `editor_backend/` und Tests.
- `contacts_anonymized.geojson` (135) und `contacts_2025_anonymized.geojson` (103):
  0 E-Mail-Adressen. Die Fachdaten-GeoJSON enthalten genau 7 funktionale
  Behörden-Postfächer, keine personenbezogenen Adressen (Stichprobe).
- `dompurify` (Abhängigkeit von jspdf): vorher 3.4.12 mit offenen Advisories,
  jetzt 3.5.0, `npm audit` meldet 0 Schwachstellen. Das gebündelte
  `vendor/jspdf/jspdf.umd.min.js` bindet dompurify nur optional ein.

### Datenqualität (3)
- `python validate_geojson.py --all` endet mit Exit 0, überschreibt aber bei jedem Lauf
  `elwas_raw_data/known_row_counts.json` (Baseline-Update als Nebeneffekt).
- Feature-Zahlen im Repo: 101 Industrieeinleiter (`elwas_einleiter.geojson`),
  60 Kläranlagen, **3746 Grundwassermessstellen** im Layer, 46 Pegel.
  Die Zahl 4410 stammt aus dem Roh-Scrape (`elwas_raw_data/grundwassermessstellen.json`),
  nicht aus der Karte.
- `gewaesserguete.geojson` fehlt; `js/water-quality.js` enthält fest eincodierte
  Beispielwerte für Rur, Inde, Wurm und Erft, die ohne Quellenangabe als
  Gewässergüte angezeigt werden.

## Umgesetzte Fixes (je ein Commit)

| Commit | Fix | Messung |
|---|---|---|
| `2ad2669` | `internal.html`: verwaisten Rest von `updateSidebarCounters` entfernt (SyntaxError) | Konsolenfehler 3 → 0, Karte initialisiert |
| `0e92827` | `internal.html`: `contrastToggle` deklariert | ReferenceError weg |
| `d893f8e` | Tests: Partner-Logo-Hosts im Fixture stubben | CI hängt nicht mehr an fremden Hosts |
| `ae994a2` | `internal.html`: toten Dark-Mode-Block (`themeToggle`) entfernt | ReferenceError weg |
| `90bc4ff` | `tools/build_public_release.py` neu (Allowlist, E-Mail-Gate, `legal/` Pflicht) | Build: 86 Dateien, 41,8 MB, ohne `contacts.*`, `internal.html` |
| `fd6885f` | Workflow deployt `dist_public`, kein Entfernen von `internal.html` aus `.surgeignore` | nicht in CI verifiziert |
| `fc4512a` | `gewaesserguete` bis zur Datenlieferung als `pending` markiert | 404 weg; keine Daten erfunden |
| `f6b944d` | dompurify 3.4.12 → 3.5.0 | `npm audit`: 0 Schwachstellen |

Tests insgesamt: auf `main` 6 von 78 grün, auf dem Branch 51 von 78 (gleiche Tests);
63 von 153 grün im Gesamtlauf.

## Priorisierte Maßnahmen

1. **Kontakte sichern (Sicherheit, sofort):** Prüfen, ob `contacts.geojson` live
   erreichbar ist; Datei aus dem Git-Verlauf entfernen oder Repo privat halten;
   Zugangsdaten rotieren und aus dem Code nehmen (Umgebungsvariablen).
2. **Deploy freigeben (Nutzerentscheidung):** Diesen Branch prüfen und nach `main`
   mergen; danach Workflow einmal manuell starten und `legal/*.md` live prüfen.
3. **Tests an den Ist-Zustand anpassen:** Layer-Listen in `layer-data.js`, Dark-Mode-Tests
   entfernen oder umschreiben, `/api/contacts` im Test-Server bereitstellen.
   Danach `--timeout` und Wiederholungen in der CI prüfen.
4. **Gewässergüte-Daten liefern:** Datei erzeugen, Stichprobe der Werteverteilung prüfen,
   `pending` entfernen; Demo-Werte in `water-quality.js` ersetzen oder kennzeichnen.
5. **Ladezeit:** Doppelte Requests für `kreise_rr` und `grundwassermessstellen`
   beseitigen, große Polygon-Layer (Wasserschutzgebiete, Kanalnetz) lazy laden oder
   vereinfachen (`tools/simplify_geometries.py`), Logo 1,08 MB verkleinern.
6. **Barrierefreiheit:** Buttons/Links benennen (135), Kontraste (14), Touch-Ziele (80).
7. **Hotlinks:** Partner-Logos lokal ablegen.
8. **Datenzahlen klären:** 3746 (Karte) gegen 4410 (Roh-Scrape) erklären, bevor sie
   kommuniziert werden.
