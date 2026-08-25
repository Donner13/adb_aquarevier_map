import subprocess
import time
import sys
from playwright.sync_api import sync_playwright

def take_screenshot():
    # Start python http server in background
    port = 8091
    server_process = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(1.5)  # Wait for server to boot

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_viewport_size({"width": 1280, "height": 800})
            page.goto(f"http://localhost:{port}/index.html")
            page.wait_for_timeout(2000)
            
            # Save screenshot to the artifacts directory
            screenshot_path = r"C:\Users\user\.gemini\antigravity-ide\brain\e9172940-eacf-4c07-8138-716eb09d2a8e\sidebar_screenshot.png"
            page.screenshot(path=screenshot_path)
            print(f"[OK] Screenshot saved to {screenshot_path}")
            browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    take_screenshot()
