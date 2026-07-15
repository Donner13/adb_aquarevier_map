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
            
            button_links = frame.locator("input.buttonLink")
            if await button_links.count() > 0:
                await button_links.first.click()
                await page.wait_for_timeout(3000)
                
                # Print outerHTML of the parent tab container
                # Let's find any element containing the text "Objektdetails"
                html = await frame.eval_on_selector(
                    "body",
                    """
                    el => {
                        // Find element containing "Objektdetails" that doesn't have child containing "Objektdetails"
                        let all = Array.from(el.querySelectorAll('*'));
                        let match = all.find(e => e.innerText && e.innerText.trim() === 'Objektdetails');
                        if (match) {
                            // Go up 3 levels to print the container HTML
                            let parent = match.parentElement.parentElement.parentElement;
                            return parent ? parent.outerHTML : match.outerHTML;
                        }
                        return "No match found";
                    }
                    """
                )
                print("Container HTML:")
                print(html.encode('ascii', errors='replace').decode('ascii'))
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
