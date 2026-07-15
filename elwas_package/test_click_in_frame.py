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
        
        # Access frame
        print("Accessing 'mainDataIframe'...")
        frame = page.frame(name="mainDataIframe")
        if frame:
            print("Found frame. Clicking 'Einleitende Betriebe' inside frame...")
            await frame.click("text=Einleitende Betriebe")
            print("Clicked. Waiting 5 seconds for page load...")
            await page.wait_for_timeout(5000)
            
            # Let's take screenshots of both the page and frame
            await page.screenshot(path="elwas_page_after_frame_click.png")
            print("Saved elwas_page_after_frame_click.png")
            
            # Let's check frame URL
            print(f"Frame URL: {frame.url}")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
