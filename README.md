# ADB AquaRevier Contact Map Visualizer & QGIS Integration

Dieses Tool visualisiert die Akteure aus dem Excel-Datensatz `ADB_AquaRevier` auf einer interaktiven Karte sowie in **QGIS**. Es beinhaltet zusätzlich amtliche Geodaten des Landes NRW (Grenzen, Landkreise, Flüsse und Gewässer).

Es gibt nun zwei Versionen der Web-Karte:
1. 🌐 **Öffentliche Version (Anonymisiert)**: `index.html` (lädt `contacts_anonymized.geojson`, zeigt nur Institutionen ohne persönliche Details, fasst geografische Überschneidungen zusammen).
2. 🔒 **Interne Version (Vollzugriff & Editor)**: `internal.html` (lädt `contacts.geojson`, zeigt alle Kontaktdetails und ermöglicht das Hinzufügen, Bearbeiten und Löschen von Akteuren).

---

## 🚀 Schnellstart

### 1. Server starten
Falls der Server nicht bereits im Hintergrund läuft, starte den Webserver im Projektverzeichnis:

```powershell
python C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\server.py
```

Öffne anschließend deinen Browser unter:
👉 Öffentliche Karte: **[http://localhost:8000](http://localhost:8000)**
👉 Interne Verwaltungskarte: **[http://localhost:8000/internal.html](http://localhost:8000/internal.html)**

---

## 🗺️ Kartenfunktionen im Web-Interface

- **9 Akteursgruppen**: Farblich codiert nach den Gruppen im Excel-Datensatz:
  - 🔴 **Behörde**
  - 🟢 **Einzelakteure**
  - 🔵 **Forschung**
  - 🟡 **Gebietskörperschaft**
  - 🟣 **Gewerbe/ Industrie**
  - 🟢 **Landwirtschaft**
  - 💗 **Netzwerk/ Multiplikator**
  - 🟠 **Ver-/ Entsorger**
  - 🟣 **Sonstige**
- **Suchen & Filtern**: Durchsuche alle 281 Kontakte live nach Namen, E-Mail, Notizen oder filtere Gruppen über die Klick-Buttons.
- **NRW Geodaten-Layer**: Oben rechts auf der Karte kannst du über das Layer-Symbol folgende Dienste ein- und ausblenden:
  - **Landkreisgrenzen & Landesgrenze NRW** (Geobasis NRW WMS)
  - **Flüsse & Gewässernetz** (LANUV NRW WMS)
  - **Tagebaue & Bergbaufelder** (Geologischer Dienst NRW WMS - zeigt Bergbauberechtigungen wie Garzweiler, Hambach, Inden)
  - **Wasserschutzgebiete** (LANUV NRW WMS - zeigt festgesetzte Wasserschutzzonen)
  - **Hochwassergefahrenkarten** (LANUV NRW WMS) & **Starkregengefahrenkarten** (Kommunal)
  - **Umschaltbare Basiskarten** (Dunkel, OSM-Standard, Offizielle NRW-Karte)

---

## 🗺️ QGIS Integration & Geodaten hinzufügen

In QGIS kannst du sowohl deine Kontakte-Punkte als auch dieselben hochauflösenden NRW-Geodaten direkt einbinden:

### 1. Kontakte-Layer laden
1. Ziehe die Datei `contacts.geojson` per Drag-and-drop aus dem Explorer in dein QGIS-Projekt.
   *(Pfad: `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\contacts.geojson`)*
2. Um den Layer automatisch alle 2 Sekunden zu aktualisieren, mache einen Rechtsklick auf den Layer -> **Eigenschaften** -> **Rendering** -> **Interval-basiertes Laden** aktivieren und auf **2,0 Sekunden** einstellen.

### 2. Styling nach Akteursgruppen in QGIS
1. Mache einen Rechtsklick auf den `contacts`-Layer -> **Eigenschaften** -> **Symbolisierung**.
2. Ändere die Dropdown-Auswahl ganz oben von *Einzelsymbol* auf **Kategorisiert**.
3. Wähle als Spalte/Wert das Feld `group` aus und klicke unten auf **Klassifizieren**.

---

### 3. NRW-Grenzen, Gewässer, Tagebaue und Wasserschutzgebiete (WMS) in QGIS einbinden

Du kannst die offiziellen NRW-Karten-Feeds direkt in QGIS als Hintergrundlayer hinzufügen:

#### A. Landkreisgrenzen & Verwaltungsgrenzen NRW (WMS):
- **Name**: `Geobasis NRW Verwaltungsgrenzen`
- **URL**: `https://www.wms.nrw.de/geobasis/wms_nw_dvg`
- **Empfohlene Layer**: `nw_dvg_la` (Landesgrenze), `nw_dvg_k` (Kreisgrenzen)

#### B. Flüsse & Gewässer NRW (WMS):
- **Name**: `LANUV NRW Gewässernetz`
- **URL**: `https://www.wms.nrw.de/umwelt/gsk3e`
- **Empfohlene Layer**: `gsk3e_hauptgewaesser_seen` (Seen), `gsk3e_hauptgewaesser_linien` (Flüsse)

#### C. Tagebaue & Bergbau-Berechtigungen (WMS):
- **Name**: `GD NRW Bergbauberechtigungen`
- **URL**: `https://www.wms.nrw.de/gd/wms_nw_bergbauberechtigungen`
- **Empfohlener Layer**: `nw_bergbauberechtigungen_gewinnend` (Aktive Bergbauberechtigungen / Tagebaufelder)

#### D. Wasserschutzgebiete (WMS):
- **Name**: `LANUV NRW Wasserschutzgebiete`
- **URL**: `https://www.wms.nrw.de/umwelt/wsg`
- **Empfohlener Layer**: `wsg_festgesetzt_gesamt` (Festgesetzte Wasserschutzzonen)


#### E. Hochwassergefahrenkarten (WMS):
- **Name**: `LANUV NRW HW_Gefahrenkarte`
- **URL**: `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte`
- **Empfohlene Layer**: `Tiefen_Ueberflutungsgebiet_nw` (HQ häufig), `Tiefen_Ueberflutungsgebiet_mw` (HQ 100), `Tiefen_Ueberflutungsgebiet_hw` (HQ extrem)

#### F. Starkregengefahrenkarten (WMS, beispielhaft Kreis Euskirchen):
- **Name**: `Starkregen Kreis Euskirchen`
- **URL**: `https://starkregen-euskirchen-v11.cismet.de/geoserver/wms`
- **Empfohlener Layer**: `starkregen:L_T100_v1.1_depth3857`

*Anleitung zur Einbindung:* In QGIS im Menü **Layer -> Layer hinzufügen -> WMS/WMTS-Layer hinzufügen...** wählen, auf **Neu** klicken, Namen und URL eintragen, mit **OK** speichern, **Verbinden** klicken, den gewünschten Layer auswählen und auf **Hinzufügen** klicken.
