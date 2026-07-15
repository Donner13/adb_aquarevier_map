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
        
        # List frames
        frames = page.frames
        print(f"Total frames: {len(frames)}")
        for i, frame in enumerate(frames):
            print(f"Frame {i}: Name='{frame.name}', URL='{frame.url}'")
            # If we want to check the contents of each frame
            try:
                elements = await frame.eval_on_selector_all(
                    "//*[contains(text(), 'Einleitende') or contains(text(), 'Betriebe')]",
                    """
                    elements => elements.map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        text: el.innerText,
                        isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
                    }))
                    """
                )
                print(f"  Found {len(elements)} matching elements in frame {i}:")
                for j, el in enumerate(elements):
                    safe_text = el['text'].strip().encode('ascii', errors='replace').decode('ascii')
                    print(f"    El {j}: Tag={el['tagName']}, ID='{el['id']}', Class='{el['className']}', Visible={el['isVisible']}, Text='{safe_text[:60]}'")
            except Exception as e:
                print(f"  Error reading frame {i}: {e}")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
