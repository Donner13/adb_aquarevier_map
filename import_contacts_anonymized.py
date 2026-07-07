import pandas as pd
import pyproj
import json
import os

EXCEL_PATH = r"C:\Users\user\Downloads\ADB_260706.xlsx"
OUTPUT_PATH = r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\contacts_anonymized.geojson"

# Group Color Map
GROUP_COLORS = {
    'Behörde': '#f43f5e',
    'Einzelakteure': '#00f5d4',
    'Forschung': '#3b82f6',
    'Gebietskörperschaft': '#fbbf24',
    'Gewerbe/ Industrie': '#d946ef',
    'Landwirtschaft': '#10b981',
    'Netzwerk/ Multiplikator': '#ff007f',
    'Ver-/ Entsorger': '#ff7300',
    'Sonstige': '#8b5cf6'
}

def parse_coordinate(val):
    if pd.isna(val):
        return None, None
    s = str(val).strip()
    epsg = 25832 # Default UTM 32N
    if "(31" in s or "31U" in s or "31N" in s:
        epsg = 25831 # UTM 31N
    
    cleaned = ""
    for char in s:
        if char.isdigit() or char in ['-', '.', ',']:
            cleaned += char
            
    cleaned = cleaned.replace(',', '.')
    try:
        f_val = float(cleaned)
        # Auto-detect UTM 31N: Easting in our area is ~300k in UTM 32N, but ~700k in UTM 31N.
        if 500000 < f_val < 900000:
            epsg = 25831
        return f_val, epsg
    except ValueError:
        return None, None

def main():
    print(f"Reading Excel: {EXCEL_PATH}")
    if not os.path.exists(EXCEL_PATH):
        print("Error: Excel file does not exist!")
        return

    df = pd.read_excel(EXCEL_PATH)
    
    # Strip column names
    df.columns = [c.strip() for c in df.columns]
    
    # Set up UTM to WGS84 transformers
    transformer_32 = pyproj.Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)
    transformer_31 = pyproj.Transformer.from_crs("epsg:25831", "epsg:4326", always_xy=True)

    # Find coordinate columns
    east_col = 'Rechtswert\n(UTM 32U)'
    north_col = 'Hochwert\n(UTM 32U)'
    if east_col not in df.columns:
        for col in df.columns:
            if 'Rechtswert' in col:
                east_col = col
            if 'Hochwert' in col:
                north_col = col

    # Group coordinate to aggregate overlaps
    grouped_points = {}
    gewerbe_mapping = {}
    gewerbe_counter = 1

    for idx, row in df.iterrows():
        x_val = row.get(east_col)
        y_val = row.get(north_col)
        
        x, epsg_x = parse_coordinate(x_val)
        y, epsg_y = parse_coordinate(y_val)
        
        if x is None or y is None:
            continue

        # Clean Group
        group = str(row.get('Gruppe', 'Sonstige')).strip()
        if 'Beh' in group:
            group = 'Behörde'
        elif 'Gebiets' in group:
            group = 'Gebietskörperschaft'

        # Filter out "Einzelakteure" as requested by Florian
        if group == 'Einzelakteure':
            continue

        # Extract institution
        inst = row.get('Voller Akteursname (Institution/Organisation)', '')
        abkr = row.get('Akteursabkürzung', '')
        if pd.isna(abkr):
            abkr = row.get('Akteursabkrzung', '') # handle encoding artifact

        inst_str = str(inst).strip() if not pd.isna(inst) else ""
        abkr_str = str(abkr).strip() if not pd.isna(abkr) else ""

        # Determine display name for this row
        if inst_str:
            if abkr_str:
                display_name = f"{inst_str} ({abkr_str})"
            else:
                display_name = inst_str
        elif abkr_str:
            display_name = abkr_str
        else:
            # Skip if there's no institution/organisation or abbreviation
            continue

        # Anonymize Gewerbe/ Industrie except official project partners
        if group == 'Gewerbe/ Industrie':
            is_partner = False
            for partner in ["tillman", "smurfit", "schoellershammer"]:
                if partner in display_name.lower():
                    is_partner = True
                    break
            
            if not is_partner:
                if display_name not in gewerbe_mapping:
                    # Clean branch
                    branche = row.get('Branche')
                    clean_branch = "Unbekannt"
                    if not pd.isna(branche):
                        b = str(branche).strip()
                        if "Papier" in b or "Pappe" in b or "Karton" in b:
                            clean_branch = "Papier"
                        elif "Chemie" in b or "Chemische" in b or "Pigmente" in b:
                            clean_branch = "Chemie"
                        elif "Nahrungsmittel" in b:
                            clean_branch = "Ernährung"
                        elif "Textil" in b:
                            clean_branch = "Textil"
                        elif "Wasserkraft" in b:
                            clean_branch = "Energie"
                        elif "Verband" in b or "Wirtschaft" in b:
                            clean_branch = "Wirtschaftsverband"
                        else:
                            clean_branch = b
                    
                    gewerbe_mapping[display_name] = f"Gewerbe-/ Industriebetrieb Nr. {gewerbe_counter} – Branche {clean_branch}"
                    gewerbe_counter += 1
                
                display_name = gewerbe_mapping[display_name]

        # Round coordinates to 6 decimal places (~10cm accuracy) or group by float tuple
        # WGS84 conversion first depending on UTM Zone (31N or 32N)
        if epsg_x == 25831 or epsg_y == 25831:
            lon, lat = transformer_31.transform(x, y)
        else:
            lon, lat = transformer_32.transform(x, y)
        coord_key = (round(lon, 6), round(lat, 6))

        if coord_key not in grouped_points:
            grouped_points[coord_key] = {
                'institutions': set(),
                'groups': set(),
                'coordinates': [lon, lat]
            }
        
        grouped_points[coord_key]['institutions'].add(display_name)
        grouped_points[coord_key]['groups'].add(group)

    features = []
    idx_counter = 0

    for coord_key, data in grouped_points.items():
        # Combine unique institution names at this coordinate
        joined_names = " / ".join(sorted(list(data['institutions'])))
        
        # Pick group (default to first sorted group or most common)
        groups_list = sorted(list(data['groups']))
        group = groups_list[0] if groups_list else 'Sonstige'
        color = GROUP_COLORS.get(group, '#8b5cf6')

        feature = {
            "type": "Feature",
            "id": f"anon_{idx_counter}",
            "geometry": {
                "type": "Point",
                "coordinates": data['coordinates']
            },
            "properties": {
                "name": joined_names,
                "group": group,
                "color": color
                # Omitted: phone, email, description, personal names to ensure total anonymity
            }
        }
        features.append(feature)
        idx_counter += 1

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully aggregated and anonymized into {len(features)} points at {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
