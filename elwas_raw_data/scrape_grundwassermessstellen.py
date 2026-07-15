"""
Scrapt Grundwassermessstellen fuer die 7 Kreise des Rheinischen Reviers.
Koordinaten stehen direkt in der Ergebnistabelle (kein Detail-Klick noetig).
Nutzt die "500 pro Seite"-Einstellung + Pagination statt Excel-Export
(der Excel-Export-Button loest in dieser Umgebung nachweislich keinen
greifbaren Download aus, auch nach 100s Wartezeit - vermutlich verlangt
der PrimeFaces-Hidden-Iframe-Mechanismus ein echtes, nicht headless
Browserfenster).
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
OUT_PATH = os.path.join(BASE, "grundwassermessstellen.json")

KREISE = [
    "Städteregion Aachen",
    "Heinsberg",
    "Mönchengladbach",
    "Rhein-Kreis Neuss",
    "Düren",
    "Rhein-Erft-Kreis",
    "Euskirchen",
]

async def set_page_size_500(frame, page):
    sel = frame.locator("select:has(option:has-text('pro Seite'))")
    if await sel.count() > 0:
        await sel.first.select_option(label="500 pro Seite")
        await page.wait_for_timeout(2000)

async def read_all_rows(frame, page):
    """Reads all rows across all pages (after page-size is set to 500).
    Uses one JS evaluate() call per page to read the whole table at once -
    reading 500 rows via individual Playwright locator round-trips took
    ~78s per page (too slow for thousands of rows across 7 Kreise);
    bulk JS extraction does the same in well under a second.

    IMPORTANT: this dataset's "naechste Seite" button is NEVER actually
    disabled (confirmed: disabled=False / aria-disabled='false' even on
    the last page) - clicking past the end is a silent no-op, which means
    checking the button's disabled state loops forever. Instead we track
    progress via the "Seite X von Y" page-number input, which does update
    correctly, and stop once we've read page Y."""
    all_rows = []
    seen_pages = set()
    while True:
        page_input = frame.locator("input.resultSelectorHeaderPageInput").first
        current_page_val = await page_input.get_attribute("value")
        current_page = int(current_page_val) if current_page_val and current_page_val.isdigit() else 1

        if current_page in seen_pages:
            break  # safety net: didn't actually advance, stop instead of looping forever
        seen_pages.add(current_page)

        page_rows = await frame.evaluate("""() => {
            const rows = document.querySelectorAll('tbody.ui-datatable-data tr');
            return Array.from(rows).map(row =>
                Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
            );
        }""")
        all_rows.extend(page_rows)

        body_text = await frame.locator("body").inner_text()
        m = re.search(r"von\s+(\d+)", body_text)
        total_pages = int(m.group(1)) if m else 1
        print(f"    Seite {current_page} von {total_pages}, {len(page_rows)} Zeilen", flush=True)

        if current_page >= total_pages:
            break

        next_btn = frame.locator("button[title*='chste Seite']").first
        await next_btn.click()
        await page.wait_for_timeout(2500)
    return all_rows

async def main():
    results = {}
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            results = json.load(f)

    async with async_playwright() as p:
        browser, page = await ec.new_browser(p)
        catalog = ec.load_sitemap()
        match = next(c for c in catalog if "rundwassermessstellen" in c["text"])

        for kreis in KREISE:
            if kreis in results:
                print(f"Kreis {kreis} bereits erledigt, ueberspringe.", flush=True)
                continue
            print(f"\n=== Kreis: {kreis} ===", flush=True)
            try:
                await ec.open_dataset(page, match["href"])
                frame = await ec.get_frame(page)
                await ec.fill_regional_search(page, frame, kreis)
                await ec.submit_search(frame, wait_ms=3000)
                await set_page_size_500(frame, page)
                rows = await read_all_rows(frame, page)
                print(f"  {len(rows)} Messstellen gelesen", flush=True)

                stations = []
                skipped_inactive = 0
                for row in rows:
                    if len(row) < 6:
                        continue
                    status = row[-1] if row else ""
                    if "nicht mehr" in status or "inaktiv" in status:
                        skipped_inactive += 1
                        continue
                    stations.append({
                        "name": row[2] if len(row) > 2 else None,
                        "gemeinde": row[3] if len(row) > 3 else None,
                        "utm_east": row[4] if len(row) > 4 else None,
                        "utm_north": row[5] if len(row) > 5 else None,
                        "eigentuemer": row[6] if len(row) > 6 else None,
                        "messstellenart": row[12] if len(row) > 12 else None,
                        "status": status,
                    })
                print(f"  -> {len(stations)} aktiv, {skipped_inactive} inaktiv uebersprungen", flush=True)
                results[kreis] = stations
            except Exception as e:
                print(f"  Fehler bei Kreis {kreis}: {e}", flush=True)
                results[kreis] = {"error": str(e)}

            with open(OUT_PATH, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)

        await browser.close()

    total = sum(len(v) for v in results.values() if isinstance(v, list))
    print(f"\nFertig. {total} Grundwassermessstellen gesamt.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
