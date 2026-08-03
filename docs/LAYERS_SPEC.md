# API & Layer Spec Reference

This document details all the Web Map Service (WMS) endpoints, layers, and GeoJSON datasets used in the ADB AquaRevier Contact Map Visualizer project.

## WMS Endpoints and Layer Keys

The following WMS services are integrated into the application (`index.html`, `internal.html`, `_extracted.js`):

| Layer Description | WMS URL | Layer Key(s) |
| :--- | :--- | :--- |
| **TopPlusOpen (Base Map)** | `https://sgx.geodatenzentrum.de/wms_topplus_open` | `web` |
| **WebAtlas DE (Base Map, legacy)** | `https://www.wms.nrw.de/geobasis/wms_nw_webatlasde` | `webatlasde` |
| **Verwaltungsgrenzen NRW (Kreise & Land)** | `https://www.wms.nrw.de/geobasis/wms_nw_dvg` | `nw_dvg_la,nw_dvg_k` |
| **Gewässernetz (Flüsse & Seen)** | `https://www.wms.nrw.de/umwelt/gsk3e` | `gsk3e_hauptgewaesser_seen,gsk3e_hauptgewaesser_linien` |
| **Gewässernetz Detailliert** | `https://www.wms.nrw.de/umwelt/gsk3e` | `2,3,4,5,6,8,9,10` |
| **Einzugsgebiete Hydrologisch** | `https://www.wms.nrw.de/umwelt/gsk3e` | `0,11` |
| **Tagebaue & Bergbaufelder** | `https://www.wms.nrw.de/wms/bebu` | `19` |
| **Hochwassergefahrenkarte (HQ extrem)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_nw` |
| **Hochwassergefahrenkarte (HQ 100)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_mw` |
| **Hochwassergefahrenkarte (HQ häufig)** | `https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte` | `Tiefen_Ueberflutungsgebiet_hw` |
| **Starkregengefahrenkarte (Euskirchen)** | `https://starkregen-euskirchen-v11.cismet.de/geoserver/wms` | `starkregen:L_T100_v1.1_depth3857` |
| **Wasserschutzgebiete** | `https://www.wms.nrw.de/umwelt/wsg` | `wsg_festgesetzt_gesamt` |

## GeoJSON Endpoints / Data Sources

The application fetches the following local/static GeoJSON datasets to render vector layers:

- `contacts.geojson`
- `contacts_anonymized.geojson`
- `contacts_2025_anonymized.geojson`
- `elwas_einleiter.geojson`
- `gewaesser_rur_official.geojson`
- `grundwassermessstellen.geojson`
- `grundwasserwiederanstieg.geojson`
- `gsk3c_gew_flaeche.geojson`
- `gsk3c_gew_kanal_plm.geojson`
- `klaeranlagen.geojson`
- `kreise_rr.geojson`
- `kreise_scorecard.geojson`
- `pegel.geojson`
- `querbauwerke.geojson`
- `regenbecken.geojson`
- `rur_einzugsgebiet_outline.geojson`
- `rur_einzugsgebiet_stats.geojson`
- `stauanlagen.geojson`
- `tg_kanalisiert.geojson`
- `tg_natuerlich.geojson`
- `untersuchungsgebiet.geojson`
- `wasserschutzgebiete.geojson`
