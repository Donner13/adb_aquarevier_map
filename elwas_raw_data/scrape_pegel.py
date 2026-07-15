"""
Scrapt Pegel (Flusspegel) fuer die 7 Kreise des Rheinischen Reviers.
Kleiner Datensatz (~6-10 pro Kreis) - Koordinaten stehen auf der
Detailseite unter dem Tab "Lage".
"""
import asyncio
import json
import os
import re
import sys
from playwright.async_api import async_playwright

sys.path.insert(0, r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\elwas_toolkit")
import elwas_client as ec

BASE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(BASE, "pegel.json")

KREISE = [
    "Städteregion Aachen",
    "Heinsberg",
    "Mönchengladbach",
    "Rhein-Kreis Neuss",
    "Düren",
    "Rhein-Erft-Kreis",
    "Euskirchen",
]

def extract_num(label, text):
    m = re.search(rf"{re.escape(label)}\t([^\n\r]*)", text)
    if m:
        val = m.group(1).strip()
        if re.match(r'^[\d\.,\s\-]+$', val or ""):
            return val
    return None

def extract_name_nr(text):
    m = re.search(r"\n([^\n]+?)\s*\((\d+)\)", text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return None, None

async def main():
    results = {}
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            results = json.load(f)

    async with async_playwright() as p:
        browser, page = await ec.new_browser(p)
        catalog = ec.load_sitemap()
        match = next(c for c in catalog if c["text"] == "Pegel")

        for kreis in KREISE:
            print(f"\n=== Kreis: {kreis} ===", flush=True)
            await ec.open_dataset(page, match["href"])
            frame = await ec.get_frame(page)
            try:
                await ec.fill_regional_search(page, frame, kreis)
            except Exception as e:
                print(f"  Regional search failed: {e}", flush=True)
                continue
            await ec.submit_search(frame, wait_ms=3000)

            n = await ec.get_result_row_count(frame)
            print(f"  {n} Pegel gefunden", flush=True)

            row_info = []
            for r in range(n):
                cells = frame.locator("tbody.ui-datatable-data tr").nth(r).locator("td")
                cc = await cells.count()
                texts = [(await cells.nth(c).inner_text()).strip() for c in range(cc)]
                row_info.append(texts)

            links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
            link_count = await links.count()

            for idx in range(link_count):
                meta = row_info[idx] if idx < len(row_info) else []
                try:
                    await links.nth(idx).click()
                    await page.wait_for_timeout(2000)
                    header_text = await frame.locator("body").inner_text()
                    name, pegel_nr = extract_name_nr(header_text)
                    if not pegel_nr:
                        pegel_nr = f"unknown_{kreis}_{idx}"
                    if pegel_nr in results and "error" not in results[pegel_nr]:
                        await frame.click("text=Ergebnisse")
                        await page.wait_for_timeout(1200)
                        links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                        continue

                    select_elem = frame.locator("select:has(option:has-text('Lage'))")
                    ost = nord = None
                    if await select_elem.count() > 0:
                        await select_elem.first.select_option(label="Lage")
                        await page.wait_for_timeout(1500)
                        lage_text = await frame.locator("body").inner_text()
                        ost = extract_num("Ostwert in UTM", lage_text)
                        nord = extract_num("Nordwert in UTM", lage_text)

                    results[pegel_nr] = {
                        "name": name or (meta[3] if len(meta) > 3 else None),
                        "kreis": kreis,
                        "utm_east": ost,
                        "utm_north": nord,
                        "gewaesser": meta[3] if len(meta) > 3 else None,
                        "betreiber": meta[4] if len(meta) > 4 else None,
                        "einzugsgebiet_km2": meta[6] if len(meta) > 6 else None,
                        "mq_m3s": meta[11] if len(meta) > 11 else None,
                        "hq_m3s": meta[13] if len(meta) > 13 else None,
                    }
                    print(f"  {pegel_nr}: {name} Ost={ost} Nord={nord}", flush=True)

                    await frame.click("text=Ergebnisse")
                    await page.wait_for_timeout(1500)
                    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                except Exception as e:
                    print(f"  Fehler bei idx {idx}: {e}", flush=True)
                    results[f"error_{kreis}_{idx}"] = {"error": str(e), "kreis": kreis}

                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

        await browser.close()
    print(f"\nFertig. {len([r for r in results.values() if 'error' not in r])} Pegel gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
