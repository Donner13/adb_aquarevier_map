import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

sys.path.insert(0, r"C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\elwas_toolkit")
import elwas_client as ec

BASE = os.path.dirname(os.path.abspath(__file__))
SITEMAP_PATH = os.path.join(BASE, "..", "elwas_toolkit", "sitemap_links.json")

async def check_station(page, station_name, station_gemeinde, station_kreis):
    print(f"Prüfe Messstelle: {station_name}, {station_gemeinde}, {station_kreis}")

    current_frame = await ec.get_frame(page)
    # 1. Suche nach der Messstelle in der Liste
    await ec.fill_regional_search(current_frame, page, station_kreis, station_gemeinde) # page als zweites Argument
    await ec.submit_search(current_frame)
    await page.wait_for_selector("tbody.ui-datatable-data tr") # Warte auf Ergebnisse

    # Finde die Zeile der Messstelle
    rows = await current_frame.query_selector_all("tbody.ui-datatable-data tr") # query_selector_all auch auf frame anwenden
    found_row_index = -1
    for i, row in enumerate(rows):
        row_text = await row.inner_text()
        if station_name in row_text and station_gemeinde in row_text:
            found_row_index = i
            break

    if found_row_index == -1:
        print(f"  Messstelle '{station_name}' nicht in der Ergebnisliste gefunden.")
        return

    # 2. Detailseite öffnen
    await ec.open_detail_row(current_frame, found_row_index) # open_detail_row auch auf frame anwenden
    await page.wait_for_selector("div.ui-tabs-nav") # Warte auf Tabs

    # 3. Zum Tab "Wasserstandsganglinie" wechseln
    tab_options = await ec.get_detail_tab_options(current_frame)
    print(f"  Verfügbare Tabs: {tab_options}")

    if "Wasserstandsganglinie" in tab_options:
        await ec.switch_detail_tab(current_frame, "Wasserstandsganglinie")
        await page.wait_for_timeout(2000) # Warte, bis der Tab geladen ist

        # 4. Inhalt des Tabs inspizieren
        tab_content = await current_frame.locator("div[id$='tabWasserstandsganglinie']").inner_html()
        # print(f"  Inhalt des Tabs 'Wasserstandsganglinie':\n{tab_content[:500]}...") # Nur die ersten 500 Zeichen

        # Prüfen, ob eine Tabelle mit Daten vorhanden ist
        table_locator = current_frame.locator("div[id$='tabWasserstandsganglinie'] table")
        if await table_locator.count() > 0:
            print("  Tabelle mit Wasserstandsdaten gefunden!")
            # Versuche, den jüngsten Wert zu extrahieren
            try:
                # Die erste Zeile der Tabelle nach dem Header sollte die jüngsten Daten enthalten
                # Annahme: Tabelle hat Header, dann Datenzeilen
                first_data_row = table_locator.locator("tbody tr").first
                date_cell = first_data_row.locator("td").nth(0) # Annahme: Datum in erster Spalte
                value_cell = first_data_row.locator("td").nth(1) # Annahme: Wert in zweiter Spalte
                date = await date_cell.inner_text()
                value = await value_cell.inner_text()
                print(f"    Jüngster Wert: Datum='{date}', Wert='{value}'")
                print("    Einheit muss noch aus dem Kontext der Seite abgeleitet werden (m ü. NHN oder m unter Flur).")
            except Exception as e:
                print(f"    Fehler beim Extrahieren des jüngsten Werts aus der Tabelle: {e}")
        else:
            print("  Keine Tabelle mit Wasserstandsdaten gefunden. Möglicherweise nur ein Diagramm.")
            # Hier könnte man nach SVG/Canvas-Elementen oder versteckten Daten suchen
            # Für diesen Feasibility-Check reicht die Info, ob eine Tabelle da ist.
    else:
        print("  Tab 'Wasserstandsganglinie' nicht gefunden.")

    # Zurück zur Übersichtsseite, um die nächste Messstelle zu prüfen
    await page.go_back(wait_until="networkidle")
    await page.wait_for_timeout(1000)


async def main():
    with open(SITEMAP_PATH, 'r', encoding='utf-8') as f:
        sitemap_links = json.load(f)
    
    gwm_link = next((item for item in sitemap_links if item["text"] == "Grundwassermessstellen"), None)
    if not gwm_link:
        print("Fehler: Grundwassermessstellen-Link nicht in sitemap_links.json gefunden.")
        return

    async with async_playwright() as p:
        browser, page = await ec.new_browser(p, headless=False) # headless=False zum Debuggen
        try:
            await ec.open_dataset(page, gwm_link["href"])
            
            # Stichproben-Messstellen
            stations_to_check = [
                {"name": "HERZOGENRATH Nr.10", "gemeinde": "Herzogenrath", "kreis": "Städteregion Aachen"},
                {"name": "VAALSERQUART NR 13", "gemeinde": "Aachen", "kreis": "Städteregion Aachen"},
                {"name": "Röhe Nr. 16", "gemeinde": "Eschweiler", "kreis": "Städteregion Aachen"},
            ]

            for station in stations_to_check:
                await check_station(page, station["name"], station["gemeinde"], station["kreis"])
                await page.wait_for_timeout(1000) # Kurze Pause zwischen den Checks

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())