#!/usr/bin/env python3
"""
AquaRevier Geometry Simplification Script (Backlog 4)
Simplifies large GeoJSON polygon layers before build/deploy to reduce payload size.
"""
import sys
import json
import argparse
from pathlib import Path

try:
    from shapely.geometry import shape, mapping
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False


def simplify_geojson(input_path: Path, output_path: Path, tolerance: float = 0.0001):
    if not input_path.exists():
        print(f"Error: File {input_path} does not exist.")
        return False

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not SHAPELY_AVAILABLE:
        print("Warning: Shapely library not available. Skipping geometric simplification.")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        return True

    features = data.get('features', [])
    simplified_features = []

    for feat in features:
        geom = feat.get('geometry')
        if geom:
            try:
                s_geom = shape(geom)
                s_simplified = s_geom.simplify(tolerance, preserve_topology=True)
                feat['geometry'] = mapping(s_simplified)
            except Exception as e:
                print(f"Warning: Could not simplify geometry in feature: {e}")
        simplified_features.append(feat)

    data['features'] = simplified_features

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    orig_size = input_path.stat().st_size
    new_size = output_path.stat().st_size
    reduction = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
    print(f"Simplified {input_path.name}: {orig_size} -> {new_size} bytes ({reduction:.1f}% reduction)")
    return True


def main():
    parser = argparse.ArgumentParser(description="Simplify GeoJSON geometries for AquaRevier")
    parser.add_argument("input", type=Path, help="Input GeoJSON file")
    parser.add_argument("--output", "-o", type=Path, help="Output GeoJSON file")
    parser.add_argument("--tolerance", "-t", type=float, default=0.0001, help="Simplification tolerance")
    args = parser.parse_args()

    output = args.output or args.input
    simplify_geojson(args.input, output, args.tolerance)


if __name__ == "__main__":
    main()
