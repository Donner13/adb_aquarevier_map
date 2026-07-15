import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Listen to console messages
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        
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
                
                # Check for Excel Export button
                excel_btn = frame.locator("button:has-text('Excel Export')")
                if await excel_btn.count() > 0:
                    print("Found 'Excel Export' button. Taking screenshot before click...")
                    await page.screenshot(path="elwas_before_excel_click.png")
                    
                    print("Attempting to click Excel Export and download...")
                    try:
                        async with page.expect_download(timeout=30000) as download_info:
                            await excel_btn.first.click()
                        download = await download_info.value
                        download_path = os.path.join(os.getcwd(), "elwas_duren.xlsx")
                        await download.save_as(download_path)
                        print(f"Downloaded successfully! Size: {os.path.getsize(download_path)} bytes")
                    except Exception as e:
                        print(f"Download failed: {e}")
                        await page.screenshot(path="elwas_after_excel_failed.png")
                        print("Saved elwas_after_excel_failed.png")
                else:
                    print("Excel button not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
