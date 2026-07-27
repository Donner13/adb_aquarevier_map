import json
import glob
import os
import sys
from collections import Counter
import urllib.request
import re

# Bounding box for Rheinisches Revier (lat ~ 50.3 - 51.4, lon ~ 5.8 - 7.15)
MIN_LON, MAX_LON = 5.8, 7.15
MIN_LAT, MAX_LAT = 50.3, 51.4

def check_coords_in_revier(coords):
    # flatten nested lists to find (lon, lat) pairs
    out_of_bounds = []
    null_coords = []
    
    def extract_pairs(c):
        if not c:
            null_coords.append(c)
            return
        if isinstance(c[0], (int, float)):
            lon, lat = c[0], c[1]
            if lon == 0 and lat == 0:
                null_coords.append(c)
            elif not (MIN_LON <= lon <= MAX_LON and MIN_LAT <= lat <= MAX_LAT):
                out_of_bounds.append((lon, lat))
        else:
            for sub in c:
                extract_pairs(sub)

    extract_pairs(coords)
    return null_coords, out_of_bounds

def audit_geojson_files():
    print("=== GEOJSON FILES DATA PLAUSIBILITY AUDIT ===")
    geojson_files = sorted(glob.glob("*.geojson") + glob.glob("elwas_raw_data/*.geojson"))
    # remove duplicate path resolves
    geojson_files = sorted(list(set([os.path.normpath(f) for f in geojson_files])))

    summary = []
    for filepath in geojson_files:
        filename = os.path.basename(filepath)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ {filepath}: FAILED TO LOAD JSON: {e}")
            summary.append((filename, 0, f"Error: {e}"))
            continue
        
        features = data.get("features", [])
        feat_count = len(features)
        
        if feat_count == 0:
            print(f"⚠️ {filepath}: 0 features")
            summary.append((filename, 0, "Empty features array"))
            continue

        # Coordinate check
        null_c = 0
        oob_c = 0
        for feat in features:
            geom = feat.get("geometry")
            if not geom or "coordinates" not in geom or not geom["coordinates"]:
                null_c += 1
                continue
            nc, oob = check_coords_in_revier(geom["coordinates"])
            if nc: null_c += len(nc)
            if oob: oob_c += len(oob)
        
        # Value Frequency Check per Property
        suspicious_fields = []
        if feat_count >= 5:
            # Collect all property keys
            all_keys = set()
            for feat in features:
                props = feat.get("properties", {}) or {}
                all_keys.update(props.keys())

            for key in sorted(all_keys):
                values = []
                for feat in features:
                    props = feat.get("properties", {}) or {}
                    val = props.get(key)
                    if val is not None:
                        values.append(str(val))
                
                if not values:
                    continue

                counter = Counter(values)
                most_common_val, count = counter.most_common(1)[0]
                ratio = count / feat_count

                # Flag if a text property (non-constant category) is identical > 90%
                # Skip known binary/category fields like "quelle", "typ", "messstellenart", "status", "kreis", "anhang_code"
                skip_cat_keys = {"quelle", "typ", "bauwerksart", "messstellenart", "status", "kreis", "anhang_code", "ausbaugroesse_ew", "branchen"}
                if key not in skip_cat_keys and feat_count >= 10 and ratio >= 0.9 and len(most_common_val) < 4:
                    suspicious_fields.append(f"{key}: mode='{most_common_val}' ({count}/{feat_count}, {ratio:.1%})")

                # Check for suspicious literal placeholder values
                suspicious_patterns = [r"^e$", r"^null$", r"^undefined$", r"^\[object Object\]$"]
                for p in suspicious_patterns:
                    if re.match(p, most_common_val, re.IGNORECASE) and count > 1:
                        suspicious_fields.append(f"{key}: suspicious value '{most_common_val}' ({count} times)")

        status_str = f"OK ({feat_count} features)"
        if null_c > 0 or oob_c > 0 or suspicious_fields:
            issues = []
            if null_c > 0: issues.append(f"{null_c} null coords")
            if oob_c > 0: issues.append(f"{oob_c} out-of-bounds coords")
            if suspicious_fields: issues.append(f"Suspicious fields: {'; '.join(suspicious_fields)}")
            status_str = f"⚠️ {feat_count} features | Issues: {', '.join(issues)}"
            print(f"⚠️ {filename}: {status_str}")
        else:
            print(f"✅ {filename}: {status_str}")

        summary.append((filename, feat_count, status_str))

    return summary

def audit_wms_services():
    print("\n=== WMS SERVICES AVAILABILITY AUDIT ===")
    wms_urls = [
        ("Wasserschutzgebiete", "https://www.wms.nrw.de/umwelt/wsg"),
        ("Tagebaue & Bergbaufelder", "https://www.wms.nrw.de/wms/bebu"),
        ("Flüsse & Gewässer GSK3e", "https://www.wms.nrw.de/umwelt/gsk3e"),
        ("Hochwassergefahrenkarten (HQ100)", "https://www.wms.nrw.de/umwelt/hwgk"),
        ("Starkregen Euskirchen (WMS/Feature)", "https://geoportal.euskirchen.de/arcgis/services/Starkregengefahrenkarte/Starkregengefahrenkarte_Euskirchen_WMS/MapServer/WMSServer")
    ]

    for name, url in wms_urls:
        try:
            req = urllib.request.Request(f"{url}?SERVICE=WMS&REQUEST=GetCapabilities", headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                status = resp.status
                content_type = resp.headers.get('Content-Type', '')
                if status == 200:
                    print(f"✅ {name}: HTTP {status} ({content_type})")
                else:
                    print(f"❌ {name}: HTTP {status}")
        except Exception as e:
            print(f"❌ {name} ({url}): Error: {e}")

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    audit_geojson_files()
    audit_wms_services()
