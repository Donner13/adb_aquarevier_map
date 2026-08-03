import shapefile
import pyproj
import json
import os

def convert_layer(shp_path, geojson_path, filter_func):
    print(f"Reading {shp_path}...")
    sf = shapefile.Reader(shp_path)
    
    # ETRS89 / UTM 32N (EPSG:25832) to WGS84 (EPSG:4326)
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
            
        if not filter_func(properties):
            continue
            
        # Transform coordinates
        geometry = None
        if shape.shapeType in [shapefile.POLYGON, shapefile.POLYGONZ]:
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
                
        if geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "name": properties.get("GEW_NAME", properties.get("ABS_NAME", "")),
                    "id": properties.get("OFWK_ID_NR", ""),
                    "river_catchment": properties.get("TEZG_HYD", "")
                },
                "geometry": geometry
            })
            
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    print(f"Successfully converted and filtered to {geojson_path}. Total features: {len(features)}")

def main():
    ezg_shp = "temp_extracted/OW-Wasserkoerper-3D-NRW_EPSG25832_Shape/OW-Wasserkoerper-NRW_EPSG25832_Shape/ow_ofwk_nrw_ezg_bwp_2022_2027.shp"
    gew_shp = "temp_extracted/OW-Wasserkoerper-3D-NRW_EPSG25832_Shape/OW-Wasserkoerper-NRW_EPSG25832_Shape/ow_ofwk_nrw_gewline_bwp_2022_2027.shp"
    
    # Filter for Rur Hydrological Catchment
    def is_rur(props):
        return props.get("TEZG_HYD") == "Rur"
        
    convert_layer(ezg_shp, "rur_einzugsgebiet.geojson", is_rur)
    convert_layer(gew_shp, "gewaesser_rur_official.geojson", is_rur)

if __name__ == "__main__":
    main()
