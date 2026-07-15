"""
Generalisiertes ELWAS-WEB Automatisierungs-Toolkit.

Beobachtung: ELWAS-WEB (JSF/PrimeFaces) verwendet fuer alle 34 Datensaetze
(siehe sitemap_links.json) dieselben UI-Bausteine:
  - Suchformular mit Selects/Textfeldern + wiederverwendetem
    "BR/Kreis/Gemeinde"-Regionalsuchfeld (id endet auf gemeindeName_idCommon2)
  - Ergebnis-Tabelle (tbody.ui-datatable-data) mit Pagination + oft einem
    "Excel Export"-Button -> fuer Massendaten IMMER zuerst pruefen, ob ein
    Export-Button existiert, statt Zeilen einzeln zu scrapen.
  - Detailseite ("Objektdetails") mit einem Dropdown, das zwischen
    Unteransichten wechselt (z.B. Stammdaten/Anfallstelle/... oder
    Stammdaten/Lage/Ausbau der Messstelle/...). Diese Unteransichten sind
    NICHT im Excel-Export enthalten -> dafuer ist gezieltes Scraping noetig.

Dieses Modul stellt die wiederverwendbaren Bausteine bereit, damit man für
ein neues Dataset nicht wieder bei null anfangen muss.
"""
import re
import json
import os
from playwright.async_api import async_playwright

BASE_URL = "https://www.elwasweb.nrw.de/"


async def new_browser(p, headless=True):
    browser = await p.chromium.launch(headless=headless)
    page = await browser.new_page(viewport={"width": 1600, "height": 1200})
    return browser, page


async def accept_terms(page):
    btn = page.locator("text=Nutzungsbedingungen akzeptieren")
    if await btn.count() > 0:
        await btn.first.click()
        await page.wait_for_timeout(800)


async def open_dataset(page, path_or_url):
    """path_or_url: either a full URL or one of the relative hrefs from
    sitemap_links.json (e.g. '/elwas-web/data/gw/zustand/gwm/grundwasserMst.xhtml?marea=1&mtheme=0&lindex=0')
    """
    url = path_or_url
    if url.startswith("/"):
        url = "https://www.elwasweb.nrw.de" + url
    # strip any jsessionid segment - a fresh one is assigned per session anyway
    url = re.sub(r";jsessionid=[^?]*", "", url)
    await page.goto(url, wait_until="networkidle", timeout=60000)
    await page.wait_for_timeout(1200)
    await accept_terms(page)


async def get_frame(page):
    """Some pages render the search UI inside an iframe named
    'mainDataIframe' (reached via the top nav), others render it directly
    at top level (reached via direct deep-link). Handle both.
    """
    fr = page.frame(name="mainDataIframe")
    return fr if fr else page


async def discover_search_fields(frame):
    """Auto-inspect a search form: returns list of selects (id + options)
    and text inputs (id) present on the current page. Useful the first time
    you open a dataset you haven't scripted yet.
    """
    result = {"selects": [], "inputs": []}
    selects = frame.locator("select")
    for i in range(await selects.count()):
        s = selects.nth(i)
        sid = await s.get_attribute("id")
        opts = await s.locator("option").all_text_contents()
        result["selects"].append({"id": sid, "options": opts})
    inputs = frame.locator("input[type='text']")
    for i in range(await inputs.count()):
        el = inputs.nth(i)
        iid = await el.get_attribute("id")
        result["inputs"].append({"id": iid})
    return result


async def fill_regional_search(frame, kreis_or_gemeinde_text):
    """The 'BR/Kreis/Gemeinde' field used across almost every ELWAS search
    form (Regionale-Suche). It's a free-text field - typing a Kreis name
    (e.g. 'Rhein-Erft-Kreis') is enough, no need to pick an autocomplete
    suggestion for the plain text version of this component.
    """
    field = frame.locator("input[id$='gemeindeName_idCommon2']")
    if await field.count() == 0:
        raise RuntimeError("Regional search field not found on this page")
    await field.first.fill("")
    await field.first.fill(kreis_or_gemeinde_text)
    await frame.page.wait_for_timeout(300)


async def submit_search(frame, wait_ms=3000):
    btn = frame.locator("input[value='Suchen']")
    await btn.first.click()
    await frame.page.wait_for_timeout(wait_ms)


async def has_excel_export(frame):
    return await frame.locator("input[value*='Excel Export'], button:has-text('Excel Export')").count() > 0


async def click_excel_export(frame, download_dir):
    """Triggers the built-in Excel export and saves the file. Prefer this
    over row-by-row scraping whenever it's available - it returns the FULL
    result set in one shot regardless of on-screen pagination."""
    page = frame.page
    btn = frame.locator("input[value*='Excel Export'], button:has-text('Excel Export')").first
    async with page.expect_download() as dl_info:
        await btn.click()
    download = await dl_info.value
    os.makedirs(download_dir, exist_ok=True)
    dest = os.path.join(download_dir, download.suggested_filename)
    await download.save_as(dest)
    return dest


async def get_result_row_count(frame):
    rows = frame.locator("tbody.ui-datatable-data tr")
    return await rows.count()


async def open_detail_row(frame, index=0, wait_ms=2200):
    """Click the Nth result row's detail link (works for both the
    'input.buttonLink' style used by Einleitende Betriebe and the plain
    '<a>' link style used by e.g. Grundwassermessstellen)."""
    links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a, input.buttonLink")
    await links.nth(index).click()
    await frame.page.wait_for_timeout(wait_ms)


async def get_detail_tab_options(frame):
    """The Objektdetails page has a dropdown to switch between sub-views
    (e.g. Stammdaten / Anfallstelle / Einleitungsstellen / ...). Returns
    the available tab labels."""
    dd = frame.locator("select").first
    if await dd.count() == 0:
        return []
    return await dd.locator("option").all_text_contents()


async def switch_detail_tab(frame, label, wait_ms=1800):
    dd = frame.locator("select").first
    await dd.select_option(label=label)
    await frame.page.wait_for_timeout(wait_ms)


def extract_field(label, text):
    """Pull 'Label    Value' out of a page's flattened innerText. Values
    are restricted to number-ish strings to avoid bleeding into the next
    label when the value is empty."""
    label_esc = re.escape(label)
    pattern = re.compile(rf"{label_esc}\s*([^\n\r]*)", re.IGNORECASE)
    m = pattern.search(text)
    if not m:
        return None
    val = m.group(1).strip()
    if not val or not re.match(r'^[\d\.,\s\-]+$', val):
        return None
    return val


async def get_detail_text(frame):
    return await frame.locator("body").inner_text()


def load_sitemap():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sitemap_links.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Example usage (run directly): open any catalog entry by name and dump its
# search-field structure, so you can script a new dataset in a few minutes.
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import asyncio
    import sys

    async def main():
        name_filter = sys.argv[1] if len(sys.argv) > 1 else "Kläranlagen"
        catalog = load_sitemap()
        match = next((c for c in catalog if name_filter.lower() in c["text"].lower()), None)
        if not match:
            print("Not found. Available:")
            for c in catalog:
                print(" -", c["text"])
            return
        print("Opening:", match["text"], match["href"])
        async with async_playwright() as p:
            browser, page = await new_browser(p)
            await open_dataset(page, match["href"])
            frame = await get_frame(page)
            fields = await discover_search_fields(frame)
            print(json.dumps(fields, indent=2, ensure_ascii=False))
            await browser.close()

    asyncio.run(main())
