from playwright.sync_api import sync_playwright

def test_live_errors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(err.message))
        page.on("console", lambda msg: print(f"LIVE CONSOLE: {msg.text}") if msg.type == "error" else None)

        print("Loading live page...")
        page.goto("https://adb-aquarevier-secure.surge.sh/")
        page.wait_for_timeout(2000)

        if errors:
            print("--- RUNTIME ERRORS FOUND ---")
            for e in errors:
                print("Error:", e)
        else:
            print("No runtime errors on page load!")
        browser.close()

if __name__ == "__main__":
    test_live_errors()
