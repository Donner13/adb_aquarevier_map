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
                
                # Print cells of first row
                cells = await frame.eval_on_selector_all(
                    "tbody.ui-datatable-data tr:first-child td",
                    """
                    elements => elements.map(el => ({
                        innerHTML: el.innerHTML,
                        className: el.className,
                        text: el.innerText || el.textContent
                    }))
                    """
                )
                print(f"Found {len(cells)} cells in the first row:")
                for i, cell in enumerate(cells):
                    safe_text = cell['text'].strip().encode('ascii', errors='replace').decode('ascii')
                    safe_html = cell['innerHTML'].strip().encode('ascii', errors='replace').decode('ascii')
                    print(f"Cell {i}: Class='{cell['className']}', Text='{safe_text}'")
                    print(f"  HTML: {safe_html}")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
