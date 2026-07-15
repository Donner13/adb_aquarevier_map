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
                
                # Click the first Betriebs-Nr link (it has link text like '358458')
                # Let's find links inside the table body
                links = frame.locator("tbody tr td a")
                print(f"Found {await links.count()} links in results table body.")
                if await links.count() > 0:
                    first_link_text = await links.first.text_content()
                    print(f"Clicking first link: '{first_link_text}'...")
                    await links.first.click()
                    await page.wait_for_timeout(4000)
                    
                    await page.screenshot(path="elwas_details_page.png")
                    print("Saved elwas_details_page.png")
                    
                    print(f"Details Page URL: {page.url}")
                    print(f"Frame URL: {frame.url}")
                    
                    # Dump all visible text on the page to see details structure
                    body_text = await frame.locator("body").inner_text()
                    # Safe print
                    body_text_safe = body_text.encode('ascii', errors='replace').decode('ascii')
                    print("\n--- Details Page Body Text ---")
                    print(body_text_safe[:1500])
                    
                    # Print all tabs/links in details page to see how we navigate to 'Anfallstellen'
                    tabs = await frame.eval_on_selector_all(
                        "a, button",
                        "elements => elements.map(el => el.innerText || el.value).filter(t => t && t.trim() !== '')"
                    )
                    tabs_safe = [t.strip().encode('ascii', errors='replace').decode('ascii') for t in tabs]
                    print(f"\nFound tabs/buttons: {tabs_safe}")
                else:
                    print("No links found in table body!")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
