import re

with open('js/app.js', 'r') as f:
    content = f.read()

# "Kennzahlen fallen ohne nachgewiesenes stats-/geojsonData-Schema weitgehend auf „Keine Daten“ bzw. 0 zurück; die Fallback-Feldnamen sind nicht abgesichert."
# Let's ensure the fallback logic in window.openStakeholderModal is robust.

# Look at:
#         if (pegelAnzahl === "Keine Daten" && window.geojsonData && window.geojsonData.pegel && Array.isArray(window.geojsonData.pegel.features)) {
#              pegelAnzahl = window.geojsonData.pegel.features.filter(f => f.properties && f.properties.gemeinde === gemeindeName).length;
#         }

# Is it `properties.gemeinde` or `properties.Gemeinde` or something else?
# Let's check a sample of geojsonData.
