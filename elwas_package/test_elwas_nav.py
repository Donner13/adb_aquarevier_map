import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Navigating to https://www.elwasweb.nrw.de/...")
        await page.goto("https://www.elwasweb.nrw.de/")
        await page.wait_for_load_state("networkidle")
        print(f"Title: {await page.title()}")
        print(f"URL: {page.url}")
        
        # Take a screenshot before accepting terms
        await page.screenshot(path="elwas_before_accept.png")
        print("Saved elwas_before_accept.png")
        
        # Check for Nutzungsbedingungen modal and click Accept button
        # Let's list all buttons in the form to see what they are
        buttons = await page.locator("button, input[type='button'], input[type='submit'], a.ui-button").all()
        print(f"Found {len(buttons)} button elements on page.")
        for i, btn in enumerate(buttons):
            text = await btn.text_content()
            val = await btn.get_attribute("value")
            btn_id = await btn.get_attribute("id")
            # Safely print text by replacing non-ascii characters
            safe_text = text.strip().encode('ascii', errors='replace').decode('ascii') if text else ''
            print(f"Button {i}: id='{btn_id}', text='{safe_text}', value='{val if val else ''}'")
            
        # Let's look for a button containing 'akzeptieren', 'einverstanden', 'zustimmen', or 'ok'
        accept_btn = None
        for btn in buttons:
            text = (await btn.text_content() or "").lower()
            val = (await btn.get_attribute("value") or "").lower()
            btn_id = (await btn.get_attribute("id") or "").lower()
            if "akzeptieren" in text or "einverstanden" in text or "akzeptieren" in val or "einverstanden" in val or "akzeptieren" in btn_id:
                accept_btn = btn
                print(f"Targeted accept button: text='{text.strip()}', id='{btn_id}'")
                break
                
        if accept_btn:
            await accept_btn.click()
            print("Clicked accept button. Waiting for dialog to disappear...")
            await page.wait_for_timeout(2000)
        else:
            # Fallback: search by text selector
            for term in ["Akzeptieren", "Einverstanden", "Zustimmen", "gelesen"]:
                el = page.locator(f"text={term}")
                if await el.count() > 0:
                    print(f"Fallback accept click on: text={term}")
                    await el.first.click()
                    await page.wait_for_timeout(2000)
                    break
        
        await page.screenshot(path="elwas_after_accept.png")
        print("Saved elwas_after_accept.png")
        
        # Try navigating again
        try:
            print("Clicking 'Daten'...")
            await page.locator("text=Daten").first.click()
            await page.wait_for_timeout(1000)
            print(f"URL after 'Daten': {page.url}")
            
            print("Clicking 'Abwasser'...")
            await page.locator("text=Abwasser").first.click()
            await page.wait_for_timeout(1000)
            
            print("Clicking 'Industrielles Abwasser'...")
            await page.locator("text=Industrielles Abwasser").first.click()
            await page.wait_for_timeout(1000)
            
            print("Clicking 'Einleitende Betriebe'...")
            await page.locator("text=Einleitende Betriebe").first.click()
            await page.wait_for_timeout(3000)
            
            print(f"Final URL: {page.url}")
            await page.screenshot(path="elwas_final.png")
            print("Saved elwas_final.png")
            
        except Exception as e:
            print(f"Error during navigation: {e}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())


if __name__ == "__main__":
    asyncio.run(main())
