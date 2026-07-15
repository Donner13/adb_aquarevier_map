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
            
            # Click the first buttonLink input
            button_links = frame.locator("input.buttonLink")
            if await button_links.count() > 0:
                await button_links.first.click()
                await page.wait_for_timeout(3000)
                
                # Let's find elements that contain text "Suche" or "Ergebnisse"
                matches = await frame.eval_on_selector_all(
                    "*:has-text('Suche')",
                    """
                    elements => elements.filter(el => {
                        let text = el.innerText || el.textContent;
                        return text && text.trim() === 'Suche' && (el.tagName === 'A' || el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'LI');
                    }).map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        innerHTML: el.outerHTML
                    }))
                    """
                )
                print("Found matches:")
                for m in matches:
                    print(f"Tag={m['tagName']}, ID='{m['id']}', Class='{m['className']}'")
                    print(f"  HTML: {m['innerHTML'][:400]}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
