import asyncio
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
                    await button_links.first.click()
                    await page.wait_for_timeout(4000)
                    
                    # Select 'Anfallstelle' from the dropdown
                    select_elem = frame.locator("select:has(option:has-text('Anfallstelle'))")
                    if await select_elem.count() > 0:
                        await select_elem.first.select_option(label="Anfallstelle")
                        await page.wait_for_timeout(4000)
                        
                        # Click the first link in the table body (under 'Nr' column)
                        nr_links = frame.locator("tbody.ui-datatable-data tr td input[type='submit'], tbody.ui-datatable-data tr td a")
                        print(f"Found {await nr_links.count()} links in Anfallstelle table body.")
                        if await nr_links.count() > 0:
                            print("Clicking first cell link...")
                            await nr_links.first.click()
                            await page.wait_for_timeout(4000)
                            
                            await page.screenshot(path="elwas_anfallstelle_details.png")
                            print("Saved elwas_anfallstelle_details.png")
                            
                            # Print text of details page
                            detail_text = await frame.locator("body").inner_text()
                            detail_safe = detail_text.encode('ascii', errors='replace').decode('ascii')
                            print("\n--- Anfallstelle Details Text ---")
                            print(detail_safe[:1500])
                        else:
                            print("No links found in table cells!")
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
