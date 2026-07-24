# Rechercheprotokoll Starkregengefahrenkarten (Pluvial) der 7 Kreise im Rheinischen Revier

| Kreis | Portal-URL | WMS gefunden? | Endpoint/Layer-Name | CORS/embeddable? | Notiz |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Kreis Euskirchen | https://starkregen-euskirchen-v11.cismet.de/ | Ja | `https://starkregen-euskirchen-v11.cismet.de/geoserver/wms`, Layer: `starkregen:L_T100_v1.1_depth3857` (stellvertretend) | Ja | Cismet GeoServer WMS |
| Städteregion Aachen | https://starkregengefahrenkarten-staedteregion-aachen.cismet.de/ | Nein | N/A | N/A | WMS-Endpoint nicht ermittelbar, leitet keine Requests oder ist blockiert. "🔗 extern" Fallback. |
| Kreis Düren | https://starkregengefahrenkarten-kreis-dueren.cismet.de/ | Nein | N/A | N/A | WMS-Endpoint nicht ermittelbar, leitet keine Requests oder ist blockiert. "🔗 extern" Fallback. |
| Kreis Heinsberg | https://www.kreis-heinsberg.de/ (Suche Geoportal) | Nein | N/A | N/A | Kein direkter WMS ermittelbar. "🔗 extern" Fallback. |
| Rhein-Erft-Kreis | https://www.geoportal-rhein-erft-kreis.de/ | Nein | N/A | N/A | Kein direkter WMS ermittelbar. "🔗 extern" Fallback. |
| Rhein-Kreis Neuss | https://geoportal.rhein-kreis-neuss.de/ | Nein | N/A | N/A | Kein direkter WMS ermittelbar. "🔗 extern" Fallback. |
| Mönchengladbach | https://geoportal.moenchengladbach.de/ | Nein | N/A | N/A | Kein direkter WMS ermittelbar. "🔗 extern" Fallback. |

**Fazit:** Nur für den Kreis Euskirchen konnte ein frei zugänglicher, einbettbarer WMS-Endpoint gefunden werden. Für die anderen 6 Kreise/Städte wird gemäß Spezifikation der Fallback "🔗 extern" (window.open() im neuen Tab) implementiert, da keine zuverlässigen, offenen WMS-Dienste vorliegen, die ohne Authentifizierung oder spezielles Session-Handling in Leaflet eingebunden werden können.

*Hinweis gem. Abbruchbedingung:* Da weniger als 3 von 7 Kreisen eine echte einbettbare Quelle haben, ist dies hiermit dokumentiert und wird im Commit entsprechend erwähnt.
