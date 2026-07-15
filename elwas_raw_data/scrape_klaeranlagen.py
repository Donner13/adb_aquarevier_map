"""
Scrapt kommunale Klaeranlagen fuer die 7 Kreise des Rheinischen Reviers.
Die Ergebnistabelle hat keine Koordinaten, daher pro Anlage kurz die
Detailseite oeffnen und auf den Tab "Lage" wechseln (dort stehen
Ostwert/Nordwert UTM + Gewaessername - NICHT unter "Stammdaten"!).
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

def extract_num(label, text):
    m = re.search(rf"{re.escape(label)}\t([^\n\r]*)", text)
    if m:
        val = m.group(1).strip()
        if re.match(r'^[\d\.,\s\-]+$', val or ""):
            return val
    return None

def extract_text(label, text):
    m = re.search(rf"{re.escape(label)}\t([^\n\r]*)", text)
    if m:
        val = m.group(1).strip()
        return val if val else None
    return None

def extract_name_nr(text):
    m = re.search(r"Kläranlage:\s*(.+?)\s*\((\d+)\)", text)
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
                    name, anlagen_nr = extract_name_nr(header_text)
                    if not anlagen_nr:
                        anlagen_nr = f"unknown_{kreis}_{idx}"
                    if anlagen_nr in results and "error" not in results[anlagen_nr]:
                        await frame.click("text=Ergebnisse")
                        await page.wait_for_timeout(1200)
                        links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                        continue

                    select_elem = frame.locator("select:has(option:has-text('Lage'))")
                    ost = nord = gemeinde = gewaesser = None
                    if await select_elem.count() > 0:
                        await select_elem.first.select_option(label="Lage")
                        await page.wait_for_timeout(1500)
                        lage_text = await frame.locator("body").inner_text()
                        ost = extract_num("Ostwert in UTM (Zone 32N)", lage_text)
                        nord = extract_num("Nordwert in UTM (Zone 32N)", lage_text)
                        gemeinde_line = extract_text("Gemeindekennzahl / Gemeinde", lage_text)
                        if gemeinde_line and "/" in gemeinde_line:
                            gemeinde = gemeinde_line.split("/")[-1].strip()
                        gewaesser_line = extract_text("Gewässerkennzahl / Gewässername / Auflage", lage_text)
                        if gewaesser_line:
                            parts = [x.strip() for x in gewaesser_line.split("/")]
                            if len(parts) >= 2:
                                gewaesser = parts[1]

                    results[anlagen_nr] = {
                        "name": name or (meta[2] if len(meta) > 2 else None),
                        "gemeinde": gemeinde,
                        "kreis": kreis,
                        "utm_east": ost,
                        "utm_north": nord,
                        "betreiber": meta[4] if len(meta) > 4 else None,
                        "gewaesser": gewaesser or (meta[5] if len(meta) > 5 else None),
                        "ausbaugroesse_ew": meta[3] if len(meta) > 3 else None,
                    }
                    print(f"  {anlagen_nr}: {name} Ost={ost} Nord={nord} Gewaesser={gewaesser}", flush=True)

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
    print(f"\nFertig. {len(results)} Klaeranlagen gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
