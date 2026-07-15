import asyncio
import re
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        print("Navigating...")
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        
        # Accept terms
        accept_btn = page.locator("text=Nutzungsbedingungen akzeptieren")
        if await accept_btn.count() > 0:
            await accept_btn.first.click()
            await page.wait_for_timeout(1000)
            
        print("Clicking 'Daten'...")
        await page.click("a#adatal")
        await page.wait_for_timeout(2000)
        
        frame = page.frame(name="mainDataIframe")
        if frame:
            await frame.click("text=Einleitende Betriebe")
            await page.wait_for_timeout(4000)
            
            # Type Betriebs-Nr
            bet_nr_input = frame.locator("id=cContainer:cCommonBodyContainer:j_idt570:searchT80Betrieb:searchPanel2Col:betriebsnummerRow:betriebsnummer")
            print("Typing Betriebs-Nr '358458'...")
            await bet_nr_input.fill("358458")
            await page.wait_for_timeout(1000)
            
            # Click 'Suchen'
            print("Clicking 'Suchen'...")
            search_btn = frame.locator("input[value='Suchen']")
            if await search_btn.count() > 0:
                await search_btn.first.click()
                print("Waiting for search results...")
                await page.wait_for_timeout(4000)
                
                # Click the first buttonLink input
                button_links = frame.locator("input.buttonLink")
                print(f"Found {await button_links.count()} buttonLinks in results.")
                if await button_links.count() > 0:
                    print("Clicking buttonLink...")
                    await button_links.first.click()
                    await page.wait_for_timeout(3000)
                    
                    # Read Stammdaten coordinates
                    body_text = await frame.locator("body").inner_text()
                    ost = re.search(r'Ostwert in UTM \(Zone 32N\)\s+(\d+)', body_text)
                    nord = re.search(r'Nordwert in UTM \(Zone 32N\)\s+(\d+)', body_text)
                    ost_val = ost.group(1) if ost else "None"
                    nord_val = nord.group(1) if nord else "None"
                    print(f"Coordinates: Ost={ost_val}, Nord={nord_val}")
                    
                    # Select 'Anfallstelle'
                    select_elem = frame.locator("select:has(option:has-text('Anfallstelle'))")
                    if await select_elem.count() > 0:
                        print("Selecting 'Anfallstelle' from dropdown...")
                        await select_elem.first.select_option(label="Anfallstelle")
                        await page.wait_for_timeout(3000)
                        
                        # Loop through all Anfallstelle links
                        nr_links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
                        links_count = await nr_links.count()
                        print(f"Found {links_count} Anfallstellen.")
                        for idx in range(links_count):
                            print(f"Clicking Anfallstelle {idx+1}...")
                            await nr_links.nth(idx).click()
                            await page.wait_for_timeout(3000)
                            
                            # Parse details
                            detail_text = await frame.locator("body").inner_text()
                            m_d = re.search(r'maximaler Abwasservolumenstrom \[m\?/d\]\s*([\d,\.]+)?', detail_text)
                            m_h = re.search(r'maximaler Abwasservolumenstrom \[m\?/h\]\s*([\d,\.]+)?', detail_text)
                            m_a = re.search(r'Gesamtabwasseranfall im Jahr \[m\?/a\]\s*([\d,\.]+)?', detail_text)
                            
                            val_d = m_d.group(1) if (m_d and m_d.group(1)) else "None"
                            val_h = m_h.group(1) if (m_h and m_h.group(1)) else "None"
                            val_a = m_a.group(1) if (m_a and m_a.group(1)) else "None"
                            
                            print(f"  Anfallstelle {idx+1} values: max_d={val_d}, max_h={val_h}, max_a={val_a}")
                            
                            # Click Objektdetails to go back
                            obj_tab = frame.locator("text=Objektdetails")
                            await obj_tab.first.click()
                            await page.wait_for_timeout(2000)
                            
                            # Re-select 'Anfallstelle' because we went back to Objektdetails which resets to Stammdaten tab
                            await select_elem.first.select_option(label="Anfallstelle")
                            await page.wait_for_timeout(2000)
                            # Re-locate the links because page reloaded
                            nr_links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
                            
                    # Click 'Suche' to go back to search form
                    print("Going back to search form...")
                    suche_tab = frame.locator("text=Suche")
                    await suche_tab.first.click()
                    await page.wait_for_timeout(2000)
                    print("Back on search form!")
                else:
                    print("No results found!")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
