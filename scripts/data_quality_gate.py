import json
import argparse
import sys
import os
import html

# NRW Bounding Box roughly: [5.8, 50.3, 9.5, 52.6]
# (min_lon, min_lat, max_lon, max_lat)
NRW_BBOX = (5.7, 50.3, 9.5, 52.6)

def check_bbox(lon, lat):
    min_lon, min_lat, max_lon, max_lat = NRW_BBOX
    return min_lon <= lon <= max_lon and min_lat <= lat <= max_lat

def get_coordinates(geometry):
    if not geometry:
        return []

    if geometry.get('type') == 'GeometryCollection':
        coords = []
        for geom in geometry.get('geometries', []):
            coords.extend(get_coordinates(geom))
        return coords

    if 'coordinates' not in geometry:
        return []

    def flatten(coords):
        if not coords:
            return []
        # If it's a list of numbers, it's a coordinate pair
        if isinstance(coords[0], (int, float)):
            return [coords]

        result = []
        for item in coords:
            result.extend(flatten(item))
        return result

    return flatten(geometry['coordinates'])

def generate_html_report(results, report_path):
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<title>Data Quality Report</title>
<style>
body {{ font-family: sans-serif; margin: 20px; }}
.error {{ color: #d32f2f; }}
.success {{ color: #388e3c; }}
table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
th {{ background-color: #f2f2f2; }}
</style>
</head>
<body>
<h1>GeoJSON Data Quality Report</h1>
<p>Total features checked: <strong>{results['total_features']}</strong></p>
<p>Features with errors: <strong>{len(results['errors'])}</strong></p>
"""
    if results['errors']:
        html_content += """
        <h2>Errors:</h2>
        <table>
            <tr>
                <th>Feature Index</th>
                <th>Feature ID</th>
                <th>Error Message</th>
            </tr>
        """
        for err in results['errors']:
            safe_id = html.escape(str(err.get('feature_id', 'N/A')))
            safe_msg = html.escape(str(err['message']))
            html_content += f"<tr><td>{err['feature_index']}</td><td>{safe_id}</td><td class='error'>{safe_msg}</td></tr>"
        html_content += "</table>"
    else:
        html_content += "<p class='success'>All checks passed successfully!</p>"

    html_content += """</body>
</html>"""
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def generate_json_report(results, report_path):
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

def main():
    parser = argparse.ArgumentParser(description="GeoJSON Data Quality Gate")
    parser.add_argument('input_file', help="Path to input GeoJSON file")
    parser.add_argument('--html-report', default='report.html', help="Path to output HTML report")
    parser.add_argument('--json-report', default='report.json', help="Path to output JSON report")

    args = parser.parse_args()

    if not os.path.exists(args.input_file):
        print(f"Error: File {args.input_file} not found.")
        sys.exit(1)

    with open(args.input_file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON file. {e}")
            sys.exit(1)

    # GeoJSON Schema Validation (Basic)
    if not isinstance(data, dict) or data.get('type') != 'FeatureCollection' or 'features' not in data:
        print("Error: Invalid GeoJSON schema. Root object must be a FeatureCollection with a 'features' array.")
        sys.exit(1)

    results = {
        'total_features': len(data['features']),
        'errors': []
    }

    for i, feature in enumerate(data['features']):
        feature_id = feature.get('properties', {}).get('id', 'Unknown')

        if not isinstance(feature, dict) or feature.get('type') != 'Feature':
            results['errors'].append({
                'feature_index': i,
                'feature_id': feature_id,
                'message': 'Invalid GeoJSON: Feature object missing or incorrect type'
            })
            continue

        properties = feature.get('properties', {})

        # Mandatory fields check
        missing_fields = []
        for field in ['id', 'name', 'category']:
            # We treat empty string as missing too, based on standard data quality checks
            if field not in properties or properties[field] is None or str(properties[field]).strip() == "":
                missing_fields.append(field)

        if missing_fields:
            results['errors'].append({
                'feature_index': i,
                'feature_id': feature_id,
                'message': f"Missing or empty mandatory fields: {', '.join(missing_fields)}"
            })

        # NRW Bounding Box check
        geometry = feature.get('geometry')
        if geometry:
            coords = get_coordinates(geometry)
            out_of_bounds = []
            for coord in coords:
                if len(coord) >= 2:
                    lon, lat = coord[0], coord[1]
                    if not check_bbox(lon, lat):
                        out_of_bounds.append(coord)

            if out_of_bounds:
                results['errors'].append({
                    'feature_index': i,
                    'feature_id': feature_id,
                    'message': f"Coordinates outside NRW Bounding Box: {out_of_bounds[0]} (and possibly others)"
                })
        else:
             results['errors'].append({
                 'feature_index': i,
                 'feature_id': feature_id,
                 'message': 'Missing geometry'
             })

    generate_html_report(results, args.html_report)
    generate_json_report(results, args.json_report)

    if results['errors']:
        print(f"Quality gate failed with {len(results['errors'])} errors.")
        sys.exit(1)
    else:
        print("Quality gate passed successfully.")
        sys.exit(0)

if __name__ == '__main__':
    main()
