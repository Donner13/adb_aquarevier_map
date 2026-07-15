import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
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
            
            # Click the 'Übernehmen' link
            uebernehmen_btn = frame.locator("text=Übernehmen")
            if await uebernehmen_btn.count() > 0:
                await uebernehmen_btn.first.click()
                await page.wait_for_timeout(2000)
            
            # Click 'Suchen' button
            print("Clicking 'Suchen' button...")
            search_btn = frame.locator("input[value='Suchen']")
            if await search_btn.count() > 0:
                await search_btn.first.click()
                print("Waiting for search results...")
                await page.wait_for_timeout(5000)
                
                # List all inputs, buttons, and a tags to find Excel Export
                print("Scanning for buttons...")
                elements = await frame.eval_on_selector_all(
                    "input, button, a",
                    """
                    elements => elements.map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        type: el.type,
                        value: el.value,
                        text: el.innerText || el.textContent
                    }))
                    """
                )
                for i, el in enumerate(elements):
                    text_safe = (el['text'] or '').strip().encode('ascii', errors='replace').decode('ascii')
                    val_safe = (el['value'] or '').strip().encode('ascii', errors='replace').decode('ascii')
                    if "Excel" in text_safe or "Excel" in val_safe or "Export" in text_safe or "Export" in val_safe:
                        print(f"Element {i}: Tag={el['tagName']}, ID='{el['id']}', Class='{el['className']}', Type='{el['type']}', Value='{val_safe}', Text='{text_safe}'")
            else:
                print("Search button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
