"""
Scrapt Regenbecken/-entlastungsanlagen fuer die 7 Kreise des Revier.
"""
import asyncio
import json
import os
import re
import sys
from playwright.async_api import async_playwright

sys.path.insert(0, r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\elwas_toolkit")
import elwas_client as ec

# Import des DataQualityGate
from elwas_raw_data.data_quality_gate import DataQualityGate

BASE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(BASE, "regenbecken.json")

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
    m = re.search(rf"{re.escape(label)}[\t:][ \t]*([^\n\r]*)", text)
    if not m:
        m = re.search(rf"{re.escape(label)}[ \t]*([^\n\r]*)", text)
    if m:
        val = m.group(1).strip()
        val = re.sub(r'[^\d\.,\s\-]', '', val).strip()
        if re.match(r'^[\d\.,\s\-]+$', val or ""):
            return val
    return None

def extract_text(label, text):
    m = re.search(rf"{re.escape(label)}[\t:][ \t]*([^\n\r]*)", text)
    if not m:
        m = re.search(rf"{re.escape(label)}[ \t]*([^\n\r]*)", text)
    if m:
        val = m.group(1).strip()
        return val if val else None
    return None

def extract_name_nr(text):
    name = extract_text("Name des Sonderbauwerks", text)
    nr = extract_text("Sonderbauwerk-Nr.", text)
    return name, nr

async def main():
    results = {}
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            try:
                results = json.load(f)
            except Exception:
                results = {}

    async with async_playwright() as p:
        browser, page = await ec.new_browser(p)
        catalog = ec.load_sitemap()
        match = next(c for c in catalog if "Regenbecken" in c["text"])

        all_kreis_counts = {}
        for kreis in KREISE:
            print(f"\n=== Kreis: {kreis} ===", flush=True)
            await ec.open_dataset(page, match["href"])
            frame = await ec.get_frame(page)
            
            try:
                await frame.wait_for_selector("input[value='Suchen'], select", state="attached", timeout=8000)
            except Exception:
                pass

            try:
                await ec.fill_regional_search(page, frame, kreis)
            except Exception as e:
                print(f"  Regional search failed: {e}", flush=True)
                continue
            await ec.submit_search(frame, wait_ms=3000)

            n = await ec.get_result_row_count(frame)
            print(f"  {n} Regenbecken gefunden", flush=True)
            all_kreis_counts[kreis] = n

        # Pre-Scrape Data Quality Gate: Row-Count-Tripwire
        gate = DataQualityGate()
        try:
            gate.check_row_count_tripwire("regenbecken", sum(all_kreis_counts.values()), all_kreis_counts)
        except RuntimeError as e:
            print(e)
            print("Scraping abgebrochen aufgrund des Row-Count-Tripwires.")
            await browser.close()
            return # Skript beenden

        # Reset page for actual scraping after tripwire check
        await page.goto(match["href"])
        frame = await ec.get_frame(page)

        for kreis in KREISE:
            print(f"\n=== Kreis: {kreis} ===", flush=True)
            await ec.open_dataset(page, match["href"])
            frame = await ec.get_frame(page)
            
            try:
                await frame.wait_for_selector("input[value='Suchen'], select", state="attached", timeout=8000)
            except Exception:
                pass

            try:
                await ec.fill_regional_search(page, frame, kreis)
            except Exception as e:
                print(f"  Regional search failed: {e}", flush=True)
                continue
            await ec.submit_search(frame, wait_ms=3000)

            n = all_kreis_counts[kreis] # Verwende die bereits ermittelte Anzahl
            if n == 0:
                continue

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
                    
                    detail_text = await frame.locator("body").inner_text()
                    name, anlagen_nr = extract_name_nr(detail_text)
                    if not anlagen_nr:
                        anlagen_nr = f"unknown_{kreis}_{idx}"
                    
                    if anlagen_nr in results and "error" not in results[anlagen_nr]:
                        print(f"  {anlagen_nr} bereits geladen.", flush=True)
                        await frame.click("text=Ergebnisse")
                        await page.wait_for_timeout(1200)
                        links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                        continue

                    ost = extract_num("Ostwert in UTM (Zone 32N)", detail_text)
                    nord = extract_num("Nordwert in UTM (Zone 32N)", detail_text)
                    betreiber = extract_text("Zustellanschrift", detail_text)
                    typ = extract_text("Typ", detail_text)

                    results[anlagen_nr] = {
                        "name": name or (meta[1] if len(meta) > 1 else None),
                        "kreis": kreis,
                        "utm_east": ost,
                        "utm_north": nord,
                        "betreiber": betreiber,
                        "gewaesser": None,
                        "typ": typ
                    }
                    print(f"  {anlagen_nr}: {name} Ost={ost} Nord={nord} Betreiber={betreiber}", flush=True)

                    await frame.click("text=Ergebnisse")
                    await page.wait_for_timeout(1500)
                    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                except Exception as e:
                    print(f"  Fehler bei idx {idx}: {e}", flush=True)
                    results[f"error_{kreis}_{idx}"] = {"error": str(e), "kreis": kreis}
                    try:
                        await ec.open_dataset(page, match["href"])
                        frame = await ec.get_frame(page)
                        await ec.fill_regional_search(page, frame, kreis)
                        await ec.submit_search(frame, wait_ms=3000)
                        links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                    except Exception:
                        pass

                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

        await browser.close()
    print(f"\nFertig. {len([r for r in results.values() if 'error' not in r])} Regenbecken gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
