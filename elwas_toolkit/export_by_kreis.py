"""
Generic bulk-export helper: for a given ELWAS dataset URL, run the regional
search for each of the 7 Rheinisches-Revier-Kreise and download the Excel
export for each. Much faster than row-by-row scraping when a dataset has
the "Excel Export" button (confirmed for Klaeranlagen, Grundwassermessstellen).

Usage: python export_by_kreis.py "<dataset name from sitemap_links.json>" <output_dir>
"""
import asyncio
import os
import sys
from playwright.async_api import async_playwright
import elwas_client as ec

KREISE = [
    "Städteregion Aachen",
    "Heinsberg",
    "Mönchengladbach",
    "Rhein-Kreis Neuss",
    "Düren",
    "Rhein-Erft-Kreis",
    "Euskirchen",
]

async def export_dataset_for_kreis(page, frame, dataset_href, kreis, out_dir):
    await ec.open_dataset(page, dataset_href)
    frame = await ec.get_frame(page)
    await ec.fill_regional_search(page, frame, kreis)
    await ec.submit_search(frame, wait_ms=3000)
    if not await ec.has_excel_export(frame):
        print(f"  [!] Kein Excel-Export fuer {kreis} verfuegbar")
        return None
    path = await ec.click_excel_export(frame, page, out_dir)
    # rename to include kreis name
    safe_kreis = kreis.replace(" ", "_").replace("/", "_")
    new_path = os.path.join(out_dir, f"{safe_kreis}_{os.path.basename(path)}")
    os.replace(path, new_path)
    print(f"  -> {new_path}")
    return new_path

async def main():
    dataset_query = sys.argv[1]
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)

    catalog = ec.load_sitemap()
    match = next((c for c in catalog if dataset_query.lower() in c["text"].lower()), None)
    if not match:
        print("Dataset not found. Available:")
        for c in catalog:
            print(" -", c["text"])
        return

    print(f"Dataset: {match['text']}")
    async with async_playwright() as p:
        browser, page = await ec.new_browser(p)
        frame = None
        for kreis in KREISE:
            print(f"Exporting for {kreis}...")
            try:
                await export_dataset_for_kreis(page, frame, match["href"], kreis, out_dir)
            except Exception as e:
                print(f"  [error] {kreis}: {e}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
