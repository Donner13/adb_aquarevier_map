import asyncio
import pandas as pd
import re
import os
import json
import sys
from playwright.async_api import async_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE, "matching_companies.csv")
PROGRESS_PATH = os.path.join(BASE, "scrape_progress.json")
ENRICHED_CSV_PATH = os.path.join(BASE, "elwas_enriched_companies.csv")

LIMIT = None  # set to an int for quick tests, None for full run
ONLY_BET_NRS = None  # e.g. ["22225"] to restrict to specific companies for testing

def extract_field(label, text):
    label_esc = re.escape(label).replace(r'\?', '.')
    pattern = re.compile(rf"{label_esc}\s*([^\n\r]*)", re.IGNORECASE)
    m = pattern.search(text)
    if m:
        val = m.group(1).strip()
        if not val:
            return None
        if not re.match(r'^[\d\.,\s\-]+$', val):
            return None
        return val
    return None

async def scrape_company(frame, page, bet_nr):
    print(f"\n--- Scraping details for Betriebs-Nr: {bet_nr} ---", flush=True)

    bet_nr_input = frame.locator("id=cContainer:cCommonBodyContainer:j_idt570:searchT80Betrieb:searchPanel2Col:betriebsnummerRow:betriebsnummer")
    await bet_nr_input.fill("")
    await bet_nr_input.fill(str(bet_nr))
    await page.wait_for_timeout(400)

    search_btn = frame.locator("input[value='Suchen']")
    await search_btn.first.click()
    await page.wait_for_timeout(2500)

    button_links = frame.locator("input.buttonLink")
    if await button_links.count() == 0:
        print(f"No results found for Betriebs-Nr {bet_nr}", flush=True)
        return None

    await button_links.first.click()
    await page.wait_for_timeout(2200)

    body_text = await frame.locator("body").inner_text()
    ost_val = extract_field("Ostwert in UTM (Zone 32N)", body_text)
    nord_val = extract_field("Nordwert in UTM (Zone 32N)", body_text)
    print(f"Coordinates: Ost={ost_val}, Nord={nord_val}", flush=True)

    select_elem = frame.locator("select:has(option:has-text('Anfallstelle'))")
    anfallstellen_data = []

    if await select_elem.count() > 0:
        await select_elem.first.select_option(label="Anfallstelle")
        await page.wait_for_timeout(1800)

        rows = frame.locator("tbody.ui-datatable-data tr")
        rows_count = await rows.count()

        first_row_text = ""
        if rows_count > 0:
            first_row_text = await rows.first.inner_text()

        if rows_count > 0 and "Keine Datens" not in first_row_text:
            # Capture list-level info (Bezeichnung, Abwasserbeschaffenheit, Anhang) before clicking in
            list_meta = []
            for r in range(rows_count):
                cells = frame.locator("tbody.ui-datatable-data tr").nth(r).locator("td")
                cell_count = await cells.count()
                texts = [ (await cells.nth(c).inner_text()).strip() for c in range(cell_count) ]
                list_meta.append(texts)

            nr_links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
            links_count = await nr_links.count()
            print(f"Found {links_count} Anfallstellen.", flush=True)

            for idx in range(links_count):
                meta = list_meta[idx] if idx < len(list_meta) else []
                bezeichnung = meta[1] if len(meta) > 1 else None
                beschaffenheit = meta[2] if len(meta) > 2 else None
                anhang = meta[4] if len(meta) > 4 else None

                print(f"  Clicking Anfallstelle {idx+1}/{links_count} ({beschaffenheit})...", flush=True)
                try:
                    await nr_links.nth(idx).click()
                    await page.wait_for_timeout(1800)

                    detail_text = await frame.locator("body").inner_text()

                    max_d = extract_field("maximaler Abwasservolumenstrom [m³/d]", detail_text)
                    max_h = extract_field("maximaler Abwasservolumenstrom [m³/h]", detail_text)
                    max_a = extract_field("Gesamtabwasseranfall im Jahr [m³/a]", detail_text)

                    anfallstellen_data.append({
                        "nr": idx + 1,
                        "bezeichnung": bezeichnung,
                        "abwasserbeschaffenheit": beschaffenheit,
                        "anhang": anhang,
                        "max_d": max_d,
                        "max_h": max_h,
                        "max_a": max_a
                    })
                    print(f"    Values: max_d={max_d}, max_h={max_h}, max_a={max_a}", flush=True)

                    obj_tab = frame.locator("text=Objektdetails")
                    await obj_tab.first.click()
                    await page.wait_for_timeout(1200)

                    await select_elem.first.select_option(label="Anfallstelle")
                    await page.wait_for_timeout(1200)
                    nr_links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
                except Exception as e:
                    print(f"    Error on Anfallstelle {idx+1}: {e}", flush=True)
                    anfallstellen_data.append({
                        "nr": idx + 1,
                        "bezeichnung": bezeichnung,
                        "abwasserbeschaffenheit": beschaffenheit,
                        "anhang": anhang,
                        "error": str(e)
                    })
                    # try to recover navigation state
                    try:
                        await frame.click("text=Einleitende Betriebe")
                        await page.wait_for_timeout(1500)
                    except Exception:
                        pass
                    break
        else:
            print("No Anfallstellen recorded for this company.", flush=True)

    return {
        "utm_east": ost_val,
        "utm_north": nord_val,
        "anfallstellen": anfallstellen_data
    }

async def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: matching_companies.csv not found at {CSV_PATH}")
        return

    df = pd.read_csv(CSV_PATH)
    if ONLY_BET_NRS:
        df = df[df['Betriebs-Nr'].astype(str).isin(ONLY_BET_NRS)]
    if LIMIT:
        df = df.head(LIMIT)
    total_companies = len(df)
    print(f"Loaded {total_companies} companies to scrape.", flush=True)

    progress = {}
    if os.path.exists(PROGRESS_PATH):
        try:
            with open(PROGRESS_PATH, "r", encoding="utf-8") as f:
                progress = json.load(f)
            print(f"Resuming from progress. Already scraped {len(progress)} / {total_companies} companies.", flush=True)
        except Exception as e:
            print(f"Could not load progress: {e}", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        print("Navigating to ELWAS-WEB...", flush=True)
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")

        accept_btn = page.locator("text=Nutzungsbedingungen akzeptieren")
        if await accept_btn.count() > 0:
            await accept_btn.first.click()
            await page.wait_for_timeout(800)

        await page.click("a#adatal")
        await page.wait_for_timeout(1500)

        frame = page.frame(name="mainDataIframe")
        if not frame:
            print("Error: mainDataIframe not found!")
            await browser.close()
            return

        await frame.click("text=Einleitende Betriebe")
        await page.wait_for_timeout(3000)

        for idx, row in df.iterrows():
            bet_nr = str(row['Betriebs-Nr'])
            if bet_nr in progress and "error" not in progress[bet_nr]:
                continue

            try:
                await page.click("a#adatal")
                await page.wait_for_timeout(1000)
                await frame.click("text=Einleitende Betriebe")
                await page.wait_for_timeout(2000)

                res = await scrape_company(frame, page, bet_nr)
                if res:
                    progress[bet_nr] = res
                else:
                    progress[bet_nr] = {"error": "No results or details"}
            except Exception as e:
                print(f"Error scraping company {bet_nr}: {e}", flush=True)
                progress[bet_nr] = {"error": str(e)}

            with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
                json.dump(progress, f, indent=2, ensure_ascii=False)

        await browser.close()

    print("\nScraping completed! Enriched data written to progress JSON.", flush=True)

    enriched_rows = []
    for idx, row in df.iterrows():
        bet_nr = str(row['Betriebs-Nr'])
        data = progress.get(bet_nr, {})
        row_dict = row.to_dict()
        row_dict['utm_east'] = data.get('utm_east')
        row_dict['utm_north'] = data.get('utm_north')

        anfallstellen = data.get('anfallstellen', [])
        row_dict['anfallstellen_json'] = json.dumps(anfallstellen, ensure_ascii=False)

        max_d_vals = [a['max_d'] for a in anfallstellen if a.get('max_d')]
        max_h_vals = [a['max_h'] for a in anfallstellen if a.get('max_h')]
        max_a_vals = [a['max_a'] for a in anfallstellen if a.get('max_a')]

        row_dict['max_abwasservolumen_d'] = "; ".join(max_d_vals) if max_d_vals else ""
        row_dict['max_abwasservolumen_h'] = "; ".join(max_h_vals) if max_h_vals else ""
        row_dict['gesamtabwasser_a'] = "; ".join(max_a_vals) if max_a_vals else ""

        enriched_rows.append(row_dict)

    enriched_df = pd.DataFrame(enriched_rows)
    enriched_df.to_csv(ENRICHED_CSV_PATH, index=False, encoding="utf-8-sig")
    print(f"Enriched CSV saved to: {ENRICHED_CSV_PATH}", flush=True)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        ONLY_BET_NRS = ["22225"]
    asyncio.run(main())
