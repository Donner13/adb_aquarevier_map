"""
Scrapt kommunale Klaeranlagen fuer die 7 Kreise des Rheinischen Reviers.
Die Ergebnistabelle hat keine Koordinaten, daher pro Anlage kurz die
Detailseite (Stammdaten) oeffnen.
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

            rows = frame.locator("tbody.ui-datatable-data tr")
            n = await rows.count()
            print(f"  {n} Klaeranlagen gefunden", flush=True)

            # collect Anlagen-Nr + name per row first (row structure will get replaced after each detail visit)
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
                anlagen_nr = meta[0] if meta else None
                if anlagen_nr and anlagen_nr in results:
                    continue
                try:
                    await links.nth(idx).click()
                    await page.wait_for_timeout(2000)
                    detail_text = await frame.locator("body").inner_text()

                    ost = extract_num("Ostwert in UTM (Zone 32N)", detail_text)
                    nord = extract_num("Nordwert in UTM (Zone 32N)", detail_text)
                    name = extract_text("Name der KA", detail_text) or (meta[1] if len(meta) > 1 else None)
                    gemeinde = extract_text("Gemeinde", detail_text)

                    results[anlagen_nr] = {
                        "name": name,
                        "gemeinde": gemeinde,
                        "kreis": kreis,
                        "utm_east": ost,
                        "utm_north": nord,
                        "betreiber": meta[3] if len(meta) > 3 else None,
                        "gewaesser": meta[4] if len(meta) > 4 else None,
                        "ausbaugroesse_ew": meta[2] if len(meta) > 2 else None,
                    }
                    print(f"  {anlagen_nr}: {name} Ost={ost} Nord={nord}", flush=True)

                    await frame.click("text=Ergebnisse")
                    await page.wait_for_timeout(1500)
                    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
                except Exception as e:
                    print(f"  Fehler bei {anlagen_nr}: {e}", flush=True)
                    results[anlagen_nr or f"unknown_{idx}"] = {"error": str(e), "kreis": kreis}

                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)

        await browser.close()
    print(f"\nFertig. {len(results)} Klaeranlagen gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
