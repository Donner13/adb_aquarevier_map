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
        
        frame = page.frame(name="mainDataIframe")
        if frame:
            await frame.click("text=Einleitende Betriebe")
            await page.wait_for_timeout(4000)
            
            # Print input and select elements inside the frame
            print("Analyzing input elements...")
            inputs = await frame.eval_on_selector_all(
                "input, select, button",
                """
                elements => elements.map(el => ({
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    type: el.type,
                    value: el.value,
                    name: el.name,
                    placeholder: el.placeholder
                }))
                """
            )
            for i, inp in enumerate(inputs):
                print(f"Input {i}: Tag={inp['tagName']}, ID='{inp['id']}', Type='{inp['type']}', Name='{inp['name']}', Value='{inp['value']}'")
                
            # Click the BR/Kreis/Gemeinde input
            # Let's find it. Looking at the screenshot, it's next to "BR/Kreis/Gemeinde".
            # The label text is "BR/Kreis/Gemeinde". Let's search by ID containing 'gemeinde' or 'kreis' or 'reg'.
            # Or we click it using locator.
            reg_input = frame.locator("//input[contains(@id, 'gemeinde') or contains(@id, 'Gemeinde') or contains(@id, 'region') or contains(@id, 'Region')]")
            if await reg_input.count() > 0:
                print("Found regional input, clicking it...")
                await reg_input.first.click()
                await page.wait_for_timeout(2000)
                
                # Take screenshot to see if a popup opened
                await page.screenshot(path="elwas_after_reg_click.png")
                print("Saved elwas_after_reg_click.png")
                
                # Let's print any dialogs or new buttons that appeared
                new_buttons = await frame.eval_on_selector_all(
                    "div.ui-dialog:visible button, div.ui-dialog:visible input",
                    """
                    elements => elements.map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        text: el.innerText || el.value
                    }))
                    """
                )
                print(f"Found {len(new_buttons)} buttons in visible dialogs:")
                for btn in new_buttons:
                    print(f"  Dialog element: Tag={btn['tagName']}, ID='{btn['id']}', Text='{btn['text']}'")
            else:
                print("Regional input not found!")
        else:
            print("Frame not found!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
