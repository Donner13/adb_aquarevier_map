import subprocess
import time
import os
import sys
from playwright.sync_api import sync_playwright

def run_tests():
    # Start python http server in background
    port = 8089
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
            
            # Print page console messages
            page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
            
            # Load local index.html
            page.goto(f"http://localhost:{port}/index.html")
            page.wait_for_timeout(1000)

            print("--- Running Sidebar Filters Playwright Tests ---")

            # 1. Test hover tooltips (title attribute)
            btn_behorde = page.locator('button[data-group="Behörde"]')
            title = btn_behorde.get_attribute("title")
            assert title == "Wasserbehörden, Bezirksregierungen und Ministerien", f"Unexpected title: {title}"
            print("[OK] Hover Tooltip (title attribute) verified.")

            # 2. Test button toggle: Active -> Inactive
            # Initially, active buttons have class 'active' and not 'inactive'
            assert "active" in btn_behorde.get_attribute("class")
            assert "inactive" not in btn_behorde.get_attribute("class")

            # Click to deactivate
            btn_behorde.click()
            page.wait_for_timeout(500)
            class_attr = btn_behorde.get_attribute("class")
            print(f"DEBUG: btn_behorde classes after click: '{class_attr}'")
            classes = class_attr.split()
            assert "inactive" in classes
            assert "active" not in classes
            print("[OK] Individual button toggle deactivation verified (inactive class added).")

            # Click again to reactivate
            btn_behorde.click()
            page.wait_for_timeout(200)
            classes_reactivated = btn_behorde.get_attribute("class").split()
            assert "active" in classes_reactivated
            assert "inactive" not in classes_reactivated
            print("[OK] Individual button toggle reactivation verified.")

            # 3. Test Block 1 Quick Actions (Alle aus / Alle an)
            btn_all_out = page.locator('#btn-actors-none')
            btn_all_in = page.locator('#btn-actors-all')

            btn_all_out.click()
            page.wait_for_timeout(300)
            # Verify all data-group buttons are inactive
            group_buttons = page.locator('button[data-group]')
            for i in range(group_buttons.count()):
                btn = group_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                assert "inactive" in classes, f"Button {i} not deactivated"
                assert "active" not in classes, f"Button {i} still has active class"
            print("[OK] Quick Action 'Alle aus' for Regionale Akteure verified.")

            btn_all_in.click()
            page.wait_for_timeout(300)
            # Verify all data-group buttons are active
            for i in range(group_buttons.count()):
                btn = group_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                assert "active" in classes, f"Button {i} not activated"
                assert "inactive" not in classes, f"Button {i} still has inactive class"
            print("[OK] Quick Action 'Alle an' for Regionale Akteure verified.")

            # 4. Test Block 2 Branche Quick Actions
            btn_branches_none = page.locator('#btn-branches-none')
            btn_branches_all = page.locator('#btn-branches-all')

            btn_branches_none.click()
            page.wait_for_timeout(300)
            branch_buttons = page.locator('button[data-branche]')
            for i in range(branch_buttons.count()):
                btn = branch_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                assert "inactive" in classes
                assert "active" not in classes
            print("[OK] Quick Action 'Alle aus' for Industrie-Branchen verified.")

            btn_branches_all.click()
            page.wait_for_timeout(300)
            for i in range(branch_buttons.count()):
                btn = branch_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                if btn.get_attribute("data-layer-name") not in ["HQ häufig (LANUV)", "HQ100 (LANUV)", "HQ extrem (LANUV)", "Starkregen Euskirchen"]:
                    assert "active" in classes
                    assert "inactive" not in classes
            print("[OK] Quick Action 'Alle an' for Industrie-Branchen verified.")

            # 5. Test Block 3 Layer Quick Actions
            btn_layers_none = page.locator('#btn-layers-none')
            btn_layers_all = page.locator('#btn-layers-all')

            btn_layers_none.click()
            page.wait_for_timeout(300)
            layer_buttons = page.locator('button[data-layer-name]:not(.pegel-analysis-btn)')
            for i in range(layer_buttons.count()):
                btn = layer_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                assert "inactive" in classes
                assert "active" not in classes
            print("[OK] Quick Action 'Alle aus' for Fachdaten & Layer verified.")

            btn_layers_all.click()
            page.wait_for_timeout(300)
            for i in range(layer_buttons.count()):
                btn = layer_buttons.nth(i)
                classes = btn.get_attribute("class").split()
                if btn.get_attribute("data-layer-name") not in ["HQ häufig (LANUV)", "HQ100 (LANUV)", "HQ extrem (LANUV)", "Starkregen Euskirchen"]:
                    assert "active" in classes
                    assert "inactive" not in classes
            print("[OK] Quick Action 'Alle an' for Fachdaten & Layer verified.")

            # 6. Test Live Counters (exist and updated)
            counter_badge = btn_behorde.locator('.counter-badge')
            counter_text = counter_badge.text_content()
            assert "(" in counter_text and "/" in counter_text and ")" in counter_text
            print(f"[OK] Counter Badge format verified: {counter_text}")

            browser.close()
            print("[PASS] ALL TESTS PASSED SUCCESSFULLY!")

    finally:
        server_process.terminate()

if __name__ == "__main__":
    run_tests()
