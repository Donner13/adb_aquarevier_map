import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Navigating...")
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        
        # Accept terms of use
        accept_btn = page.locator("text=Akzeptieren")
        if await accept_btn.count() > 0:
            await accept_btn.first.click()
            await page.wait_for_timeout(1000)
            
        print("Clicking 'Daten' tab...")
        await page.click("a#adatal")
        await page.wait_for_timeout(2000)
        
        await page.screenshot(path="elwas_after_click_daten.png")
        print("Screenshot saved to elwas_after_click_daten.png")
        
        # Let's inspect the page content or list visible links/elements to see what opened
        links = await page.locator("a:visible").all()
        print(f"Found {len(links)} visible links after clicking Daten:")
        for i, link in enumerate(links):
            text = (await link.text_content() or "").strip()
            link_id = await link.get_attribute("id")
            # Replace non-ascii chars to avoid console print errors
            safe_text = text.encode('ascii', errors='replace').decode('ascii')
            if safe_text:
                print(f"Link {i}: id='{link_id}', text='{safe_text}'")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
