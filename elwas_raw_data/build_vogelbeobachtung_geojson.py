import json
import os

ROOT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'vogelbeobachtungsgebiete.geojson')

features = [
    {
      "type": "Feature",
      "properties": {
        "name": "Rursee (Schwammenauel)",
        "ebird_url": "https://ebird.org/hotspot/L3917894"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.4388, 50.6385]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Wurmtal bei Herzogenrath",
        "ebird_url": "https://ebird.org/hotspot/L4640103"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.1105, 50.8258]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Sophienhöhe",
        "ebird_url": "https://ebird.org/hotspot/L3518335"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.4528, 50.9238]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Barmener Baggersee",
        "ebird_url": "https://ebird.org/hotspot/L4597402"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.3021, 50.9542]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Eisvogel-Habitat Rurauen",
        "ebird_url": "https://ebird.org/region/DE-NW?yr=all"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.4800, 50.8000]
      }
    }
]

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open(ROOT_PATH, "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2, ensure_ascii=False)

print(f"Generated {ROOT_PATH} with {len(features)} features.")
