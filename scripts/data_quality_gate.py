import json
import os
import sys
import argparse
from datetime import datetime

# NRW Bounding Box (approximate)
NRW_MIN_LON = 5.5
NRW_MAX_LON = 9.7
NRW_MIN_LAT = 50.2
NRW_MAX_LAT = 52.6

MANDATORY_FIELDS = ["id", "name", "category"]

def check_bbox(lon, lat):
    if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)):
        return False
    return NRW_MIN_LON <= lon <= NRW_MAX_LON and NRW_MIN_LAT <= lat <= NRW_MAX_LAT

def validate_geometry(geom):
    errors = []
    if not isinstance(geom, dict):
        return ["Geometry is not an object"]

    geom_type = geom.get("type")
    coords = geom.get("coordinates")

    if not geom_type:
        return ["Geometry missing type"]

    valid_types = ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection"]
    if geom_type not in valid_types:
        return [f"Unknown geometry type: {geom_type}"]

    if geom_type == "GeometryCollection":
        geometries = geom.get("geometries")
        if not isinstance(geometries, list):
            return ["GeometryCollection missing or invalid geometries array"]
        for g in geometries:
            errors.extend(validate_geometry(g))
        return errors

    if coords is None or not isinstance(coords, list):
        return ["Geometry missing valid coordinates"]

    if geom_type == "Point":
        if not isinstance(coords, list) or len(coords) < 2:
            return ["Point coordinates invalid"]
        lon, lat = coords[0], coords[1]
        if not check_bbox(lon, lat):
            errors.append(f"Coordinates ({lon}, {lat}) outside NRW bounding box")

    elif geom_type in ["LineString", "MultiPoint"]:
        for coord in coords:
            if isinstance(coord, list) and len(coord) >= 2:
                if not check_bbox(coord[0], coord[1]):
                    errors.append(f"Coordinates ({coord[0]}, {coord[1]}) outside NRW bounding box")
            else:
                errors.append("Invalid coordinate structure in LineString/MultiPoint")

    elif geom_type in ["Polygon", "MultiLineString"]:
        for ring in coords:
            if not isinstance(ring, list):
                errors.append("Invalid ring/line structure")
                continue
            for coord in ring:
                if isinstance(coord, list) and len(coord) >= 2:
                    if not check_bbox(coord[0], coord[1]):
                        errors.append(f"Coordinates ({coord[0]}, {coord[1]}) outside NRW bounding box")
                        break # One error per ring is enough to not spam
                else:
                    errors.append("Invalid coordinate structure in Polygon/MultiLineString")
                    break

    elif geom_type == "MultiPolygon":
        for poly in coords:
            if not isinstance(poly, list):
                errors.append("Invalid polygon structure")
                continue
            for ring in poly:
                if not isinstance(ring, list):
                    errors.append("Invalid ring structure in MultiPolygon")
                    continue
                for coord in ring:
                    if isinstance(coord, list) and len(coord) >= 2:
                        if not check_bbox(coord[0], coord[1]):
                            errors.append(f"Coordinates ({coord[0]}, {coord[1]}) outside NRW bounding box")
                            break
                    else:
                        errors.append("Invalid coordinate structure in MultiPolygon")
                        break

    return errors

def validate_geojson(filepath):
    results = {
        "file": filepath,
        "valid": True,
        "errors": [],
        "feature_count": 0,
        "invalid_features": 0
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        results["valid"] = False
        results["errors"].append(f"Failed to parse JSON: {str(e)}")
        return results

    if not isinstance(data, dict):
        results["valid"] = False
        results["errors"].append("Root is not a JSON object")
        return results

    if data.get("type") != "FeatureCollection":
        results["valid"] = False
        results["errors"].append("Root type is not FeatureCollection")
        return results

    features = data.get("features")
    if not isinstance(features, list):
        results["valid"] = False
        results["errors"].append("Missing or invalid 'features' array")
        return results

    results["feature_count"] = len(features)

    for i, feature in enumerate(features):
        feature_errors = []
        if not isinstance(feature, dict):
            feature_errors.append("Feature is not an object")
            results["errors"].append(f"Feature[{i}]: {feature_errors[0]}")
            results["invalid_features"] += 1
            continue

        if feature.get("type") != "Feature":
            feature_errors.append("Type is not Feature")

        props = feature.get("properties")
        if not isinstance(props, dict):
            feature_errors.append("Missing or invalid properties")
        else:
            for field in MANDATORY_FIELDS:
                if field not in props:
                    feature_errors.append(f"Missing mandatory property: {field}")

        geom = feature.get("geometry")
        if geom is not None: # geometry can be null in GeoJSON, but if present it should be valid
            geom_errors = validate_geometry(geom)
            feature_errors.extend(geom_errors)

        if feature_errors:
            results["invalid_features"] += 1
            for err in feature_errors:
                feat_id = props.get('id', f'index {i}') if isinstance(props, dict) else f'index {i}'
                results["errors"].append(f"Feature '{feat_id}': {err}")

    if results["invalid_features"] > 0 or len(results["errors"]) > 0:
        results["valid"] = False

    return results

def generate_json_report(results_list, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results_list, f, indent=2, ensure_ascii=False)

def generate_html_report(results_list, output_path):
    import html as html_lib
    html_lines = [
        "<!DOCTYPE html>",
        "<html>",
        "<head>",
        "<meta charset='utf-8'>",
        "<title>GeoJSON Data Quality Report</title>",
        "<style>",
        "body { font-family: Arial, sans-serif; margin: 20px; }",
        ".success { color: green; }",
        ".error { color: red; }",
        "table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }",
        "th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }",
        "th { background-color: #f2f2f2; }",
        "</style>",
        "</head>",
        "<body>",
        "<h1>GeoJSON Data Quality Report</h1>",
        f"<p>Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
    ]

    html_lines.append("<table>")
    html_lines.append("<tr><th>File</th><th>Status</th><th>Features</th><th>Invalid Features</th><th>Error Details</th></tr>")

    for res in results_list:
        status = "<span class='success'>Valid</span>" if res["valid"] else "<span class='error'>Invalid</span>"
        errors_html = "<ul>" + "".join([f"<li>{html_lib.escape(e)}</li>" for e in res["errors"][:50]])
        if len(res["errors"]) > 50:
            errors_html += f"<li>... and {len(res['errors']) - 50} more errors</li>"
        errors_html += "</ul>"

        html_lines.append("<tr>")
        html_lines.append(f"<td>{html_lib.escape(res['file'])}</td>")
        html_lines.append(f"<td>{status}</td>")
        html_lines.append(f"<td>{res['feature_count']}</td>")
        html_lines.append(f"<td>{res['invalid_features']}</td>")
        html_lines.append(f"<td>{errors_html if not res['valid'] else '-'}</td>")
        html_lines.append("</tr>")

    html_lines.append("</table>")
    html_lines.append("</body></html>")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(html_lines))

def main():
    parser = argparse.ArgumentParser(description="GeoJSON Data Quality Gate (Pre- and Post-Scrape)")
    parser.add_argument("files", nargs="+", help="GeoJSON files to validate")
    parser.add_argument("--out-dir", default=".", help="Directory to save the reports")
    args = parser.parse_args()

    results = []
    all_valid = True

    for filepath in args.files:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            all_valid = False
            continue

        print(f"Validating {filepath}...")
        res = validate_geojson(filepath)
        results.append(res)

        if not res["valid"]:
            all_valid = False
            print(f"  -> INVALID ({res['invalid_features']} invalid features)")
        else:
            print("  -> VALID")

    os.makedirs(args.out_dir, exist_ok=True)
    json_report = os.path.join(args.out_dir, "quality_report.json")
    html_report = os.path.join(args.out_dir, "quality_report.html")

    generate_json_report(results, json_report)
    generate_html_report(results, html_report)

    print(f"\nReports generated: {json_report}, {html_report}")

    if not all_valid:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
