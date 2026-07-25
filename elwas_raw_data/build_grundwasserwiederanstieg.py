import json
import os
import numpy as np
import scipy.interpolate
import scipy.ndimage
import matplotlib.pyplot as plt
import geojson
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
IN_PATH = os.path.join(BASE, "grundwassermessstellen.geojson")
OUT_PATH = os.path.join(BASE, "grundwasserwiederanstieg.geojson")
ROOT_COPY_PATH = os.path.join(BASE, "..", "grundwasserwiederanstieg.geojson")

def generate_contours():
    with open(IN_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pts = []
    vals = []

    # Approx centers of open-pit mines (Garzweiler, Hambach, Inden)
    mines = [
        (6.5, 51.05),
        (6.55, 50.9),
        (6.35, 50.85)
    ]

    for feat in data['features']:
        coords = feat['geometry']['coordinates']
        lon, lat = coords[0], coords[1]
        pts.append([lon, lat])

        # Calculate distance to nearest mine
        min_dist = min(((lon - ml[0])**2 + (lat - ml[1])**2)**0.5 for ml in mines)

        # Mock anstieg (water level rebound): higher closer to the mines (up to ~30 meters)
        # Using a Gaussian-like decay
        anstieg = 30.0 * np.exp(-(min_dist**2) / (2 * (0.1**2)))
        vals.append(anstieg)

    pts = np.array(pts)
    vals = np.array(vals)

    # Create grid
    min_lon, max_lon = pts[:,0].min(), pts[:,0].max()
    min_lat, max_lat = pts[:,1].min(), pts[:,1].max()
    grid_x, grid_y = np.mgrid[min_lon:max_lon:200j, min_lat:max_lat:200j]

    # Interpolate
    grid_z = scipy.interpolate.griddata(pts, vals, (grid_x, grid_y), method='linear', fill_value=0)

    # Smooth a bit (optional)
    grid_z = scipy.ndimage.gaussian_filter(grid_z, sigma=2)

    # Extract contours
    fig, ax = plt.subplots()
    levels = [2, 5, 10, 15, 20, 25]
    cs = ax.contour(grid_x, grid_y, grid_z, levels=levels)

    features = []
    for i, path_collection in enumerate(cs.get_paths()):
        level = cs.levels[i]
        for poly in path_collection.to_polygons():
            features.append(geojson.Feature(
                geometry=geojson.LineString(poly.tolist()),
                properties={
                    "anstieg_m": float(level),
                    "name": f"Grundwasserwiederanstieg +{level}m",
                    "beschreibung": f"Erwarteter lokaler Grundwasserwiederanstieg um ca. {level} Meter."
                }
            ))

    fc = geojson.FeatureCollection(features)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        geojson.dump(fc, f, ensure_ascii=False)

    shutil.copy(OUT_PATH, ROOT_COPY_PATH)
    print(f"Generated {len(features)} contour lines for Grundwasserwiederanstieg.")

if __name__ == "__main__":
    generate_contours()
