import json
import argparse
import sys
import os
from datetime import datetime

# NRW Bounding Box (approximate)
NRW_BBOX = {
    "min_lon": 5.8,
    "max_lon": 9.5,
    "min_lat": 50.3,
    "max_lat": 52.6
}

def check_coords_in_bbox(lon, lat):
    return (NRW_BBOX["min_lon"] <= lon <= NRW_BBOX["max_lon"]) and (NRW_BBOX["min_lat"] <= lat <= NRW_BBOX["max_lat"])

def check_geometry(geometry, feature_id, results):
    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")

    if not geom_type or not coords:
        results["errors"].append(f"Feature {feature_id}: Invalid geometry structure.")
        results["valid"] = False
        return

    def check_point(lon, lat):
        if not check_coords_in_bbox(lon, lat):
            results["errors"].append(f"Feature {feature_id}: Coordinates [{lon}, {lat}] outside NRW bounding box.")
            results["valid"] = False

    if geom_type == "Point":
        if len(coords) >= 2:
            check_point(coords[0], coords[1])
    elif geom_type == "LineString" or geom_type == "MultiPoint":
        for pt in coords:
            if len(pt) >= 2: check_point(pt[0], pt[1])
    elif geom_type == "Polygon" or geom_type == "MultiLineString":
        for ring in coords:
            for pt in ring:
                if len(pt) >= 2: check_point(pt[0], pt[1])
    elif geom_type == "MultiPolygon":
        for poly in coords:
            for ring in poly:
                for pt in ring:
                    if len(pt) >= 2: check_point(pt[0], pt[1])

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

    if data.get("type") != "FeatureCollection":
        results["valid"] = False
        results["errors"].append("GeoJSON must be a FeatureCollection")
        return results

    features = data.get("features", [])
    results["total_features"] = len(features)

    for i, feature in enumerate(features):
        feature_id = feature.get("id", f"index_{i}")
        properties = feature.get("properties", {})
        geometry = feature.get("geometry", {})

        if "id" not in properties and "id" not in feature:
             results["errors"].append(f"Feature at index {i}: Missing 'id'.")
             results["valid"] = False

        if "name" not in properties:
             results["errors"].append(f"Feature at index {i}: Missing 'name' in properties.")
             results["valid"] = False

        if "category" not in properties and "group" not in properties:
            results["errors"].append(f"Feature at index {i}: Missing 'category' (or 'group') in properties.")
            results["valid"] = False

        if not geometry:
            results["errors"].append(f"Feature {feature_id}: Missing geometry.")
            results["valid"] = False
            continue

        check_geometry(geometry, feature_id, results)

    return results

def generate_json_report(results, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

def generate_html_report(results, output_path):
    html = f"""<!DOCTYPE html>
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
        <p><strong>File:</strong> {results['filepath']}</p>
        <p><strong>Timestamp:</strong> {results['timestamp']}</p>
        <p><strong>Total Features:</strong> {results['total_features']}</p>
        <p><strong>Status:</strong> <span class="{'success' if results['valid'] else 'error'}">{'PASSED' if results['valid'] else 'FAILED'}</span></p>
    </div>
"""

    if results['errors']:
        html += f"""
    <h2>Errors ({len(results['errors'])})</h2>
    <ul>
"""
        for err in results['errors']:
            html += f"        <li><span class='error'>Error:</span> {err}</li>\n"
        html += "    </ul>\n"

    if results['warnings']:
        html += f"""
    <h2>Warnings ({len(results['warnings'])})</h2>
    <ul>
"""
        for warn in results['warnings']:
            html += f"        <li><span class='warning'>Warning:</span> {warn}</li>\n"
        html += "    </ul>\n"

    if not results['errors'] and not results['warnings']:
        html += "<p>No errors or warnings found.</p>\n"

    html += """
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

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

    print(f"Reports generated: {args.json_report}, {args.html_report}")

    if not results['valid']:
        sys.exit(1)

if __name__ == "__main__":
    main()
