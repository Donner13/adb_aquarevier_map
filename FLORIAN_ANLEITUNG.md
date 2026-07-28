# Kurzanleitung: Akteurs-Datenbank & Wasserkarte selbst pflegen

Hallo Florian,

hier eine Übersicht, wie du die Kontakte/Akteure verwalten und die neuen Kartenfunktionen im AquaRevier nutzen kannst.

## 1. Die zwei Links

| Was | Link | Zugang |
|---|---|---|
| **Öffentliche Karte** – das, was jeder sieht (nur Institutionen, keine privaten Kontaktdaten) | https://adb-aquarevier-secure.surge.sh | offen, kein Login |
| **Editor** – hier bearbeitest du die vollständigen Daten & veröffentlichst Änderungen | https://editor-backend-aquarevier.onrender.com/internal.html (oder lokal über `editor_backend/server.py`) | Benutzer: `florian`<br>Passwort: `Wasser2026Rur` |

## 2. Neue Analyse- & Arbeitsfunktionen im Überblick

1. **Command Palette (`Cmd/Ctrl + K`):** Schnellsuche für Kommunen, Layer, Akteure und Aktionen.
2. **Umkreis- & Radius-Analyse (🎯):** Radius wählen (1–25 km), Punkt per Mausklick oder manuell per Lat/Lng-Tastatureingabe setzen und alle Akteure/Messstellen in Reichweite ermitteln.
3. **Gemeinde-Steckbrief (🏛️):** Gemeinde auswählen und ein komplettes Dossier mit Infrastruktur-Objekten, Pegeln und Akteuren als Modal anzeigen.
4. **Grundwasser-Zeitraffer (⏳):** Interaktiver Schieberegler (2000–2030) zur Visualisierung von Modell-Trends des Grundwasserwiederanstiegs (klar als Simulation ausgewiesen).
5. **Universal-Suche & Glossar:** Direktsuche über alle Layer und Fachbegriffe mit Erklär-Popups (ℹ️ Laien-Modus).
6. **Lesezeichen (🔖) & QR-Sharing (🔗):** Beliebige Kartenausschnitte und aktive Layer als Lesezeichen speichern oder als QR-Code / Deep-Link teilen.
7. **Berichts- & Sprechzettel-Export (📊):** PDF-Bericht mit Kartenausschnitt oder Sprechzettel für Termine auf Knopfdruck generieren.
8. **Feedback-Kanal (⚠️):** Bei jedem Datenobjekt im Popup direkt Korrekturhinweise vorbereiten und an das GitHub-Feedback-Repo übermitteln.

## 3. Akteur hinzufügen / bearbeiten / löschen

Im Editor (`internal.html`):
1. Auf der Karte auf den gewünschten Punkt klicken (zum Bearbeiten) oder den "Neuer Akteur"-Button nutzen (zum Hinzufügen).
2. Felder ausfüllen: Name, Gruppe (z. B. Gewerbe/Industrie, Forschung, Behörde …), Branche, Beschreibung, Telefon, E-Mail.
3. **Speichern** klicken: Die Speicherung erfolgt automatisch gedrosselt und atomar mit Backup.

## 4. Änderungen veröffentlichen

Über den Button **"🚀 Karte veröffentlichen (Deploy)"** im Editor werden die Änderungen automatisch auf die öffentliche Karte übernommen.

## 5. Logos & Datenschutz

- Feste Logo-Boxen (RWTH ISA, RWTH IWW, RWTH GI, WVER, Tillmann …) werden automatisch anhand des Namens zugeordnet.
- Private Kontaktdaten (Telefon/E-Mail) bleiben im öffentlichen Portal automatisch anonymisiert.

## 6. Wichtig

- Bitte **keine** privaten Kontaktdaten (Telefon/E-Mail) oder den
  Editor-Zugang an Dritte weitergeben – die interne Datei enthält alles,
  die öffentliche Karte zeigt nur Institutionen.
- Bei Fragen oder falls sich der Editor komisch verhält: kurz melden statt
  selbst an den Rohdaten zu basteln.

Viele Grüße
