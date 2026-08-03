# AquaRevier Map - API & Layer Spec Reference

This document details the configuration of all WMS endpoints, local GeoJSON layers, and mapping layer keys used in the ADB AquaRevier Map Visualizer project. The platform integrates various datasets provided by external authorities (such as LANUV NRW, GD NRW, BKG) as well as internal/pre-processed data.

## WMS (Web Map Service) Endpoints

The map fetches dynamic raster tiles from several official WMS servers to display base maps and environmental overlays.

| Data Source | Service URL | Layer Key(s) | Attribution | Description |
|---|---|---|---|---|
| **TopPlusOpen** | `https://sgx.geodatenzentrum.de/wms_topplus_open` | `web` | &copy; BKG / Geodatenzentrum | Base map provided by the Federal Agency for Cartography and Geodesy (BKG). |
| **Geobasis NRW** | `https://www.wms.nrw.de/geobasis/wms_nw_dvg` | `nw_dvg_la, nw_dvg_k` | Geobasis NRW | NRW administrative boundaries. `nw_dvg_la` for state borders, `nw_dvg_k` for district borders. |
| **LANUV NRW (GSK3E)** | `https://www.wms.nrw.de/umwelt/gsk3e` | `gsk3e_hauptgewaesser_seen, gsk3e_hauptgewaesser_linien` | LANUV NRW | Main rivers and lakes in NRW (Gewässernetz). |
| **LANUV NRW (GSK3E)** | `https://www.wms.nrw.de/umwelt/gsk3e` | `2,3,4,5,6,8,9,10` | LANUV NRW | Detailed minor and piped streams. |
| **LANUV NRW (GSK3E)** | `https://www.wms.nrw.de/umwelt/gsk3e` | `0,11` | LANUV NRW | Hydrological catchments (watersheds). |
| **GD NRW** | `https://www.wms.nrw.de/wms/bebu` | `19` | GD NRW | Mining authorizations and surface mines (Tagebaue & Bergbaufelder). Shows all authorizations as active subdivision was removed. |
| **LANUV NRW (HQ häufig)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_hw` | LANUV NRW | High probability flood hazard zones (HWGK). |
| **LANUV NRW (HQ100)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_mw` | LANUV NRW | Medium probability flood hazard zones (HQ100). |
| **LANUV NRW (HQ extrem)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_nw` | LANUV NRW | Low probability / extreme flood hazard zones. |
| **Kreis Euskirchen** | `https://starkregen-euskirchen-v11.cismet.de/geoserver/wms` | `starkregen:L_T100_v1.1_depth3857` | Kreis Euskirchen / cismet GmbH | Heavy rainfall hazard maps for Kreis Euskirchen (Pluvial flooding). |

## Local GeoJSON & ELWAS Layers

In addition to WMS layers, the map renders vector data from static GeoJSON files (many derived from ELWAS). These provide interactivity like tooltips and filtering.

- `contacts.geojson` / `contacts_anonymized.geojson`: Point data for stakeholders and contacts.
- `wasserschutzgebiete.geojson`: Water protection areas.
- `grundwasserwiederanstieg.geojson`: Groundwater level recovery models.
- `untersuchungsgebiet.geojson`: Official study area boundaries.
- `rur_einzugsgebiet_outline.geojson`: Rur catchment area boundaries.
- `gewaesser_rur_official.geojson`: Official Rur waterways.
- `tg_kanalisiert.geojson` & `tg_natuerlich.geojson`: Segmented water body properties (canalized vs natural).
- `gsk3c_gew_flaeche.geojson` & `gsk3c_gew_kanal_plm.geojson`: Supplementary waterway details.
- `kreise_rr.geojson` & `kreise_scorecard.geojson`: District regions for the Rheinisches Revier and choropleth comparison layers.
- `rur_einzugsgebiet_stats.geojson`: Extracted catchment statistics (factories & wastewater).

### ELWAS Specific Datasets:
- `elwas_einleiter.geojson`: Industrial dischargers.
- `klaeranlagen.geojson`: Wastewater treatment plants.
- `grundwassermessstellen.geojson`: Groundwater monitoring stations (3700+ points).
- `pegel.geojson`: Water level monitoring stations.
- `stauanlagen.geojson`: Dams and reservoirs.
- `regenbecken.geojson`: Rainwater retention basins.
- `querbauwerke.geojson`: Transverse structures (weirs, etc.).

## UI Layer Map Keys (`data-layer-name`)

These are the internal names used in the frontend's layer control and filter buttons (via the `data-layer-name` attribute or UI dictionary) to toggle layers on and off.

- `💧 Grundwassermessstellen (ELWAS, 3700+)`
- `📈 Grundwasserwiederanstieg (Modell)`
- `📏 Pegel (ELWAS)`
- `⛰️ Stauanlagen (ELWAS)`
- `🌧️ Regenbecken/-entlastungsanlagen (ELWAS)`
- `🧱 Querbauwerke (ELWAS)`
- `⚡ H₂-Elektrolyseure NRW`
- `🧮 Einzugsgebiet-Statistik (Betriebe & Abwasser)`
- `📊 Kreis-Vergleich (Choroplethenkarte)`
- `Rur Einzugsgebiet (Hydrologisch)`
- `Wasserschutzgebiete (LANUV)`
- `Wassergewinnungsgebiete (Zone I)`
- `Tagebaue & Bergbaufelder (GD)`
- `Eigene Gewässer mit Namen`
- `Landkreisgrenzen (Rheinisches Revier)`
- `Kreisgrenzen (Schwarz gestrichelt)`
- `HQ häufig (LANUV)`
- `HQ100 (LANUV)`
- `HQ extrem (LANUV)`
- `Starkregen Euskirchen`
