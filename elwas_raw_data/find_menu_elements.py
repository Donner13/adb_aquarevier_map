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
        
        # Find elements containing "Einleitende" or "Betriebe"
        # We can run querySelectorAll
        print("Searching for elements containing 'Einleitende' or 'Betriebe'...")
        elements = await page.eval_on_selector_all(
            "//*[contains(text(), 'Einleitende') or contains(text(), 'Betriebe')]",
            """
            elements => elements.map(el => ({
                tagName: el.tagName,
                id: el.id,
                className: el.className,
                text: el.innerText,
                isVisible: el.offsetWidth > 0 && el.offsetHeight > 0,
                onclick: el.getAttribute('onclick'),
                href: el.getAttribute('href')
            }))
            """
        )
        
        for i, el in enumerate(elements):
            text_safe = el['text'].strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Element {i}: Tag={el['tagName']}, ID='{el['id']}', Class='{el['className']}', Visible={el['isVisible']}, Text='{text_safe[:60]}', onclick='{el['onclick']}', href='{el['href']}'")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
