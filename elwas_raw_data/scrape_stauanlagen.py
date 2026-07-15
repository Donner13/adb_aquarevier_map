"""
Scrapt Stauanlagen fuer die 7 Kreise des Rheinischen Reviers.
Koordinaten stehen direkt auf der Detailseite (Stammdaten-Default-Tab).
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
OUT_PATH = os.path.join(BASE, "stauanlagen.json")

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
    name = extract_text("Name der Stauanlage", text)
    # e.g., "Talsperre: Rurtalsperre Schwammenauel (12)"
    m = re.search(r"\n[A-Za-zäöüß\- \t/]+?:\s*(.+?)\s*\((\d+)\)", text)
    if m:
        return name or m.group(1).strip(), m.group(2).strip()
    return name, None

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
        match = next(c for c in catalog if c["text"] == "Stauanlagen")

        for kreis in KREISE:
            print(f"\n=== Kreis: {kreis} ===", flush=True)
            await ec.open_dataset(page, match["href"])
            frame = await ec.get_frame(page)
            
            # Cold-session form rendering wait
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
            print(f"  {n} Stauanlagen gefunden", flush=True)

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

                    ost = extract_num("Ostwert", detail_text)
                    nord = extract_num("Nordwert", detail_text)
                    
                    # Extract gewaesser from "Gewässerkennzahl / Gewässername / Auflage Gewässerkennzahl"
                    gewaesser = None
                    gewaesser_line = extract_text("Gewässerkennzahl / Gewässername / Auflage Gewässerkennzahl", detail_text)
                    if gewaesser_line:
                        parts = [x.strip() for x in gewaesser_line.split("/")]
                        if len(parts) >= 2:
                            gewaesser = parts[1]
                    if not gewaesser:
                        gewaesser = meta[2] if len(meta) > 2 else None

                    typ = extract_text("Bauwerkstyp", detail_text)

                    # Switch to Betreiber tab if present
                    betreiber = None
                    select_elem = frame.locator("select").first
                    if await select_elem.count() > 0:
                        opts = await select_elem.locator("option").all_text_contents()
                        if "Betreiber" in opts:
                            await ec.switch_detail_tab(frame, "Betreiber")
                            betreiber_text = await frame.locator("body").inner_text()
                            betreiber = extract_text("Name / Firma", betreiber_text) or extract_text("Betreiber", betreiber_text)
                            await ec.switch_detail_tab(frame, "Stammdaten")
                    if not betreiber:
                        betreiber = meta[3] if len(meta) > 3 else None

                    results[anlagen_nr] = {
                        "name": name or (meta[1] if len(meta) > 1 else None),
                        "kreis": kreis,
                        "utm_east": ost,
                        "utm_north": nord,
                        "betreiber": betreiber,
                        "gewaesser": gewaesser,
                        "typ": typ
                    }
                    print(f"  {anlagen_nr}: {name} Ost={ost} Nord={nord} Gewaesser={gewaesser} Betreiber={betreiber}", flush=True)

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
    print(f"\nFertig. {len([r for r in results.values() if 'error' not in r])} Stauanlagen gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
