import json
import argparse
import sys
import os
import html
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
    return (NRW_BBOX["min_lon"] <= lon <= NRW_BBOX["max_lon"]) and (NRW_BBOX["min_lat"] <= lat <= NRW_BBOX["max_lat"])

def check_geometry(geometry, feature_id, results):
    if not isinstance(geometry, dict):
        results["errors"].append(f"Feature {feature_id}: Geometry is not an object.")
        results["valid"] = False
        return

    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")

    if not geom_type or coords is None:
        results["errors"].append(f"Feature {feature_id}: Invalid geometry structure.")
        results["valid"] = False
        return

    def check_point(pt):
        if not isinstance(pt, (list, tuple)):
            results["errors"].append(f"Feature {feature_id}: Malformed coordinates, expected array.")
            results["valid"] = False
            return
        if len(pt) < 2:
            results["errors"].append(f"Feature {feature_id}: Coordinates too short: {pt}.")
            results["valid"] = False
            return
        lon, lat = pt[0], pt[1]
        if not check_coords_in_bbox(lon, lat):
            results["errors"].append(f"Feature {feature_id}: Coordinates [{lon}, {lat}] outside NRW bounding box or invalid type.")
            results["valid"] = False

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
            for pt in coords:
                check_point(pt)
        else:
             results["errors"].append(f"Feature {feature_id}: Invalid {geom_type} coordinates structure.")
             results["valid"] = False

    elif geom_type in ("Polygon", "MultiLineString"):
        if isinstance(coords, (list, tuple)):
            for ring in coords:
                if isinstance(ring, (list, tuple)):
                    for pt in ring:
                        check_point(pt)
                else:
                    results["errors"].append(f"Feature {feature_id}: Invalid ring in {geom_type}.")
                    results["valid"] = False
        else:
            results["errors"].append(f"Feature {feature_id}: Invalid {geom_type} coordinates structure.")
            results["valid"] = False

    elif geom_type == "MultiPolygon":
        if isinstance(coords, (list, tuple)):
            for poly in coords:
                if isinstance(poly, (list, tuple)):
                    for ring in poly:
                        if isinstance(ring, (list, tuple)):
                            for pt in ring:
                                check_point(pt)
                        else:
                            results["errors"].append(f"Feature {feature_id}: Invalid ring in MultiPolygon.")
                            results["valid"] = False
                else:
                    results["errors"].append(f"Feature {feature_id}: Invalid polygon in MultiPolygon.")
                    results["valid"] = False
        else:
            results["errors"].append(f"Feature {feature_id}: Invalid MultiPolygon coordinates structure.")
            results["valid"] = False
    else:
        results["errors"].append(f"Feature {feature_id}: Unknown or unsupported geometry type '{geom_type}'.")
        results["valid"] = False


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
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        results["valid"] = False
        results["errors"].append(f"Invalid JSON: {str(e)}")
        return results

    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        results["valid"] = False
        results["errors"].append("GeoJSON must be a FeatureCollection")
        return results

    features = data.get("features", [])
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

        feature_id = feature.get("id", f"index_{i}")
        properties = feature.get("properties")

        if not isinstance(properties, dict):
             results["errors"].append(f"Feature {feature_id}: Missing or invalid 'properties'.")
             results["valid"] = False
             properties = {}

        geometry = feature.get("geometry")

        # As per the task prompt, `id` and `name` are mandatory fields. If they are in `properties` we consider them valid.
        if "id" not in properties:
            results["errors"].append(f"Feature {feature_id}: Missing 'id' in properties.")
            results["valid"] = False

        if "name" not in properties:
             results["errors"].append(f"Feature {feature_id}: Missing 'name' in properties.")
             results["valid"] = False

        # Check explicitly for category, add a warning if only group is present
        if "category" not in properties:
            results["errors"].append(f"Feature {feature_id}: Missing 'category' in properties.")
            results["valid"] = False
            if "group" in properties:
                results["warnings"].append(f"Feature {feature_id}: Found 'group' instead of 'category'.")

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
