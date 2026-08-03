import shapefile
import pyproj
import json
import os

def convert_shp_to_geojson(shp_path, geojson_path):
    print(f"Converting {shp_path} to {geojson_path}...")
    sf = shapefile.Reader(shp_path)
    
    # Projection transformer: PRJ or default EPSG:25832 -> EPSG:4326
    prj_path = os.path.splitext(shp_path)[0] + ".prj"
    src_crs = "epsg:25832"
    if os.path.exists(prj_path):
        try:
            with open(prj_path, 'r', encoding='utf-8', errors='ignore') as f:
                prj_wkt = f.read()
                if prj_wkt.strip():
                    src_crs = pyproj.CRS.from_wkt(prj_wkt)
        except Exception:
            src_crs = "epsg:25832"

    transformer = pyproj.Transformer.from_crs(src_crs, "epsg:4326", always_xy=True)
    
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

def convert_stakeholders_2025(shp_path, geojson_path):
    print(f"Converting and Anonymizing {shp_path} -> {geojson_path}...")
    sf = shapefile.Reader(shp_path)
    transformer = pyproj.Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)
    
    features = []
    fields = [f[0] for f in sf.fields[1:]]
    
    for shape_rec in sf.shapeRecords():
        shape = shape_rec.shape
        record = shape_rec.record
        
        properties = {}
        for name, value in zip(fields, record):
            if isinstance(value, bytes):
                try:
                    value = value.decode('utf-8')
                except UnicodeDecodeError:
                    value = value.decode('latin-1')
            if isinstance(value, str):
                value = value.strip()
            properties[name] = value
            
        # Anonymization: Remove personal fields
        sensitive_fields = ['Name', 'Tel. Numme', 'E-mail', 'Kommentar']
        for sf_name in sensitive_fields:
            if sf_name in properties:
                del properties[sf_name]
                
        # Filter out Einzelakteure
        group = properties.get('Gruppe', '')
        if 'Einzelakteur' in group:
            continue
            
        pt = shape.points[0]
        lon, lat = transformer.transform(pt[0], pt[1])
        geometry = {
            "type": "Point",
            "coordinates": [lon, lat]
        }
        
        # Normalize property keys to match 2026 if possible, or keep clean
        clean_properties = {
            "name": properties.get("Akteursnam", properties.get("Name", "Unbekannt")),
            "abbreviation": properties.get("Abk.", ""),
            "group": properties.get("Gruppe", "Sonstige"),
            "sector": properties.get("Branche", ""),
            "address": properties.get("Adresse", ""),
            "know_how": properties.get("Know-How", ""),
            "common_projects": properties.get("Gem. Proj.", ""),
            "case_study": properties.get("Case Study", "")
        }
        
        features.append({
            "type": "Feature",
            "properties": clean_properties,
            "geometry": geometry
        })
        
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    print(f"Saved {geojson_path} successfully")

def main():
    base_dir = "temp_extracted/2026-04-16-23-Grundschulung-1Tag-online/Schulungsdaten/1_GIS/Geodaten"
    convert_shp_to_geojson(
        os.path.join(base_dir, "tg_kanalisiert.shp"),
        "tg_kanalisiert.geojson"
    )
    convert_shp_to_geojson(
        os.path.join(base_dir, "tg_natuerlich.shp"),
        "tg_natuerlich.geojson"
    )
    convert_stakeholders_2025(
        "temp_extracted/2025_Stakeholder_Kartierung/2025_Stakeholder_Kartierung.shp",
        "contacts_2025_anonymized.geojson"
    )

if __name__ == "__main__":
    main()
