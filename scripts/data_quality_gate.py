import json
import argparse
import sys
import os
import html
import math

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

def is_valid_number(val):
    """
    Ensure the value is strictly an int or float, NOT a bool, and NOT infinity or NaN.
    """
    if type(val) not in (int, float):
        return False
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return False
    return True

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
        if len(coords) >= 2 and is_valid_number(coords[0]) and is_valid_number(coords[1]):
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
    """A valid GeoJSON position is an array of at least 2 strictly numerical values."""
    if not isinstance(coord, list) or len(coord) < 2:
        return False
    return all(is_valid_number(c) for c in coord)

def check_geometry_schema(geometry, feature_id, feature_index):
    """
    Recursively check geometry schemas, specifically supporting nested GeometryCollections,
    and enforcing GeoJSON structure rules for coordinates.
    Returns a list of error dictionaries.
    """
    errors = []

    # In GeoJSON geometry CAN be null. But for a data quality gate intended for mapping NRW,
    # we explicitly flag it as an error because we need mappable features.
    if geometry is None:
        errors.append({
            'feature_index': feature_index,
            'feature_id': feature_id,
            'message': 'Missing or invalid geometry (null geometry is not allowed for map data)'
        })
        return errors

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
         if 'coordinates' in geometry:
             errors.append({
                 'feature_index': feature_index,
                 'feature_id': feature_id,
                 'message': 'GeometryCollection should not contain a coordinates member'
             })
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

def is_valid_string_property(val):
    """
    Ensure the property value is explicitly a valid string for mandatory fields.
    Rejects numbers, booleans, empty strings, whitespace-only strings, dicts, and lists.
    """
    if not isinstance(val, str):
        return False
    # Only accept non-empty strings (after stripping)
    return val.strip() != ""

def strict_parse_float(s):
    f = float(s)
    if math.isnan(f) or math.isinf(f):
         raise ValueError(f"Strict JSON requires valid finite numbers, found: {s}")
    return f

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
            # parse_constant is used to raise ValueError on non-compliant JSON constants like NaN, Infinity, -Infinity
            def reject_special_float(x):
                raise ValueError(f"Strict JSON requires valid finite numbers, found: {x}")

            # We also pass parse_float to ensure things like 1e999 are caught and rejected as inf
            data = json.load(f, parse_constant=reject_special_float, parse_float=strict_parse_float)
        except (json.JSONDecodeError, ValueError) as e:
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
        is_feature_valid = True
        feature_id = 'Unknown'

        if not isinstance(feature, dict):
             results['errors'].append({
                'feature_index': i,
                'feature_id': 'Unknown',
                'message': 'Invalid GeoJSON: Feature object missing or incorrect type'
            })
             is_feature_valid = False

        properties = {}
        if is_feature_valid:
            if feature.get('type') != 'Feature':
                results['errors'].append({
                    'feature_index': i,
                    'feature_id': 'Unknown',
                    'message': 'Invalid GeoJSON: Feature object missing or incorrect type'
                })
                is_feature_valid = False

            properties = feature.get('properties')
            if properties is None:
                properties = {}
            elif not isinstance(properties, dict):
                 results['errors'].append({
                    'feature_index': i,
                    'feature_id': 'Unknown',
                    'message': 'Invalid GeoJSON: properties must be an object or null'
                })
                 properties = {}

            # For identification in the report, use properties.id if valid, else Feature.id, else Unknown
            if is_valid_string_property(properties.get('id')):
                 feature_id = properties['id']
            elif is_valid_string_property(feature.get('id')):
                 feature_id = feature['id']
            else:
                 feature_id = 'Unknown'

        if not is_feature_valid:
             continue

        # Mandatory fields check
        missing_fields = []

        # Ensure mandatory ID, Name, Category exist explicitly inside 'properties'
        for field in ['id', 'name', 'category']:
            if not is_valid_string_property(properties.get(field)):
                missing_fields.append(field)

        if missing_fields:
            results['errors'].append({
                'feature_index': i,
                'feature_id': feature_id,
                'message': f"Missing or invalid string for mandatory fields in properties: {', '.join(missing_fields)}"
            })

        # Geometry schema and NRW Bounding Box check
        # Geometry can be missing from the JSON entirely, which is an error.
        if 'geometry' not in feature:
            results['errors'].append({
                'feature_index': i,
                'feature_id': feature_id,
                'message': 'Missing geometry field'
            })
            continue

        geometry = feature.get('geometry')

        # 1. Structural Validation (handles GeometryCollection natively via recursion)
        geom_errors = check_geometry_schema(geometry, feature_id, i)
        results['errors'].extend(geom_errors)

        # 2. Coordinate Extraction & Validation
        # Only proceed to coordinate extraction if there were no structural errors (to prevent misleading follow-on errors)
        if not geom_errors and isinstance(geometry, dict):
            coords = get_coordinates(geometry)

            # If coordinates are entirely missing or empty, and it wasn't already caught by structural validation
            # (e.g., deeply nested empty arrays like [[[]]])
            if not coords:
                # We only want to flag this if it's not a generic GeometryCollection issue already caught
                if geometry.get('type') != 'GeometryCollection':
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
                        if not is_valid_number(lon) or not is_valid_number(lat):
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
        elif not geom_errors and geometry is not None:
             # Should be unreachable because check_geometry_schema catches this, but kept for safety
             results['errors'].append({
                 'feature_index': i,
                 'feature_id': feature_id,
                 'message': 'Invalid geometry structure'
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
