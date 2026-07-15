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
                print(f"Found {await button_links.count()} buttonLinks in results table.")
                if await button_links.count() > 0:
                    print("Clicking first buttonLink...")
                    await button_links.first.click()
                    await page.wait_for_timeout(5000)
                    
                    await page.screenshot(path="elwas_details_loaded.png")
                    print("Saved elwas_details_loaded.png")
                    
                    # Print body innerText of mainDataIframe
                    body_text = await frame.locator("body").inner_text()
                    body_safe = body_text.encode('ascii', errors='replace').decode('ascii')
                    print("\n--- Body Text of Details Page ---")
                    print(body_safe[:2000])
                    
                    # Print all buttons/links on the details page
                    elements = await frame.eval_on_selector_all(
                        "input, button, a",
                        """
                        elements => elements.map(el => ({
                            tagName: el.tagName,
                            id: el.id,
                            value: el.value,
                            text: el.innerText || el.textContent
                        })).filter(el => (el.text && el.text.trim() !== '') || el.value)
                        """
                    )
                    print("\nFound inputs/buttons/links in details page:")
                    for el in elements:
                        txt = el['text'].strip().encode('ascii', errors='replace').decode('ascii')
                        val = el['value'].strip().encode('ascii', errors='replace').decode('ascii')
                        print(f"  Tag={el['tagName']}, ID='{el['id']}', Text='{txt}', Value='{val}'")
                else:
                    print("No buttonLinks found!")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
