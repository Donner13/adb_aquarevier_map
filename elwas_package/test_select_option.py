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
            
            # Select regional search input
            reg_input = frame.locator("id=cContainer:cCommonBodyContainer:j_idt570:searchT80Betrieb:searchPanel2Col:gemeindeName_id_CommonRow:gemeindeName_idCommon2")
            print("Typing 'Düren'...")
            await reg_input.type("Düren")
            await page.wait_for_timeout(2500)
            
            # Click 'Übernehmen'
            uebernehmen_btn = frame.locator("text=Übernehmen")
            if await uebernehmen_btn.count() > 0:
                await uebernehmen_btn.first.click()
                await page.wait_for_timeout(2000)
            
            # Click 'Suchen'
            print("Clicking 'Suchen'...")
            search_btn = frame.locator("input[value='Suchen']")
            if await search_btn.count() > 0:
                await search_btn.first.click()
                print("Waiting for search results...")
                await page.wait_for_timeout(6000)
                
                # Click the first buttonLink input
                button_links = frame.locator("input.buttonLink")
                if await button_links.count() > 0:
                    print("Clicking first buttonLink...")
                    await button_links.first.click()
                    await page.wait_for_timeout(4000)
                    
                    # Read Stammdaten page text
                    body_text = await frame.locator("body").inner_text()
                    
                    # Parse UTM coordinates
                    ost = re.search(r'Ostwert in UTM \(Zone 32N\)\s+(\d+)', body_text)
                    nord = re.search(r'Nordwert in UTM \(Zone 32N\)\s+(\d+)', body_text)
                    ost_val = ost.group(1) if ost else "None"
                    nord_val = nord.group(1) if nord else "None"
                    print(f"Parsed Coordinates: Ost={ost_val}, Nord={nord_val}")
                    
                    # Select 'Anfallstelle' from the dropdown
                    select_elem = frame.locator("select:has(option:has-text('Anfallstelle'))")
                    if await select_elem.count() > 0:
                        print("Found dropdown, selecting 'Anfallstelle'...")
                        await select_elem.first.select_option(label="Anfallstelle")
                        print("Waiting for tab load...")
                        await page.wait_for_timeout(4000)
                        
                        await page.screenshot(path="elwas_anfallstelle_dropdown.png")
                        print("Saved elwas_anfallstelle_dropdown.png")
                        
                        # Print inner text of the page now to see the wastewater quantity format
                        anfall_text = await frame.locator("body").inner_text()
                        anfall_text_safe = anfall_text.encode('ascii', errors='replace').decode('ascii')
                        print("\n--- Anfallstelle Page Body Text ---")
                        print(anfall_text_safe[:2000])
                    else:
                        print("Dropdown not found!")
                else:
                    print("No buttonLinks found!")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
