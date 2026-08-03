import subprocess
import time
import os
import sys
from playwright.sync_api import sync_playwright

def get_dom():
    port = 8092
    server_process = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(1.5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f"http://localhost:{port}/index.html")
            page.wait_for_timeout(2000)
            
            # Get the outerHTML of the sidebar
            sidebar_html = page.eval_on_selector("#sidebar", "el => el.outerHTML")
            
            # Save it to a file
            dom_path = r"C:\Users\user\.gemini\antigravity-ide\brain\e9172940-eacf-4c07-8138-716eb09d2a8e\sidebar_dom.html"
            with open(dom_path, "w", encoding="utf-8") as f:
                f.write(sidebar_html)
            print(f"[OK] Sidebar DOM saved to {dom_path}")
            browser.close()
    finally:
        server_process.terminate()

if __name__ == "__main__":
    get_dom()
