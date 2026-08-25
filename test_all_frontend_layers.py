"""
test_all_frontend_layers.py
NOTE / DEPRECATION:
Canonical E2E regression tests for AquaRevier are now maintained in the Playwright JS test suite:
  `npx playwright test tests/ui-regression/`
This Python script serves as an auxiliary standalone HTTP layer audit runner.
"""

import asyncio
import subprocess
import sys
from playwright.async_api import async_playwright

async def run_playwright_layer_audit():
    sys.stdout.reconfigure(encoding='utf-8')
    print("=== STARTING PLAYWRIGHT FRONTEND LAYER AUDIT ===")
    
    # Start local HTTP server
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8888"], cwd=".")
    await asyncio.sleep(2)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            # Track page errors, console errors, and failed requests
            console_errors = []
            page_errors = []
            failed_requests = []

            page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}"))

            pages_to_test = [
                ("index.html", "http://localhost:8888/index.html"),
                ("internal.html", "http://localhost:8888/internal.html")
            ]

            for page_name, url in pages_to_test:
                print(f"\n--- Testing {page_name} ---")
                console_errors.clear()
                page_errors.clear()
                failed_requests.clear()

                # Bypass onboarding modal by injecting localStorage pre-navigation or clicking skip
                await page.goto(url, wait_until="commit")
                await page.evaluate("() => { localStorage.setItem('aquarevier_user_role', 'all'); localStorage.setItem('aquarevier_onboarding_completed', 'true'); }")
                await page.goto(url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(1000)

                # Close onboarding modal if still visible
                modal = await page.query_selector("#onboarding-role-modal")
                if modal and await modal.is_visible():
                    close_btn = await page.query_selector("#onboarding-role-modal button, #onboarding-role-modal .close-btn, #onboarding-skip-btn")
                    if close_btn:
                        await close_btn.click(force=True)
                    else:
                        await page.evaluate("() => { document.getElementById('onboarding-role-modal').style.display = 'none'; }")

                # Find all buttons with data-layer-name
                layer_buttons = await page.query_selector_all("button[data-layer-name]")
                print(f"Found {len(layer_buttons)} layer buttons with data-layer-name")

                tested_count = 0
                for btn in layer_buttons:
                    layer_name = await btn.get_attribute("data-layer-name")
                    is_visible = await btn.is_visible()
                    if not is_visible:
                        continue
                    
                    try:
                        # Click to activate layer
                        await btn.click(force=True, timeout=3000)
                        await page.wait_for_timeout(300)
                        tested_count += 1
                    except Exception as e:
                        print(f"  ❌ Error clicking layer button '{layer_name}': {e}")

                print(f"[{page_name}] Successfully tested {tested_count}/{len(layer_buttons)} layer toggles")
                print(f"[{page_name}] Page Errors: {len(page_errors)}")
                for err in page_errors:
                    print(f"  ❌ PageError: {err}")

                print(f"[{page_name}] Console Errors/Warnings: {len(console_errors)}")
                for err in console_errors:
                    if "error" in err.lower():
                        print(f"  ❌ ConsoleError: {err}")

                print(f"[{page_name}] Failed Network Requests: {len(failed_requests)}")
                for req in failed_requests:
                    if "favicon" not in req:
                        print(f"  ⚠️ FailedRequest: {req}")

            await browser.close()

    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(run_playwright_layer_audit())
