import json
import argparse
import sys
import os
import html

# NRW Bounding Box roughly: [5.8, 50.3, 9.5, 52.6]
# (min_lon, min_lat, max_lon, max_lat)
NRW_BBOX = (5.7, 50.3, 9.5, 52.6)

VALID_GEOMETRY_TYPES = {
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon', 'GeometryCollection'
}

def check_bbox(lon, lat):
    try:
        lon_f = float(lon)
        lat_f = float(lat)
        min_lon, min_lat, max_lon, max_lat = NRW_BBOX
        return min_lon <= lon_f <= max_lon and min_lat <= lat_f <= max_lat
    except (ValueError, TypeError):
        return False

def get_coordinates(geometry):
    if not isinstance(geometry, dict):
        return []

    geom_type = geometry.get('type')
    if geom_type == 'GeometryCollection':
        coords = []
        geometries = geometry.get('geometries')
        if isinstance(geometries, list):
            for geom in geometries:
                coords.extend(get_coordinates(geom))
        return coords

    if 'coordinates' not in geometry:
        return []

    def flatten(coords):
        if not isinstance(coords, list) or not coords:
            return []
        # If it's a list of numbers, it's a coordinate pair
        if isinstance(coords[0], (int, float)):
            return [coords]

        result = []
        for item in coords:
            result.extend(flatten(item))
        return result

    return flatten(geometry.get('coordinates'))

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
<p>Total features checked: <strong>{results.get('total_features', 0)}</strong></p>
<p>Features with errors: <strong>{len(results.get('errors', []))}</strong></p>
"""
    if results.get('errors'):
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
            safe_msg = html.escape(str(err.get('message', 'Unknown error')))
            feature_idx = err.get('feature_index')
            if feature_idx is None:
                feature_idx = 'N/A'
            html_content += f"<tr><td>{feature_idx}</td><td>{safe_id}</td><td class='error'>{safe_msg}</td></tr>"
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
        results = {
            'total_features': 0,
            'errors': [{'message': f"Error: File {args.input_file} not found."}]
        }
        generate_html_report(results, args.html_report)
        generate_json_report(results, args.json_report)
        print(f"Error: File {args.input_file} not found.")
        sys.exit(1)

    with open(args.input_file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            results = {
                'total_features': 0,
                'errors': [{'message': f"Error: Invalid JSON file. {e}"}]
            }
            generate_html_report(results, args.html_report)
            generate_json_report(results, args.json_report)
            print(f"Error: Invalid JSON file. {e}")
            sys.exit(1)

    # GeoJSON Schema Validation (Basic)
    if not isinstance(data, dict) or data.get('type') != 'FeatureCollection' or not isinstance(data.get('features'), list):
        results = {
            'total_features': 0,
            'errors': [{'message': "Error: Invalid GeoJSON schema. Root object must be a FeatureCollection with a 'features' array."}]
        }
        generate_html_report(results, args.html_report)
        generate_json_report(results, args.json_report)
        print("Error: Invalid GeoJSON schema. Root object must be a FeatureCollection with a 'features' array.")
        sys.exit(1)

    results = {
        'total_features': len(data['features']),
        'errors': []
    }

    for i, feature in enumerate(data['features']):
        if not isinstance(feature, dict):
             results['errors'].append({
                'feature_index': i,
                'feature_id': 'Unknown',
                'message': 'Invalid GeoJSON: Feature object missing or incorrect type'
            })
             continue

        properties = feature.get('properties')
        if not isinstance(properties, dict):
            properties = {}

        feature_id = properties.get('id', 'Unknown')

        if feature.get('type') != 'Feature':
            results['errors'].append({
                'feature_index': i,
                'feature_id': feature_id,
                'message': 'Invalid GeoJSON: Feature object missing or incorrect type'
            })
            continue

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

        # Geometry schema and NRW Bounding Box check
        geometry = feature.get('geometry')
        if isinstance(geometry, dict):
            geom_type = geometry.get('type')

            if geom_type not in VALID_GEOMETRY_TYPES:
                results['errors'].append({
                     'feature_index': i,
                     'feature_id': feature_id,
                     'message': f"Invalid geometry type: {geom_type}"
                 })
            elif geom_type == 'GeometryCollection':
                 if 'geometries' not in geometry or not isinstance(geometry['geometries'], list):
                     results['errors'].append({
                         'feature_index': i,
                         'feature_id': feature_id,
                         'message': 'GeometryCollection missing or invalid geometries array'
                     })
                 elif len(geometry['geometries']) == 0:
                     results['errors'].append({
                         'feature_index': i,
                         'feature_id': feature_id,
                         'message': 'GeometryCollection contains empty geometries array'
                     })
                 else:
                     for geom in geometry['geometries']:
                         if not isinstance(geom, dict) or geom.get('type') not in VALID_GEOMETRY_TYPES or geom.get('type') == 'GeometryCollection':
                              results['errors'].append({
                                 'feature_index': i,
                                 'feature_id': feature_id,
                                 'message': 'GeometryCollection contains invalid geometry'
                             })
                         elif 'coordinates' not in geom or not isinstance(geom['coordinates'], list) or len(geom['coordinates']) == 0:
                              results['errors'].append({
                                 'feature_index': i,
                                 'feature_id': feature_id,
                                 'message': 'GeometryCollection contains geometry with invalid or empty coordinates'
                             })
            elif 'coordinates' not in geometry or not isinstance(geometry['coordinates'], list) or len(geometry['coordinates']) == 0:
                results['errors'].append({
                     'feature_index': i,
                     'feature_id': feature_id,
                     'message': 'Invalid geometry coordinates format'
                 })

            # Proceed with bounding box check if no prior schema errors for this feature
            has_schema_error = any(e['feature_index'] == i and 'Invalid geometry' in e['message'] for e in results['errors'])

            coords = get_coordinates(geometry)
            if not coords and geom_type != 'GeometryCollection':
                # Empty coordinates array (or nested empty arrays) should be flagged if not already
                if not any(e['feature_index'] == i and 'coordinates' in e['message'] for e in results['errors']):
                    results['errors'].append({
                        'feature_index': i,
                        'feature_id': feature_id,
                        'message': 'Empty coordinates structure'
                    })
            elif coords:
                out_of_bounds = []
                invalid_coords = []
                for coord in coords:
                    if isinstance(coord, list) and len(coord) >= 2:
                        lon, lat = coord[0], coord[1]
                        if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)):
                            invalid_coords.append(coord)
                        elif not check_bbox(lon, lat):
                            out_of_bounds.append(coord)
                    else:
                        invalid_coords.append(coord)

                if invalid_coords:
                    results['errors'].append({
                        'feature_index': i,
                        'feature_id': feature_id,
                        'message': f"Invalid coordinate format: {invalid_coords[0]} (and possibly others)"
                    })
                elif out_of_bounds:
                    results['errors'].append({
                        'feature_index': i,
                        'feature_id': feature_id,
                        'message': f"Coordinates outside NRW Bounding Box: {out_of_bounds[0]} (and possibly others)"
                    })
        else:
             results['errors'].append({
                 'feature_index': i,
                 'feature_id': feature_id,
                 'message': 'Missing or invalid geometry'
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
