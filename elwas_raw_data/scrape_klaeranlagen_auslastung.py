"""
Scrapt zusaetzlich die aktuelle Auslastung fuer die Klaeranlagen.
Aktualisiert elwas_raw_data/klaeranlagen.json
"""
import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "elwas_toolkit"))
import elwas_client as ec

BASE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(BASE, "klaeranlagen.json")

KREISE = [
    "Städteregion Aachen",
    "Heinsberg",
    "Mönchengladbach",
    "Rhein-Kreis Neuss",
    "Düren",
    "Rhein-Erft-Kreis",
    "Euskirchen",
]

def extract_name_nr(text):
    import re
    m = re.search(r"Kläranlage:\s*(.+?)\s*\((\d+)\)", text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return None, None

async def main():
    if not os.path.exists(OUT_PATH):
        print("Fehler: klaeranlagen.json existiert nicht.")
        return

    with open(OUT_PATH, encoding="utf-8") as f:
        results = json.load(f)

    async with async_playwright() as p:
        browser, page = await ec.new_browser(p)
        catalog = ec.load_sitemap()
        match = next(c for c in catalog if "ranlagen" in c["text"])

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
            print(f"  {n} Klaeranlagen gefunden", flush=True)

            links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
            link_count = await links.count()

            for idx in range(link_count):
                try:
                    await links.nth(idx).click()
                    await page.wait_for_timeout(2000)

                    header_text = await frame.locator("body").inner_text()
                    name, anlagen_nr = extract_name_nr(header_text)
                    if not anlagen_nr:
                        anlagen_nr = f"unknown_{kreis}_{idx}"

                    if anlagen_nr in results and "error" not in results[anlagen_nr]:
                        if "aktuelle_auslastung_ew" not in results[anlagen_nr]:
                            select_elem = frame.locator("select:has(option:has-text('Aktuelle Auslastung'))")
                            if await select_elem.count() > 0:
                                await select_elem.first.select_option(label="Aktuelle Auslastung")
                                await page.wait_for_timeout(1500)
                                auslastung_text = await frame.locator("body").inner_text()

                                lines = auslastung_text.split('\n')
                                for i, line in enumerate(lines):
                                    if "Erhebungsjahr" in line and "angeschl. Einwohnerwerte [EW]" in line:
                                        header = line.split('\t')
                                        try:
                                            ew_idx = header.index("angeschl. Einwohnerwerte [EW]")
                                            year_idx = header.index("Erhebungsjahr") if "Erhebungsjahr" in header else 0
                                            best_year = -1
                                            best_ew = None

                                            for j in range(i+1, len(lines)):
                                                row = lines[j].split('\t')
                                                if len(row) > max(ew_idx, year_idx):
                                                    year_str = row[year_idx].strip()
                                                    ew_val = row[ew_idx].replace('.', '').strip()
                                                    if year_str.isdigit() and ew_val.isdigit():
                                                        year = int(year_str)
                                                        if year > best_year:
                                                            best_year = year
                                                            best_ew = ew_val

                                            if best_ew is not None:
                                                results[anlagen_nr]["aktuelle_auslastung_ew"] = best_ew
                                                results[anlagen_nr]["aktuelle_auslastung_jahr"] = str(best_year)
                                                print(f"  {anlagen_nr}: EW = {best_ew} (Jahr {best_year})")
                                                break
                                        except ValueError:
                                            pass
                        else:
                            print(f"  {anlagen_nr}: already has EW ({results[anlagen_nr]['aktuelle_auslastung_ew']})")

                    await frame.click("text=Ergebnisse")
                    await page.wait_for_timeout(1500)
                    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                except Exception as e:
                    print(f"  Fehler bei idx {idx}: {e}", flush=True)
                    try:
                        await ec.open_dataset(page, match["href"])
                        frame = await ec.get_frame(page)
                        await ec.fill_regional_search(page, frame, kreis)
                        await ec.submit_search(frame, wait_ms=3000)
                        links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                    except Exception:
                        pass

                # Save intermediate results
                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

        await browser.close()
    print(f"\nFertig.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
