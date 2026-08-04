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

        # Check if the list contains number types representing a coordinate pair
        if len(coords) >= 2 and isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)):
             # Even if it has more than 2 elements, we take the first two as lon/lat for bbox checking
             return [coords]

        # If it's a list but the first elements aren't numbers, we must recurse.
        # If we hit string/null elements instead of lists, we just return them and let the caller handle it.
        result = []
        for item in coords:
            if isinstance(item, list):
                result.extend(flatten(item))
            else:
                 # It's an invalid element (not a list, not a paired number at the parent level)
                 # We return it wrapped to trigger the "Invalid coordinate format" error later
                 result.append([item])
        return result

    return flatten(geometry.get('coordinates'))

def is_valid_position(coord):
    """A valid GeoJSON position is an array of at least 2 numbers."""
    if not isinstance(coord, list) or len(coord) < 2:
        return False
    return all(isinstance(c, (int, float)) for c in coord)

def check_geometry_schema(geometry, feature_id, feature_index):
    """
    Recursively check geometry schemas, specifically supporting nested GeometryCollections,
    and enforcing GeoJSON structure rules for coordinates.
    Returns a list of error dictionaries.
    """
    errors = []

    if not isinstance(geometry, dict):
        errors.append({
            'feature_index': feature_index,
            'feature_id': feature_id,
            'message': 'Missing or invalid geometry structure'
        })
        return errors

    geom_type = geometry.get('type')

    if geom_type not in VALID_GEOMETRY_TYPES:
        errors.append({
             'feature_index': feature_index,
             'feature_id': feature_id,
             'message': f"Invalid geometry type: {geom_type}"
         })
    elif geom_type == 'GeometryCollection':
         if 'geometries' not in geometry or not isinstance(geometry['geometries'], list):
             errors.append({
                 'feature_index': feature_index,
                 'feature_id': feature_id,
                 'message': 'GeometryCollection missing or invalid geometries array'
             })
         elif len(geometry['geometries']) == 0:
             errors.append({
                 'feature_index': feature_index,
                 'feature_id': feature_id,
                 'message': 'GeometryCollection contains empty geometries array'
             })
         else:
             for geom in geometry['geometries']:
                 errors.extend(check_geometry_schema(geom, feature_id, feature_index))
    else:
        # Standard geometries need a valid coordinates array
        if 'coordinates' not in geometry or not isinstance(geometry['coordinates'], list) or len(geometry['coordinates']) == 0:
            errors.append({
                 'feature_index': feature_index,
                 'feature_id': feature_id,
                 'message': f"Invalid geometry coordinates format for {geom_type}"
             })
            return errors

        coords = geometry['coordinates']

        # Deep structural validation based on GeoJSON spec
        if geom_type == 'Point':
            if not is_valid_position(coords):
                errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Invalid Point coordinates"})
        elif geom_type in ('MultiPoint', 'LineString'):
            if not coords or not all(is_valid_position(c) for c in coords):
                errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Invalid {geom_type} coordinates"})
            if geom_type == 'LineString' and len(coords) < 2:
                 errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"LineString requires at least 2 positions"})
        elif geom_type in ('MultiLineString', 'Polygon'):
            # Must be array of arrays of positions. And the inner arrays cannot be empty.
            if not coords or not all(isinstance(line, list) and len(line) > 0 and all(is_valid_position(c) for c in line) for line in coords):
                 errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Invalid {geom_type} coordinates"})
            elif geom_type == 'Polygon':
                 for ring in coords:
                     if len(ring) < 4:
                          errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Polygon ring requires at least 4 positions"})
                     elif ring[0] != ring[-1]:
                          errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Polygon ring must be closed (first and last position identical)"})
            elif geom_type == 'MultiLineString':
                 for line in coords:
                      if len(line) < 2:
                           errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"MultiLineString sub-line requires at least 2 positions"})
        elif geom_type == 'MultiPolygon':
            # Must be array of polygons, where polygon is array of rings, where ring is array of positions. Inner arrays cannot be empty.
            if not coords or not all(isinstance(poly, list) and len(poly) > 0 and all(isinstance(ring, list) and len(ring) > 0 and all(is_valid_position(c) for c in ring) for ring in poly) for poly in coords):
                 errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"Invalid MultiPolygon coordinates"})
            else:
                # Check rings within MultiPolygon
                for poly in coords:
                    for ring in poly:
                         if len(ring) < 4:
                              errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"MultiPolygon ring requires at least 4 positions"})
                         elif ring[0] != ring[-1]:
                              errors.append({'feature_index': feature_index, 'feature_id': feature_id, 'message': f"MultiPolygon ring must be closed"})

    return errors


def generate_html_report(results, report_path):
    # Calculate features with errors (unique feature indices)
    features_with_errors = set(err.get('feature_index') for err in results.get('errors', []) if err.get('feature_index') is not None)

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
<p>Features with errors: <strong>{len(features_with_errors)}</strong> (Total error messages: <strong>{len(results.get('errors', []))}</strong>)</p>
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

        # 1. Structural Validation (handles GeometryCollection natively via recursion)
        geom_errors = check_geometry_schema(geometry, feature_id, i)
        results['errors'].extend(geom_errors)

        # 2. Coordinate Extraction & Validation
        if isinstance(geometry, dict):
            coords = get_coordinates(geometry)

            # If coordinates are entirely missing or empty, and it wasn't already caught by structural validation
            # (e.g., deeply nested empty arrays like [[[]]])
            if not coords:
                # We only want to flag this if it's not a generic GeometryCollection issue already caught
                if geometry.get('type') != 'GeometryCollection' and not any(e['feature_index'] == i and 'coordinates' in e['message'] for e in geom_errors):
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
            if not any(e['feature_index'] == i and 'Missing or invalid geometry' in e['message'] for e in geom_errors):
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
