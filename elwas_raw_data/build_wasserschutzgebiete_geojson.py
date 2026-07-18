import json
import os
import shutil
from shapely.geometry import shape, mapping
from shapely.prepared import prep
import shapefile
import pyproj

# --- Start: Copied from convert_shapefiles.py ---
def convert_shp_to_geojson(shp_path, geojson_path):
    print(f"Converting {shp_path} to {geojson_path}...")
    sf = shapefile.Reader(shp_path, encoding="cp1252")
    
    # Projection transformer: EPSG:25832 -> EPSG:4326
    transformer = pyproj.Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)
    
    features = []
    fields = [f[0] for f in sf.fields[1:]] # Skip DeletionFlag
    
    for shape_rec in sf.shapeRecords():
        shape = shape_rec.shape
        record = shape_rec.record
        
        # Convert record to dictionary
        properties = {}
        for name, value in zip(fields, record):
            # Decode bytes if necessary
            if isinstance(value, bytes):
                try:
                    value = value.decode('utf-8')
                except UnicodeDecodeError:
                    value = value.decode('latin-1')
            properties[name] = value
            
        # Transform coords
        coords = []
        if shape.shapeType in [shapefile.POLYGON, shapefile.POLYGONZ]:
            # Polygons in PyShp can have multiple parts (outer ring, inner rings)
            parts = list(shape.parts) + [len(shape.points)]
            poly_coords = []
            for i in range(len(shape.parts)):
                part_pts = shape.points[parts[i]:parts[i+1]]
                transformed_pts = []
                for pt in part_pts:
                    lon, lat = transformer.transform(pt[0], pt[1])
                    transformed_pts.append([lon, lat])
                poly_coords.append(transformed_pts)
            
            geometry = {
                "type": "Polygon",
                "coordinates": poly_coords
            }
        elif shape.shapeType in [shapefile.POLYLINE, shapefile.POLYLINEZ]:
            parts = list(shape.parts) + [len(shape.points)]
            line_coords = []
            for i in range(len(shape.parts)):
                part_pts = shape.points[parts[i]:parts[i+1]]
                transformed_pts = []
                for pt in part_pts:
                    lon, lat = transformer.transform(pt[0], pt[1])
                    transformed_pts.append([lon, lat])
                if len(shape.parts) == 1:
                    geometry = {
                        "type": "LineString",
                        "coordinates": transformed_pts
                    }
                else:
                    line_coords.append(transformed_pts)
            if len(shape.parts) > 1:
                geometry = {
                    "type": "MultiLineString",
                    "coordinates": line_coords
                }
        else:
            # Fallback to Point
            pt = shape.points[0]
            lon, lat = transformer.transform(pt[0], pt[1])
            geometry = {
                "type": "Point",
                "coordinates": [lon, lat]
            }
            
        features.append({
            "type": "Feature",
            "properties": properties,
            "geometry": geometry
        })
        
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved {geojson_path}")
# --- End: Copied from convert_shapefiles.py ---

BASE = os.path.dirname(os.path.abspath(__file__))
SHP_PATH = os.path.join(BASE, "wsg_download", "Wasserschutzgebiete-NRW.shp")
TEMP_GEOJSON_PATH = os.path.join(BASE, "wsg_download", "Wasserschutzgebiete-NRW.geojson")
OUT_PATH = os.path.join(BASE, "wasserschutzgebiete.geojson")
ROOT_PATH = os.path.join(os.path.dirname(BASE), "wasserschutzgebiete.geojson")
KREISE_RR_PATH = os.path.join(os.path.dirname(BASE), "kreise_rr.geojson")

def clip_geojson_with_kreise(input_geojson_path, output_geojson_path, kreise_geojson_path):
    print(f"Clipping {input_geojson_path} with {kreise_geojson_path}...")
    with open(input_geojson_path, 'r', encoding='utf-8') as f:
        wsg_data = json.load(f)

    with open(kreise_geojson_path, 'r', encoding='utf-8') as f:
        kreise_data = json.load(f)

    # Combine all kreise polygons into a single MultiPolygon for clipping
    kreise_polygons = [shape(f['geometry']) for f in kreise_data['features']]
    if not kreise_polygons:
        print("No kreise polygons found for clipping.")
        shutil.copy(input_geojson_path, output_geojson_path)
        return

    from shapely.ops import unary_union
    union_kreise = unary_union([poly.buffer(0) for poly in kreise_polygons])
    
    prepared_kreise = prep(union_kreise)

    clipped_features = []
    for feature in wsg_data['features']:
        wsg_polygon = shape(feature['geometry'])
        if not wsg_polygon.is_valid:
            wsg_polygon = wsg_polygon.buffer(0)
            
        # Check for intersection with the prepared kreise union
        try:
            intersects = prepared_kreise.intersects(wsg_polygon)
        except Exception:
            # Fallback in case prepared intersects crashes
            intersects = union_kreise.intersects(wsg_polygon)

        if intersects:
            # Perform the intersection with error fallback
            try:
                clipped_polygon = wsg_polygon.intersection(union_kreise)
            except Exception:
                try:
                    from shapely.validation import make_valid
                    valid_wsg = make_valid(wsg_polygon)
                    clipped_polygon = valid_wsg.intersection(union_kreise)
                except Exception:
                    # If still failing, skip this specific feature or use buffer(0) fallback
                    try:
                        clipped_polygon = wsg_polygon.buffer(0).intersection(union_kreise.buffer(0))
                    except Exception:
                        continue
            
            # Only add if the intersection results in a valid geometry
            if not clipped_polygon.is_empty and clipped_polygon.is_valid:
                # If the clipped_polygon is a MultiPolygon, ensure all parts are added
                if clipped_polygon.geom_type == 'MultiPolygon':
                    for single_polygon in clipped_polygon.geoms:
                        new_feature = feature.copy()
                        new_feature['geometry'] = mapping(single_polygon)
                        clipped_features.append(new_feature)
                else:
                    new_feature = feature.copy()
                    new_feature['geometry'] = mapping(clipped_polygon)
                    clipped_features.append(new_feature)

    clipped_geojson = {
        "type": "FeatureCollection",
        "features": clipped_features
    }

    with open(output_geojson_path, "w", encoding="utf-8") as f:
        json.dump(clipped_geojson, f, ensure_ascii=False, indent=2)
    print(f"Successfully clipped and saved {output_geojson_path}. Features: {len(clipped_features)}")

def main():
    # 1. Convert SHP to temporary GeoJSON
    convert_shp_to_geojson(SHP_PATH, TEMP_GEOJSON_PATH)

    # 2. Clip the GeoJSON with kreise_rr.geojson
    clip_geojson_with_kreise(TEMP_GEOJSON_PATH, OUT_PATH, KREISE_RR_PATH)

    # 3. Add 'quelle' property and copy to root
    with open(OUT_PATH, 'r+', encoding='utf-8') as f:
        data = json.load(f)
        for feature in data['features']:
            feature['properties']['quelle'] = "LANUV NRW / opengeodata.nrw, Datenlizenz Deutschland – Namensnennung – Version 2.0"
        f.seek(0) # Rewind to the beginning
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.truncate() # Truncate any remaining old content

    shutil.copy(OUT_PATH, ROOT_PATH)
    print(f"Output copied to: {ROOT_PATH}")

if __name__ == "__main__":
    main()
