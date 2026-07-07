import pandas as pd
import pyproj
import json
import os

EXCEL_PATH = r"C:\Users\user\Downloads\ADB_260706.xlsx"
OUTPUT_PATH = r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\contacts.geojson"

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
    
    print("Columns found:", list(df.columns))

    # Set up UTM to WGS84 transformers
    transformer_32 = pyproj.Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)
    transformer_31 = pyproj.Transformer.from_crs("epsg:25831", "epsg:4326", always_xy=True)

    features = []
    
    for idx, row in df.iterrows():
        # Get coordinates
        east_col = 'Rechtswert\n(UTM 32U)'
        north_col = 'Hochwert\n(UTM 32U)'
        
        # Check if column names are slightly different due to newlines
        if east_col not in df.columns:
            # Fallback search
            for col in df.columns:
                if 'Rechtswert' in col:
                    east_col = col
                if 'Hochwert' in col:
                    north_col = col
        
        x_val = row.get(east_col)
        y_val = row.get(north_col)
        
        x, epsg_x = parse_coordinate(x_val)
        y, epsg_y = parse_coordinate(y_val)
        
        if x is None or y is None:
            # Skip rows without coordinates
            continue

        # Convert UTM to WGS84 depending on UTM Zone (31N or 32N)
        if epsg_x == 25831 or epsg_y == 25831:
            lon, lat = transformer_31.transform(x, y)
        else:
            lon, lat = transformer_32.transform(x, y)
        
        # Extract metadata
        inst = row.get('Voller Akteursname (Institution/Organisation)', '')
        abkr = row.get('Akteursabkürzung', '')
        if pd.isna(abkr):
            abkr = row.get('Akteursabkrzung', '') # handle encoding artifact
        
        last_name = row.get('Nachname', '')
        first_name = row.get('Vorname', '')
        # Check for leading space version
        if 'Vorname' not in df.columns:
            for col in df.columns:
                if 'Vorname' in col:
                    first_name = row.get(col, '')

        # Build clean name
        name_parts = []
        if not pd.isna(first_name) and str(first_name).strip():
            name_parts.append(str(first_name).strip())
        if not pd.isna(last_name) and str(last_name).strip():
            name_parts.append(str(last_name).strip())
            
        person_name = " ".join(name_parts)
        
        institution_str = str(inst).strip() if not pd.isna(inst) else ""
        abbreviation_str = str(abkr).strip() if not pd.isna(abkr) else ""
        
        if person_name:
            if institution_str:
                display_name = f"{person_name} ({institution_str})"
            else:
                display_name = person_name
        else:
            if institution_str:
                if abbreviation_str:
                    display_name = f"{institution_str} ({abbreviation_str})"
                else:
                    display_name = institution_str
            else:
                display_name = abbreviation_str or f"Akteur #{idx}"

        group = str(row.get('Gruppe', 'Sonstige')).strip()
        # Clean up spelling if needed
        if 'Beh' in group:
            group = 'Behörde'
        elif 'Gebiets' in group:
            group = 'Gebietskörperschaft'
            
        color = GROUP_COLORS.get(group, '#8b5cf6')
        
        desc = row.get('Kommentar', '')
        desc_str = str(desc).strip() if not pd.isna(desc) and str(desc).strip() != '-' else ''
        
        phone = row.get('Tel.-Nummer', '')
        phone_str = str(phone).strip() if not pd.isna(phone) and str(phone).strip() != '-' else ''
        
        email = row.get('E-Mail', '')
        email_str = str(email).strip() if not pd.isna(email) and str(email).strip() != '-' else ''
        
        feature = {
            "type": "Feature",
            "id": f"excel_{idx}",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "name": display_name,
                "group": group,
                "description": desc_str,
                "phone": phone_str,
                "email": email_str,
                "color": color
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully imported {len(features)} contacts to {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
