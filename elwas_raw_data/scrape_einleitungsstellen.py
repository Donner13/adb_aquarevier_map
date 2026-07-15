import asyncio
import pandas as pd
import re
import os
import json
from playwright.async_api import async_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE, "matching_companies.csv")
PROGRESS_PATH = os.path.join(BASE, "scrape_progress_einleitungsstellen.json")

def extract_text_field(label, text):
    """Like extract_field but allows any text value (for Gewaessername etc.)."""
    label_esc = re.escape(label)
    pattern = re.compile(rf"{label_esc}\t([^\n\r]*)", re.IGNORECASE)
    m = pattern.search(text)
    if m:
        val = m.group(1).strip()
        return val if val else None
    return None

def extract_num_field(label, text):
    label_esc = re.escape(label)
    pattern = re.compile(rf"{label_esc}\t([^\n\r]*)", re.IGNORECASE)
    m = pattern.search(text)
    if m:
        val = m.group(1).strip()
        if not val or not re.match(r'^[\d\.,\s\-]+$', val):
            return None
        return val
    return None

async def scrape_company(frame, page, bet_nr):
    print(f"\n--- Einleitungsstellen fuer Betriebs-Nr: {bet_nr} ---", flush=True)

    bet_nr_input = frame.locator("id=cContainer:cCommonBodyContainer:j_idt570:searchT80Betrieb:searchPanel2Col:betriebsnummerRow:betriebsnummer")
    await bet_nr_input.fill("")
    await bet_nr_input.fill(str(bet_nr))
    await page.wait_for_timeout(400)
    await frame.locator("input[value='Suchen']").first.click()
    await page.wait_for_timeout(2500)

    button_links = frame.locator("input.buttonLink")
    if await button_links.count() == 0:
        print(f"No results for {bet_nr}", flush=True)
        return None
    await button_links.first.click()
    await page.wait_for_timeout(2200)

    select_elem = frame.locator("select:has(option:has-text('Einleitungsstellen'))")
    einleitungsstellen_data = []

    if await select_elem.count() > 0:
        await select_elem.first.select_option(label="Einleitungsstellen")
        await page.wait_for_timeout(1800)

        rows = frame.locator("tbody.ui-datatable-data tr")
        rows_count = await rows.count()
        first_row_text = await rows.first.inner_text() if rows_count > 0 else ""

        if rows_count > 0 and "Keine Datens" not in first_row_text:
            list_meta = []
            for r in range(rows_count):
                cells = frame.locator("tbody.ui-datatable-data tr").nth(r).locator("td")
                cc = await cells.count()
                texts = [(await cells.nth(c).inner_text()).strip() for c in range(cc)]
                list_meta.append(texts)

            links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
            links_count = await links.count()
            print(f"Found {links_count} Einleitungsstellen.", flush=True)

            for idx in range(links_count):
                meta = list_meta[idx] if idx < len(list_meta) else []
                bezeichnung = meta[0] if len(meta) > 0 else None
                abwasserart = meta[-1] if meta else None

                print(f"  Oeffne Einleitungsstelle {idx+1}/{links_count} ({bezeichnung})...", flush=True)
                try:
                    await links.nth(idx).click()
                    await page.wait_for_timeout(1800)

                    detail_text = await frame.locator("body").inner_text()

                    bezeichnung_detail = extract_text_field("Bezeichnung", detail_text)
                    ost = extract_num_field("Ostwert in UTM (Zone 32N)", detail_text)
                    nord = extract_num_field("Nordwert in UTM (Zone 32N)", detail_text)
                    gewaesser_alias = extract_text_field("Gewässername Alias", detail_text)
                    gewaesser_line = extract_text_field("Gewässerkennzahl / Gewässername / Auflage", detail_text)
                    gewaesser_name = None
                    if gewaesser_line:
                        parts = [p.strip() for p in gewaesser_line.split("/")]
                        if len(parts) >= 2:
                            gewaesser_name = parts[1]

                    einleitungsstellen_data.append({
                        "bezeichnung": bezeichnung_detail or bezeichnung,
                        "abwasserart": abwasserart,
                        "utm_east": ost,
                        "utm_north": nord,
                        "gewaesser_alias": gewaesser_alias,
                        "gewaesser_name": gewaesser_name or gewaesser_alias,
                    })
                    print(f"    Gewaesser: {gewaesser_name or gewaesser_alias}, Ost={ost}, Nord={nord}", flush=True)

                    obj_tab = frame.locator("text=Objektdetails")
                    await obj_tab.first.click()
                    await page.wait_for_timeout(1200)
                    await select_elem.first.select_option(label="Einleitungsstellen")
                    await page.wait_for_timeout(1200)
                    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
                except Exception as e:
                    print(f"    Fehler bei Einleitungsstelle {idx+1}: {e}", flush=True)
                    einleitungsstellen_data.append({"bezeichnung": bezeichnung, "error": str(e)})
                    try:
                        await frame.click("text=Einleitende Betriebe")
                        await page.wait_for_timeout(1500)
                    except Exception:
                        pass
                    break
        else:
            print("Keine Einleitungsstellen fuer diesen Betrieb.", flush=True)

    return {"einleitungsstellen": einleitungsstellen_data}

async def main():
    df = pd.read_csv(CSV_PATH)
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        df = df[df['Betriebs-Nr'].astype(str) == "22225"]
    total = len(df)
    print(f"Loaded {total} companies.", flush=True)

    progress = {}
    if os.path.exists(PROGRESS_PATH):
        try:
            with open(PROGRESS_PATH, encoding="utf-8") as f:
                progress = json.load(f)
            print(f"Resuming. Already done: {len(progress)}/{total}", flush=True)
        except Exception as e:
            print(f"Could not load progress: {e}", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        await page.goto("https://www.elwasweb.nrw.de/", wait_until="networkidle", timeout=60000)
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
                progress[bet_nr] = res if res else {"error": "no results"}
            except Exception as e:
                print(f"Fehler bei Betrieb {bet_nr}: {e}", flush=True)
                progress[bet_nr] = {"error": str(e)}

            with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
                json.dump(progress, f, indent=2, ensure_ascii=False)

        await browser.close()
    print("\nFertig!", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
