import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        
        # Accept terms
        accept_btn = page.locator("text=Nutzungsbedingungen akzeptieren")
        if await accept_btn.count() > 0:
            await accept_btn.first.click()
            await page.wait_for_timeout(1000)
            
        await page.click("a#adatal")
        await page.wait_for_timeout(2000)
        
        frame = page.frame(name="mainDataIframe")
        if frame:
            await frame.click("text=Einleitende Betriebe")
            await page.wait_for_timeout(4000)
            
            # Print table/form labels and their corresponding input IDs
            elements = await frame.eval_on_selector_all(
                "td, label, input",
                """
                elements => elements.map(el => ({
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: el.innerText || el.textContent,
                    type: el.type,
                    value: el.value
                })).filter(el => (el.text && el.text.trim() !== '') || el.tagName === 'INPUT')
                """
            )
            for el in elements:
                t = el['text'].strip().encode('ascii', errors='replace').decode('ascii') if el['text'] else ""
                v = el['value'].strip().encode('ascii', errors='replace').decode('ascii') if el['value'] else ""
                if el['tagName'] == 'INPUT':
                    print(f"INPUT: ID='{el['id']}', Type='{el['type']}', Value='{v}'")
                else:
                    if len(t) < 100:
                        print(f"LABEL/TEXT ({el['tagName']}): ID='{el['id']}', Text='{t}'")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
