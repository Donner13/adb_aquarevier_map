# JULES TASK LIST — AquaRevier Interne Editor-Version (internal.html)
## Für Jules: 20 aufgeteilte GIS & Customizer Feature-Aufgaben

> **Wichtig**: Dieses Repo ist die **Entwicklungsversion** der AquaRevier Akteurskarte.
> Das Ziel ist es, die interne Version (`internal.html`) so anzupassen, dass der Nutzer *wirklich alles* (Kartenansicht, Stile, Logos, Grenzen, Datenimport/-export) direkt über die Weboberfläche konfigurieren, im Server abspeichern und deployen kann.

---

### 🎯 20 Konfigurations- und Styling-Aufgaben für Jules

#### [ ] TASK-01: Standard-Kartenansicht konfigurieren
Ermögliche es dem Nutzer, den Standard-Mittelpunkt (Breiten-/Längengrad) und das standardmäßige Zoom-Level der Karte beim Start über das Customizer-Panel festzulegen, zu speichern und zu laden.

#### [ ] TASK-02: Standard-Basiskarte & Custom Tile-URL festlegen
Erlaube die Auswahl der standardmäßig aktiven Basiskarte (Dunkel, Hell, OSM, NRW) und füge ein Textfeld hinzu, um eine eigene Tile-Layer-URL (z. B. Mapbox, Stadia) als Basiskarte zu laden.

#### [ ] TASK-03: Eigene SVG/PNG-Icons für Marker hochladen
Erlaube es dem Nutzer, für Akteursgruppen oder einzelne Akteure eigene Bilddateien (SVG, PNG) als Marker-Symbole auf der Karte hochzuladen und zuzuweisen.

#### [ ] TASK-04: Akteur-Hover-Tooltips anpassen
Füge Optionen hinzu, um festlegen zu können, welche Informationen im Tooltip angezeigt werden, wenn man mit der Maus über einen Marker fährt (z. B. nur Name, Name + Gruppe oder alle Details).

#### [ ] TASK-05: Kreisgrenzen (Dashed Line Style) konfigurieren
Exponiere Styling-Eigenschaften für die 7 Kreise des Rheinischen Reviers (Farbe, Linienstärke und Strichmuster/Dash-Array wie "6, 4" oder "1, 5" für Punkte).

#### [ ] TASK-06: Untersuchungsgebiet-Hintergrund (Fill Style) anpassen
Erlaube die Anpassung des Untersuchungsgebiets-Overlays: Randfarbe, Füllfarbe, Linienstärke und die Füll-Deckkraft (Fill Opacity) stufenlos über Schieberegler.

#### [ ] TASK-07: Hydrologisches Einzugsgebiet (Rur Watershed) anpassen
Stelle Regler bereit für das Rur-Einzugsgebiet-Overlay, um Randfarbe, Füllfarbe, Linienstärke und Deckkraft anzupassen und live auf der Karte zu rendern.

#### [ ] TASK-08: Gewässer-Vektoren (Flüsse) anpassen
Ermögliche es, die Farbe (z. B. verschiedene Blautöne), Linienstärke und Transparenz der Gewässerlinien auf der Karte stufenlos anzupassen.

#### [ ] TASK-09: Gewässer-Beschriftung (River Labels) stylen
Füge Text- und Farb-Steuerungen für die Schriftgröße, Schriftfarbe und Schattenfarbe der Flussnamen-Labels (z. B. "Rur", "Inde", "Wurm") hinzu.

#### [ ] TASK-10: WMS-Overlays anpassen (Reihenfolge & Transparenz)
Erlaube es dem Nutzer, die Deckkraft (Opacity) der WMS-Karten-Feeds (Wasserschutzgebiete, Tagebaue) per Schieberegler einzustellen und deren Layer-Reihenfolge (Z-Index) zu ändern.

#### [ ] TASK-11: Custom WMS-Server hinzufügen
Implementiere ein Formular, um eigene offizielle WMS-Feeds zu abonnieren (Eingabe von Name, WMS-URL, Layer-Namen und Transparenz) und in der Layer-Auswahl anzuzeigen.

#### [ ] TASK-12: Logo-Manager für Akteure
Ermögliche es, jedem Akteur direkt im Bearbeitungsformular ein Logo (Bild-URL oder Datei-Upload) zuzuordnen, welches als Logo-Callout-Marker auf der Karte erscheint.

#### [ ] TASK-13: Legenden-Editor (Gruppen-Aliase)
Erlaube es dem Nutzer, die Namen der Gruppen in der Legende und den Filtern umzubenennen (z. B. "Forschung" zu "Wissenschaft & Hochschule") und abzuspeichern.

#### [ ] TASK-14: Such-Index konfigurieren
Erlaube die Auswahl, welche Datenfelder (Name, Beschreibung, E-Mail, Telefon, Ort) bei der Schnellsuche in der Sidebar durchsucht werden sollen.

#### [ ] TASK-15: Design-Themes anpassen (Light / Dark Mode UI)
Exponiere die CSS-Farbvariablen der Sidebar-UI (Hintergrundfarbe, Schriftfarbe, Panel-Rahmen und Akzentfarbe) über Farbpicker, um das Interface individuell anzupassen.

#### [ ] TASK-16: Stileinstellungen exportieren
Füge einen Button hinzu, um ausschließlich das `styleSettings`-Objekt als `style_settings.json` herunterzuladen (Backup der Kartengestaltung).

#### [ ] TASK-17: Stileinstellungen importieren
Ermögliche den Upload einer zuvor exportierten `style_settings.json`, um das gesamte Design- und GIS-Styling wiederherzustellen.

#### [ ] TASK-18: CSV-Datenimport für Akteure
Füge einen CSV-Importer hinzu, mit dem neue Akteure per Datei hochgeladen werden können (mit Zuordnung der Spalten: Name, Lat, Lng, Gruppe, E-Mail, Telefon).

#### [ ] TASK-19: CSV-Datenexport (Vollständige PII)
Ermögliche den Export der vollständigen, nicht-anonymisierten Kontaktdaten (inklusive E-Mail und Telefon) als CSV-Datei direkt aus dem Editor.

#### [ ] TASK-20: Stapelverarbeitung (Batch Edit / Delete)
Füge Checkboxen in die Akteursliste der Sidebar ein, um mehrere Akteure gleichzeitig auszuwählen und gemeinsam zu löschen oder einer anderen Gruppe zuzuweisen.

#### [ ] TASK-21: Editor-Backend permanent hosten (kein localhost + SSH-Tunnel mehr)
**Problem:** `internal.html` speichert Änderungen über `POST /api/contacts` und deployed über `POST /api/deploy` gegen `server.py` (`http.server`, Port 8000). Das läuft nur lokal auf einem Entwickler-Rechner; öffentlicher Zugriff geht bisher nur über einen provisorischen, kurzlebigen SSH-Tunnel (`get_tunnel_url.py` → localhost.run). Ziel: eine dauerhaft erreichbare, im Repo versionierte Editor-Instanz, die genauso funktioniert wie `server.py` lokal, aber permanent über eine feste URL läuft.

**Aufgabe:**
1. Portiere `server.py`'s zwei Endpunkte (`POST /api/contacts` → schreibt `contacts.geojson` + `contacts_anonymized.geojson`; `POST /api/deploy` → führt `deploy_surge.py` aus und gibt stdout/stderr + Exit-Code als JSON zurück) in eine eigenständige, containerisierbare App unter einem **neuen** Ordner `editor_backend/` (z. B. FastAPI oder unverändert `http.server`, aber mit `Dockerfile`).
2. Füge `editor_backend/Dockerfile` und `editor_backend/render.yaml` (Render.com Blueprint, kostenloser Web-Service-Tier) hinzu, sodass ein `git push` auf `main` automatisch einen Rebuild/Redeploy des Editor-Backends auslöst (Render's GitHub-Integration übernimmt das nach einmaligem Connect — kein zusätzlicher Workflow-Code nötig, aber Blueprint muss korrekt sein).
3. Der `POST /api/deploy`-Endpunkt im neuen Backend soll **nicht mehr `deploy_surge.py` lokal ausführen**, sondern stattdessen per `git commit` + `git push` auf `main` im selben Repo pushen (Backend braucht dafür ein Deploy-Key/PAT als Env-Var `GIT_PUSH_TOKEN`, niemals hart kodieren) — das bestehende `.github/workflows/deploy-secure.yml` übernimmt danach automatisch den echten Live-Deploy auf `adb-aquarevier-secure.surge.sh`. So bleibt exakt ein Deploy-Pfad bestehen (nicht zwei parallele).
4. `internal.html` weiterhin unverändert lassen bis auf die Basis-URL der Fetch-Calls (`/api/contacts`, `/api/deploy`) — die soll relativ bleiben, damit sowohl lokal (`server.py`) als auch remote (Render) ohne Codeänderung funktioniert.
5. Schreibe `editor_backend/README.md` mit: welche Env-Vars nötig sind, wie man `GIT_PUSH_TOKEN` als Secret in Render setzt, und wie man die feste Editor-URL nach Deploy findet.
6. **Keine bestehenden Dateien überschreiben** (`server.py`, `deploy_surge.py`, `internal.html` bleiben als lokale Fallback-Variante erhalten) — alles Neue kommt in `editor_backend/`.
7. Tests: mind. ein Test, der `POST /api/contacts` mit Beispiel-JSON aufruft und prüft, dass die GeoJSON-Datei korrekt geschrieben wird (ohne echten Git-Push auszuführen — das per Mock/Dry-Run-Flag testen).
8. Pre-Commit-Schritte durchführen, committen, pushen, Ergebnis (inkl. wie man den Render-Service verbindet) zusammenfassen.
