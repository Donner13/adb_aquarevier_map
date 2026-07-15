# Kurzanleitung: Akteurs-Datenbank selbst pflegen

Hallo Florian,

hier eine kurze Einführung, wie du die Kontakte/Akteure künftig selbst
verwalten kannst, ohne dass du dafür jedes Mal Shubham brauchst.

## 1. Die zwei Links

| Was | Link | Zugang |
|---|---|---|
| **Öffentliche Karte** – das, was jeder sieht (nur Institutionen, keine privaten Kontaktdaten) | http://adb-aquarevier-secure.surge.sh | offen, kein Login |
| **Editor** – hier bearbeitest du die vollständigen Daten | https://c9cd747508617e.lhr.life/internal.html | Benutzer: `florian`<br>Passwort: `Wasser2026Rur` |

**Wichtig:** Der Editor-Link ist aktuell noch **provisorisch** – er läuft nur,
solange Shubhams Rechner an ist und der Dienst dort läuft. Sobald die
dauerhafte Version fertig eingerichtet ist, bekommst du eine neue, feste
Editor-Adresse (Login bleibt gleich). Bis dahin bitte kurz bei Shubham
nachfragen, falls der Link mal nicht erreichbar ist.

## 2. Akteur hinzufügen / bearbeiten / löschen

Im Editor:
1. Auf der Karte auf den gewünschten Punkt klicken (zum Bearbeiten) oder
   den "Neuer Akteur"-Button nutzen (zum Hinzufügen).
2. Felder ausfüllen: Name, Gruppe (z. B. Gewerbe/Industrie, Forschung,
   Behörde …), Branche, Beschreibung, Telefon, E-Mail.
3. Speichern klicken.

Beim Speichern passiert automatisch:
- Die vollständigen Daten werden gesichert (nur intern sichtbar).
- Eine anonymisierte Version für die öffentliche Karte wird neu erzeugt
  (bei Gewerbe/Industrie-Akteuren ohne echten Namen, nur mit Branche).

## 3. Änderungen veröffentlichen

Über den "Veröffentlichen/Deploy"-Button im Editor werden die Änderungen
automatisch auf die öffentliche Karte übernommen (dauert ca. 1–2 Minuten) –
dafür ist kein technisches Vorwissen nötig.

## 4. Logos für Institutionen/Firmen

Feste Logo-Boxen (z. B. RWTH ISA, RWTH IWW, RWTH GI, WVER, Tillmann …)
sind im Kartencode hinterlegt und erscheinen automatisch, sobald der
Institutions-/Firmenname im Akteurs-Namen enthalten ist. Für neue
Logo-Partner sag einfach kurz Bescheid, dann bauen wir das mit ein.

## 5. Was ist im mitgeschickten Ordner?

Zusätzlich zum Online-Zugang bekommst du eine Kopie aller Projektdateien,
falls du selbst lokal reinschauen willst (z. B. `contacts.geojson` in QGIS
laden, siehe Projekt-`README.md` im Ordner):

- `index.html` / `internal.html` – die Karten-Seiten selbst
- `contacts.geojson` – vollständige Kontaktdaten
- `contacts_anonymized.geojson` – die öffentliche, anonymisierte Version
- `logos/` – alle hinterlegten Logo-Dateien
- `README.md` – technische Doku (Kartenfunktionen, QGIS-Einbindung, WMS-Layer)

Diese lokale Kopie aktualisiert sich **nicht** automatisch, wenn du im
Editor etwas änderst – für die aktuellen Daten immer den Editor-Link
benutzen. Die Kopie ist nur ein Backup / für die QGIS-Nutzung gedacht.

## 6. Wichtig

- Bitte **keine** privaten Kontaktdaten (Telefon/E-Mail) oder den
  Editor-Zugang an Dritte weitergeben – die interne Datei enthält alles,
  die öffentliche Karte zeigt nur Institutionen.
- Bei Fragen oder falls sich der Editor komisch verhält: kurz melden statt
  selbst an den Rohdaten zu basteln.

Viele Grüße
