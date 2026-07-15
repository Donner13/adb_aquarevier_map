import asyncio
import os
import re
from playwright.async_api import async_playwright

DISTRICTS = [
    "Städteregion Aachen",
    "Heinsberg",
    "Mönchengladbach",
    "Rhein-Kreis Neuss",
    "Düren",
    "Rhein-Erft-Kreis",
    "Euskirchen"
]

def clean_name(name):
    return re.sub(r'[^a-zA-Z0-9]', '_', name)

async def scrape_district(page, district):
    print(f"\n--- Starting scrape for district: {district} ---")
    frame = page.frame(name="mainDataIframe")
    
    # Click 'Daten' menu tab if we are not on the right page, or reload to reset search
    print("Resetting search by clicking 'Daten' tab...")
    await page.click("a#adatal")
    await page.wait_for_timeout(2000)
    
    if not frame:
        print("Error: mainDataIframe not found!")
        return False
        
    await frame.click("text=Einleitende Betriebe")
    await page.wait_for_timeout(4000)
    
    # Type district name in BR/Kreis/Gemeinde field
    reg_input = frame.locator("id=cContainer:cCommonBodyContainer:j_idt570:searchT80Betrieb:searchPanel2Col:gemeindeName_id_CommonRow:gemeindeName_idCommon2")
    await reg_input.click()
    await reg_input.fill("") # Clear input
    print(f"Typing '{district}'...")
    await reg_input.type(district)
    await page.wait_for_timeout(3000)
    
    # Click 'Übernehmen' link
    # We find the row that matches 'Kreis/Stadt' or the name
    # First let's click the first 'Übernehmen' link that appears in the autocomplete results
    uebernehmen_btn = frame.locator("text=Übernehmen")
    if await uebernehmen_btn.count() > 0:
        print("Found 'Übernehmen' link, selecting...")
        await uebernehmen_btn.first.click()
        await page.wait_for_timeout(2000)
    else:
        # Fallback with unicode-safe text matching
        uebernehmen_btn_alt = frame.locator("text=bernehmen")
        if await uebernehmen_btn_alt.count() > 0:
            print("Found 'bernehmen' link (fallback), selecting...")
            await uebernehmen_btn_alt.first.click()
            await page.wait_for_timeout(2000)
        else:
            print(f"Error: could not select region '{district}' (no Übernehmen link found)!")
            return False
            
    # Click 'Suchen' button
    print("Clicking 'Suchen'...")
    search_btn = frame.locator("input[value='Suchen']")
    if await search_btn.count() > 0:
        await search_btn.first.click()
        await page.wait_for_timeout(6000) # Wait for results table to load
    else:
        print("Error: Search button not found!")
        return False
        
    # Click the select-all checkbox first
    header_checkbox = frame.locator('input[id$="selectAllId0"]')
    if await header_checkbox.count() > 0:
        print("Clicking select-all checkbox...")
        await header_checkbox.first.click()
        await page.wait_for_timeout(2000)
    else:
        print("Warning: Select-all checkbox not found!")
        
    # Attempt Excel download
    excel_btn = frame.locator("button:has-text('Excel Export')")
    if await excel_btn.count() > 0:
        print(f"Export button found. Downloading excel for {district}...")
        try:
            async with page.expect_download(timeout=45000) as download_info:
                await excel_btn.first.click()
            download = await download_info.value
            
            district_safe = clean_name(district)
            filename = f"elwas_export_{district_safe}.xlsx"
            download_path = os.path.join(os.getcwd(), "scratch", filename)
            await download.save_as(download_path)
            print(f"Saved to: {download_path} ({os.path.getsize(download_path)} bytes)")
            return True
        except Exception as e:
            print(f"Download failed for {district}: {e}")
            return False
    else:
        print(f"No entries or Excel Export button found for {district}!")
        # Let's take a screenshot for debugging
        screenshot_path = f"error_{clean_name(district)}.png"
        await page.screenshot(path=screenshot_path)
        print(f"Saved error screenshot to {screenshot_path}")
        return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Set viewport size to ensure all elements are rendered properly
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        print("Navigating to ELWAS-WEB...")
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        
        # Accept terms
        accept_btn = page.locator("text=Nutzungsbedingungen akzeptieren")
        if await accept_btn.count() > 0:
            await accept_btn.first.click()
            await page.wait_for_timeout(1500)
            
        # Create output dir
        os.makedirs("scratch", exist_ok=True)
        
        success_count = 0
        for district in DISTRICTS:
            success = await scrape_district(page, district)
            if success:
                success_count += 1
            # Rate limit politeness
            await page.wait_for_timeout(2000)
            
        print(f"\nDone! Scraped {success_count} / {len(DISTRICTS)} districts successfully.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
