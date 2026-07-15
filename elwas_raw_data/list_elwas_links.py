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
        
        # Find all <a> elements
        links = await page.locator("a").all()
        print(f"Found {len(links)} links on the page.")
        for i, link in enumerate(links):
            text = (await link.text_content() or "").strip()
            link_id = await link.get_attribute("id")
            onclick = await link.get_attribute("onclick")
            href = await link.get_attribute("href")
            # Replace non-ascii to avoid print error
            safe_text = text.encode('ascii', errors='replace').decode('ascii')
            # Only print links with text or ID
            if safe_text or link_id or onclick:
                print(f"Link {i}: id='{link_id}', text='{safe_text}', href='{href}', onclick='{onclick}'")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
