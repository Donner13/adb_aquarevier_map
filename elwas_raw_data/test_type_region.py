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
            print("Typing 'Düren' in the regional search input...")
            await reg_input.type("Düren")
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="elwas_after_typing_duren.png")
            print("Saved elwas_after_typing_duren.png")
            
            # Press ArrowDown and Enter to see if it selects from autocomplete
            print("Pressing Down and Enter...")
            await reg_input.press("ArrowDown")
            await page.wait_for_timeout(500)
            await reg_input.press("Enter")
            await page.wait_for_timeout(2000)
            
            await page.screenshot(path="elwas_after_enter_duren.png")
            print("Saved elwas_after_enter_duren.png")
            
            # Let's inspect the value of the input
            val = await reg_input.evaluate("el => el.value")
            print(f"Input value: '{val}'")
            
            # Check if there is an autocomplete dropdown visible
            # Autocomplete panels in PrimeFaces usually have class 'ui-autocomplete-panel'
            panels = await frame.eval_on_selector_all(
                "div.ui-autocomplete-panel",
                "panels => panels.map(p => ({ isVisible: p.offsetWidth > 0, text: p.innerText }))"
            )
            for i, p in enumerate(panels):
                print(f"Panel {i}: Visible={p['isVisible']}, Text='{p['text'].strip()}'")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
