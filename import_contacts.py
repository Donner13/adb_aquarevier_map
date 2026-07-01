import pandas as pd
import pyproj
import json
import os

EXCEL_PATH = r"C:\Users\user\Downloads\ADB_AquaRevier_260701_172800.xlsx"
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

def main():
    print(f"Reading Excel: {EXCEL_PATH}")
    if not os.path.exists(EXCEL_PATH):
        print("Error: Excel file does not exist!")
        return

    df = pd.read_excel(EXCEL_PATH)
    
    # Strip column names
    df.columns = [c.strip() for c in df.columns]
    
    print("Columns found:", list(df.columns))

    # Set up UTM 32N to WGS84 transformer
    # EPSG:25832 is UTM zone 32N (used in NRW / Germany)
    transformer = pyproj.Transformer.from_crs("epsg:25832", "epsg:4326", always_xy=True)

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
        
        x = row.get(east_col)
        y = row.get(north_col)
        
        if pd.isna(x) or pd.isna(y):
            # Skip rows without coordinates
            continue
            
        try:
            x = float(x)
            y = float(y)
        except ValueError:
            continue

        # Convert UTM 32N to WGS84
        lon, lat = transformer.transform(x, y)
        
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
