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
                
                # Print all inputs of type submit, button, or links, or list items
                elements = await frame.eval_on_selector_all(
                    "input, button, a, li, span, div",
                    """
                    elements => elements.map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        text: el.innerText || el.textContent,
                        value: el.value,
                        type: el.type,
                        outerHTML: el.outerHTML
                    })).filter(el => {
                        let t = el.text ? el.text.trim() : '';
                        let v = el.value ? el.value.trim() : '';
                        return t === 'Suche' || t === 'Ergebnisse' || t === 'Objektdetails' || v === 'Suche' || v === 'Ergebnisse' || v === 'Objektdetails';
                    })
                    """
                )
                print(f"Found {len(elements)} matching elements:")
                for el in elements:
                    t = el['text'].strip().encode('ascii', errors='replace').decode('ascii') if el['text'] else ""
                    v = el['value'].strip().encode('ascii', errors='replace').decode('ascii') if el['value'] else ""
                    print(f"Tag={el['tagName']}, ID='{el['id']}', Class='{el['className']}', Text='{t}', Value='{v}', Type='{el['type']}'")
                    print(f"  HTML: {el['outerHTML'][:300]}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
