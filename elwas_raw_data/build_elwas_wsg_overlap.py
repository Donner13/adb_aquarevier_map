import json
import os
from shapely.geometry import shape, Point
from shapely.prepared import prep

BASE = os.path.dirname(os.path.abspath(__file__))
EINLEITER_PATH = os.path.join(os.path.dirname(BASE), "elwas_einleiter.geojson")
WSG_PATH = os.path.join(os.path.dirname(BASE), "wasserschutzgebiete.geojson")

def main():
    print("Performing Overlap-Check between Industrieeinleiter and Wasserschutzgebieten...")
    if not os.path.exists(EINLEITER_PATH) or not os.path.exists(WSG_PATH):
        print("Missing required files.")
        return

    with open(EINLEITER_PATH, "r", encoding="utf-8") as f:
        einleiter_data = json.load(f)

    with open(WSG_PATH, "r", encoding="utf-8") as f:
        wsg_data = json.load(f)

    # Convert all WSG polygons into shape objects for overlap checks
    # Sort them by zone so Zone I has priority over Zone II, etc., if they overlap
    wsg_zones = []
    for f in wsg_data['features']:
        wsg_zones.append({
            'geometry': shape(f['geometry']),
            'wsg_zone': f['properties'].get('wsg_zone', 'Unbekannt'),
            'areastatus': f['properties'].get('areastatus', 'Unbekannt')
        })

    # Prepare polygons for speed
    for w in wsg_zones:
        w['prepared'] = prep(w['geometry'])

    marked_count = 0
    for feature in einleiter_data['features']:
        coords = feature['geometry']['coordinates']
        point = Point(coords[0], coords[1])

        inside_zone = None
        inside_status = None

        # Check which zone it falls into
        for w in wsg_zones:
            if w['prepared'].contains(point):
                inside_zone = w['wsg_zone']
                inside_status = w['areastatus']
                # If we find Zone I or similar, prioritize it, otherwise continue checking
                if "I" in str(inside_zone):
                    break

        if inside_zone:
            feature['properties']['wsg_zone'] = inside_zone
            feature['properties']['wsg_status'] = inside_status
            marked_count += 1
        else:
            # Clean up if property exists from previous runs
            feature['properties'].pop('wsg_zone', None)
            feature['properties'].pop('wsg_status', None)

    with open(EINLEITER_PATH, "w", encoding="utf-8") as f:
        json.dump(einleiter_data, f, ensure_ascii=False, indent=2)

    print(f"Overlap check complete. Marked {marked_count} out of {len(einleiter_data['features'])} Industrieeinleiter.")

if __name__ == "__main__":
    main()
