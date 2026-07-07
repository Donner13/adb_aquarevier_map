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
