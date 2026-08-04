import json
import argparse
import sys
import os
import html
import math
from datetime import datetime

# NRW Bounding Box (approximate)
NRW_BBOX = {
    "min_lon": 5.8,
    "max_lon": 9.5,
    "min_lat": 50.3,
    "max_lat": 52.6
}

def check_coords_in_bbox(lon, lat):
    # Ensure they are numeric, but strictly exclude booleans which are a subclass of int in Python
    if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)):
        return False
    if isinstance(lon, bool) or isinstance(lat, bool):
        return False
    if math.isnan(lon) or math.isinf(lon) or math.isnan(lat) or math.isinf(lat):
        return False
    return (NRW_BBOX["min_lon"] <= lon <= NRW_BBOX["max_lon"]) and (NRW_BBOX["min_lat"] <= lat <= NRW_BBOX["max_lat"])

def check_geometry(geometry, feature_id, results):
    if not isinstance(geometry, dict):
        results["errors"].append(f"Feature {feature_id}: Geometry is not an object.")
        results["valid"] = False
        return

    geom_type = geometry.get("type")

    if geom_type == "GeometryCollection":
        geometries = geometry.get("geometries")
        if not isinstance(geometries, list):
            results["errors"].append(f"Feature {feature_id}: GeometryCollection missing or invalid 'geometries' array.")
            results["valid"] = False
            return
        if len(geometries) == 0:
            results["errors"].append(f"Feature {feature_id}: GeometryCollection cannot be empty.")
            results["valid"] = False
            return
        for geom in geometries:
             check_geometry(geom, feature_id, results)
        return

    coords = geometry.get("coordinates")
    if not geom_type or coords is None:
        results["errors"].append(f"Feature {feature_id}: Invalid geometry structure.")
        results["valid"] = False
        return

    def check_point(pt):
        if not isinstance(pt, (list, tuple)):
            results["errors"].append(f"Feature {feature_id}: Malformed coordinates, expected array.")
            results["valid"] = False
            return False
        if len(pt) < 2:
            results["errors"].append(f"Feature {feature_id}: Coordinates too short: {pt}.")
            results["valid"] = False
            return False
        # GeoJSON permits additional elements (e.g. altitude) but they must be numeric and finite.
        for i, val in enumerate(pt):
            if i >= 2:
                if not isinstance(val, (int, float)) or isinstance(val, bool):
                     results["errors"].append(f"Feature {feature_id}: Extra coordinate value at index {i} is not a valid number: {val}.")
                     results["valid"] = False
                     return False
                if math.isnan(val) or math.isinf(val):
                     results["errors"].append(f"Feature {feature_id}: Extra coordinate value at index {i} is not finite: {val}.")
                     results["valid"] = False
                     return False

        lon, lat = pt[0], pt[1]
        if not check_coords_in_bbox(lon, lat):
            results["errors"].append(f"Feature {feature_id}: Coordinates [{lon}, {lat}] outside NRW bounding box or invalid type/value.")
            results["valid"] = False
            return False
        return True

    def check_linear_ring(ring, geom_context):
        if not isinstance(ring, (list, tuple)):
            results["errors"].append(f"Feature {feature_id}: Invalid ring in {geom_context}.")
            results["valid"] = False
            return False
        if len(ring) < 4:
            results["errors"].append(f"Feature {feature_id}: LinearRing in {geom_context} has fewer than 4 positions.")
            results["valid"] = False
            return False
        first_pt = ring[0]
        last_pt = ring[-1]
        if not (isinstance(first_pt, (list, tuple)) and isinstance(last_pt, (list, tuple)) and
                len(first_pt) >= 2 and len(last_pt) >= 2 and
                first_pt[0] == last_pt[0] and first_pt[1] == last_pt[1]):
            results["errors"].append(f"Feature {feature_id}: LinearRing in {geom_context} is not closed.")
            results["valid"] = False
            return False
        all_valid = True
        for pt in ring:
            if not check_point(pt):
                all_valid = False
        return all_valid


    if geom_type == "Point":
        if isinstance(coords, (list, tuple)):
            if len(coords) < 2:
                results["errors"].append(f"Feature {feature_id}: Point coordinates too short: {coords}.")
                results["valid"] = False
            else:
                check_point(coords)
        else:
            results["errors"].append(f"Feature {feature_id}: Invalid Point coordinates structure.")
            results["valid"] = False

    elif geom_type in ("LineString", "MultiPoint"):
        if isinstance(coords, (list, tuple)):
            if geom_type == "LineString" and len(coords) < 2:
                 results["errors"].append(f"Feature {feature_id}: LineString coordinates must have at least 2 positions.")
                 results["valid"] = False
            elif geom_type == "MultiPoint" and len(coords) == 0:
                 results["errors"].append(f"Feature {feature_id}: MultiPoint coordinates cannot be empty.")
                 results["valid"] = False
            for pt in coords:
                check_point(pt)
        else:
             results["errors"].append(f"Feature {feature_id}: Invalid {geom_type} coordinates structure.")
             results["valid"] = False

    elif geom_type in ("Polygon", "MultiLineString"):
        if isinstance(coords, (list, tuple)):
            if len(coords) == 0:
                 results["errors"].append(f"Feature {feature_id}: {geom_type} coordinates cannot be empty.")
                 results["valid"] = False
            for line_or_ring in coords:
                if isinstance(line_or_ring, (list, tuple)):
                    if geom_type == "Polygon":
                        check_linear_ring(line_or_ring, "Polygon")
                    else: # MultiLineString
                        if len(line_or_ring) < 2:
                             results["errors"].append(f"Feature {feature_id}: LineString in MultiLineString must have at least 2 positions.")
                             results["valid"] = False
                        for pt in line_or_ring:
                            check_point(pt)
                else:
                    results["errors"].append(f"Feature {feature_id}: Invalid structure in {geom_type}.")
                    results["valid"] = False
        else:
            results["errors"].append(f"Feature {feature_id}: Invalid {geom_type} coordinates structure.")
            results["valid"] = False

    elif geom_type == "MultiPolygon":
        if isinstance(coords, (list, tuple)):
            if len(coords) == 0:
                 results["errors"].append(f"Feature {feature_id}: MultiPolygon coordinates cannot be empty.")
                 results["valid"] = False
            for poly in coords:
                if isinstance(poly, (list, tuple)):
                    if len(poly) == 0:
                        results["errors"].append(f"Feature {feature_id}: Polygon within MultiPolygon cannot be empty.")
                        results["valid"] = False
                    for ring in poly:
                        check_linear_ring(ring, "MultiPolygon")
                else:
                    results["errors"].append(f"Feature {feature_id}: Invalid polygon in MultiPolygon.")
                    results["valid"] = False
        else:
            results["errors"].append(f"Feature {feature_id}: Invalid MultiPolygon coordinates structure.")
            results["valid"] = False
    else:
        results["errors"].append(f"Feature {feature_id}: Unknown or unsupported geometry type '{geom_type}'.")
        results["valid"] = False

def is_empty_value(val):
    if val is None: return True
    if isinstance(val, str) and not val.strip(): return True
    return False

def raise_on_non_standard_json(c):
    raise ValueError(f"Strict JSON violation: non-standard constant '{c}' encountered in JSON payload.")

def validate_geojson(filepath):
    results = {
        "filepath": filepath,
        "timestamp": datetime.now().isoformat(),
        "total_features": 0,
        "valid": True,
        "errors": [],
        "warnings": []
    }

    if not os.path.exists(filepath):
        results["valid"] = False
        results["errors"].append(f"File not found: {filepath}")
        return results

    try:
        # Strictly prevent parsing non-standard JSON NaN/Infinity values everywhere by throwing an error.
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f, parse_constant=raise_on_non_standard_json)
    except ValueError as e:
        results["valid"] = False
        results["errors"].append(str(e))
        return results
    except json.JSONDecodeError as e:
        results["valid"] = False
        results["errors"].append(f"Invalid JSON: {str(e)}")
        return results
    except IOError as e:
        results["valid"] = False
        results["errors"].append(f"IO Error reading file: {str(e)}")
        return results
    except Exception as e:
        results["valid"] = False
        results["errors"].append(f"Unexpected error reading file: {str(e)}")
        return results

    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        results["valid"] = False
        results["errors"].append("GeoJSON must be a FeatureCollection")
        return results

    # Ensure 'features' is explicitly present and is an array
    if "features" not in data:
         results["valid"] = False
         results["errors"].append("GeoJSON 'features' array is missing.")
         return results

    features = data["features"]
    if not isinstance(features, list):
         results["valid"] = False
         results["errors"].append("GeoJSON 'features' must be an array.")
         return results

    results["total_features"] = len(features)

    for i, feature in enumerate(features):
        if not isinstance(feature, dict):
            results["errors"].append(f"Feature at index {i} is not a valid object.")
            results["valid"] = False
            continue

        if feature.get("type") != "Feature":
            results["errors"].append(f"Feature at index {i} has invalid type: expected 'Feature', got '{feature.get('type')}'.")
            results["valid"] = False

        properties = feature.get("properties")

        if not isinstance(properties, dict):
             results["errors"].append(f"Feature at index {i}: Missing or invalid 'properties'.")
             results["valid"] = False
             properties = {}

        # Extract feature ID for logging, defaulting to index if not found
        feature_id = properties.get("id", f"index_{i}")

        geometry = feature.get("geometry")

        # 'id' check - it must be in properties and cannot be empty
        if "id" not in properties or is_empty_value(properties.get("id")):
             results["errors"].append(f"Feature at index {i}: Missing or empty 'id' in properties.")
             results["valid"] = False

        # name is a mandatory field in properties and cannot be empty
        if "name" not in properties or is_empty_value(properties.get("name")):
             results["errors"].append(f"Feature {feature_id}: Missing or empty 'name' in properties.")
             results["valid"] = False

        # Check explicitly for category OR group. Either one satisfies the requirement, but cannot be empty
        has_category = "category" in properties and not is_empty_value(properties.get("category"))
        has_group = "group" in properties and not is_empty_value(properties.get("group"))

        if not has_category and not has_group:
            results["errors"].append(f"Feature {feature_id}: Missing or empty 'category'/'group' in properties.")
            results["valid"] = False
        elif has_group and not has_category:
            results["warnings"].append(f"Feature {feature_id}: Uses 'group' instead of the standard 'category'.")

        if geometry is None:
            results["errors"].append(f"Feature {feature_id}: Missing geometry.")
            results["valid"] = False
            continue

        check_geometry(geometry, feature_id, results)

    return results

def generate_json_report(results, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

def generate_html_report(results, output_path):
    # Escape user input to prevent HTML injection
    filepath_safe = html.escape(str(results['filepath']))
    timestamp_safe = html.escape(str(results['timestamp']))

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Data Quality Gate Report</title>
    <style>
        body {{ font-family: sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
        .success {{ color: green; font-weight: bold; }}
        .error {{ color: red; font-weight: bold; }}
        .warning {{ color: orange; font-weight: bold; }}
        .summary {{ margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; }}
        ul {{ list-style-type: disc; margin-left: 20px; }}
    </style>
</head>
<body>
    <h1>Data Quality Gate Report</h1>

    <div class="summary">
        <p><strong>File:</strong> {filepath_safe}</p>
        <p><strong>Timestamp:</strong> {timestamp_safe}</p>
        <p><strong>Total Features:</strong> {results['total_features']}</p>
        <p><strong>Status:</strong> <span class="{'success' if results['valid'] else 'error'}">{'PASSED' if results['valid'] else 'FAILED'}</span></p>
    </div>
"""

    if results['errors']:
        html_content += f"""
    <h2>Errors ({len(results['errors'])})</h2>
    <ul>
"""
        for err in results['errors']:
            html_content += f"        <li><span class='error'>Error:</span> {html.escape(str(err))}</li>\n"
        html_content += "    </ul>\n"

    if results['warnings']:
        html_content += f"""
    <h2>Warnings ({len(results['warnings'])})</h2>
    <ul>
"""
        for warn in results['warnings']:
            html_content += f"        <li><span class='warning'>Warning:</span> {html.escape(str(warn))}</li>\n"
        html_content += "    </ul>\n"

    if not results['errors'] and not results['warnings']:
        html_content += "<p>No errors or warnings found.</p>\n"

    html_content += """
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    parser = argparse.ArgumentParser(description="Automatisiertes GeoJSON Datenqualitaets-Gate (Pre- und Post-Scrape)")
    parser.add_argument("input_file", help="Path to the GeoJSON file to validate")
    parser.add_argument("--json-report", help="Path to output JSON report", default="report.json")
    parser.add_argument("--html-report", help="Path to output HTML report", default="report.html")

    args = parser.parse_args()

    results = validate_geojson(args.input_file)

    generate_json_report(results, args.json_report)
    generate_html_report(results, args.html_report)

    print(f"Validation for {args.input_file}: {'PASSED' if results['valid'] else 'FAILED'}")
    if results['errors']:
        print(f"Found {len(results['errors'])} errors.")
    if results['warnings']:
        print(f"Found {len(results['warnings'])} warnings.")

    print(f"Reports generated: {args.json_report}, {args.html_report}")

    if not results['valid']:
        sys.exit(1)

if __name__ == "__main__":
    main()
