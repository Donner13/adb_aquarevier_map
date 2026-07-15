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
        await page.wait_for_timeout(1500)
        
        print("Clicking 'Einleitende Betriebe'...")
        # Search for link with text "Einleitende Betriebe"
        # It seems to be a link. Let's find it.
        einleitende_btn = page.locator("text=Einleitende Betriebe")
        if await einleitende_btn.count() > 0:
            print("Found 'Einleitende Betriebe' link, clicking it...")
            await einleitende_btn.first.click()
            print("Waiting for page to load...")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(3000)
        else:
            print("'Einleitende Betriebe' link not found!")
            
        await page.screenshot(path="elwas_einleitende_page.png")
        print("Screenshot saved to elwas_einleitende_page.png")
        print(f"Final URL: {page.url}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
