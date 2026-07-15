import pandas as pd
import glob
import os
import re

files = glob.glob("C:/Users/user/.gemini/scratch/elwas_export_*.xlsx")
print(f"Found {len(files)} excel files:")

annex_targets = {3, 10, 22, 28, 29, 38, 40, 55}
all_matching = []

for file in files:
    district_name = os.path.basename(file).replace("elwas_export_", "").replace(".xlsx", "")
    df = pd.read_excel(file, header=None)
    
    # Header is at row 4 (index 4)
    # Let's find the row that has 'Betriebs-Nr'
    header_row_idx = None
    for r in range(len(df)):
        if "Betriebs-Nr" in [str(x) for x in df.iloc[r]]:
            header_row_idx = r
            break
            
    if header_row_idx is None:
        print(f"Could not find header row in {file}!")
        continue
        
    df.columns = df.iloc[header_row_idx]
    df = df.iloc[header_row_idx+1:].reset_index(drop=True)
    df = df.dropna(subset=['Betriebs-Nr'])
    
    df['District'] = district_name
    
    # Filter by Anhang der AbwV
    # The column name is 'Anhang der AbwV'
    # Format is usually '40 Metallbearbeitung...' or '28 Herstellung...'
    # Let's parse the number
    def get_annex_num(val):
        if pd.isna(val):
            return None
        m = re.match(r'^\s*(\d+)', str(val))
        if m:
            return int(m.group(1))
        return None
        
    df['Annex_Num'] = df['Anhang der AbwV'].apply(get_annex_num)
    matching = df[df['Annex_Num'].isin(annex_targets)].copy()
    all_matching.append(matching)
    
    print(f"  {district_name}: Total {len(df)} companies, {len(matching)} matching annexes {annex_targets}.")

if all_matching:
    final_df = pd.concat(all_matching, ignore_index=True)
    print(f"\nTotal matching companies: {len(final_df)}")
    print(final_df[['District', 'Betriebs-Nr', 'Betriebsname', 'Anhang der AbwV']].head(20))
    final_df.to_csv("matching_companies.csv", index=False)
