import requests
import json
import os

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def fetch_boundary():
    print("Fetching administrative boundaries for Rheinisches Revier...")
    # Query for the 6 core districts of the Rheinisches Revier
    query = """
    [out:json][timeout:30];
    (
      relation["boundary"="administrative"]["admin_level"="6"]["name"~"Städteregion Aachen|Kreis Düren|Kreis Heinsberg|Rhein-Erft-Kreis|Rhein-Kreis Neuss|Mönchengladbach"];
    );
    out geom;
    """
    
    headers = {'User-Agent': 'AquaRevierMapBuilder/1.0 (dtunder@gmail.com)'}
    response = requests.post(OVERPASS_URL, data={'data': query}, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching boundary: {response.status_code}")
        return
        
    data = response.json()
    features = []
    
    for element in data.get('elements', []):
        if element.get('type') == 'relation':
            # Extract outer ways geometry
            ways = []
            for member in element.get('members', []):
                if member.get('type') == 'way' and member.get('role') == 'outer':
                    geom = member.get('geometry', [])
                    if geom:
                        poly_coords = [[pt['lon'], pt['lat']] for pt in geom]
                        ways.append(poly_coords)
            
            # Stitch outer ways into closed polygons
            stitched_polygons = []
            segments = [list(w) for w in ways if len(w) > 1]
            while segments:
                current = segments.pop(0)
                stuck = True
                while stuck and segments:
                    stuck = False
                    for i, seg in enumerate(segments):
                        # check ends
                        if abs(current[-1][0] - seg[0][0]) < 1e-5 and abs(current[-1][1] - seg[0][1]) < 1e-5:
                            current.extend(seg[1:])
                            segments.pop(i)
                            stuck = True
                            break
                        elif abs(current[-1][0] - seg[-1][0]) < 1e-5 and abs(current[-1][1] - seg[-1][1]) < 1e-5:
                            current.extend(reversed(seg[:-1]))
                            segments.pop(i)
                            stuck = True
                            break
                        elif abs(current[0][0] - seg[-1][0]) < 1e-5 and abs(current[0][1] - seg[-1][1]) < 1e-5:
                            current = seg[:-1] + current
                            segments.pop(i)
                            stuck = True
                            break
                        elif abs(current[0][0] - seg[0][0]) < 1e-5 and abs(current[0][1] - seg[0][1]) < 1e-5:
                            current = list(reversed(seg[1:])) + current
                            segments.pop(i)
                            stuck = True
                            break
                stitched_polygons.append(current)
            
            if stitched_polygons:
                features.append({
                    "type": "Feature",
                    "properties": {
                        "name": element.get('tags', {}).get('name', 'Bezirk')
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [[poly] for poly in stitched_polygons]
                    }
                })
                
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open("untersuchungsgebiet.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    print("Saved untersuchungsgebiet.geojson successfully.")

def fetch_rivers():
    print("Fetching rivers (Rur, Inde, Wurm, Erft, Maas, Niers, Schwalm)...")
    # Query for major rivers in the region
    query = """
    [out:json][timeout:30];
    (
      way["waterway"="river"]["name"~"Rur|Inde|Wurm|Erft|Maas|Niers|Schwalm"](50.4,5.8,51.5,6.9);
    );
    out geom;
    """
    
    headers = {'User-Agent': 'AquaRevierMapBuilder/1.0 (dtunder@gmail.com)'}
    response = requests.post(OVERPASS_URL, data={'data': query}, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching rivers: {response.status_code}")
        return
        
    data = response.json()
    features = []
    
    # Group way segments by river name to simplify features
    river_segments = {}
    for element in data.get('elements', []):
        if element.get('type') == 'way':
            name = element.get('tags', {}).get('name')
            geom = element.get('geometry', [])
            if name and geom:
                coords = [[pt['lon'], pt['lat']] for pt in geom]
                if name not in river_segments:
                    river_segments[name] = []
                river_segments[name].append(coords)
                
    for name, segments in river_segments.items():
        for segment in segments:
            features.append({
                "type": "Feature",
                "properties": {
                    "name": name,
                    "type": "Fluss"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": segment
                }
            })
            
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open("gewaesser.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    print("Saved gewaesser.geojson successfully.")

if __name__ == "__main__":
    fetch_boundary()
    fetch_rivers()
