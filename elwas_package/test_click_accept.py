import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Navigating...")
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        
        # Look for Nutzungsbedingungen akzeptieren button
        accept_selector = "text=Nutzungsbedingungen akzeptieren"
        print(f"Checking for selector: {accept_selector}")
        btn = page.locator(accept_selector)
        if await btn.count() > 0:
            print("Found accept button, clicking it...")
            await btn.first.click()
            print("Clicked. Waiting 2 seconds for dialog to dismiss...")
            await page.wait_for_timeout(2000)
        else:
            print("Accept button not found!")
            
        await page.screenshot(path="elwas_after_proper_accept.png")
        
        print("Clicking 'Daten'...")
        # Let's try to click a#adatal
        await page.click("a#adatal")
        print("Clicked 'Daten'. Waiting 2 seconds...")
        await page.wait_for_timeout(2000)
        
        await page.screenshot(path="elwas_after_click_daten.png")
        print("Screenshot saved to elwas_after_click_daten.png")
        
        # Print page url
        print(f"Current URL: {page.url}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
