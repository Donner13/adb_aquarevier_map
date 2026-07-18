"""
Shared fixtures for the Playwright UI regression suite.

Design notes (read this before touching thresholds / mocking):

- No pytest-playwright dependency. playwright, pytest and Pillow were
  already available in this environment; hand-rolling three small fixtures
  on top of raw `playwright.sync_api` avoids pulling in a plugin whose
  snapshot-fixture CLI flags/paths vary across versions, for one extra
  dependency we don't otherwise need.

- The app is served over real HTTP (`python -m http.server`), not opened as
  a `file://` URL, because index.html/internal.html load all their data via
  `fetch()`, which browsers block (or behave inconsistently) under file://.

- Cross-origin map tile / WMS requests (basemaps.cartocdn.com,
  tile.openstreetmap.org, wms.nrw.de) are intercepted and fulfilled with a
  fixed solid-color placeholder PNG. Two reasons: (1) screenshot diffing
  needs deterministic pixels — real CDN tile content/rendering is not
  guaranteed stable run-to-run; (2) CI shouldn't depend on those third-party
  services being reachable/fast. Playwright still fires the `request` event
  for intercepted routes *before* fulfilling them, so "was this request
  made" assertions (see test_layer_toggles.py) are unaffected by the mock —
  we're only replacing the response body, not suppressing the request.

- Same-origin `*.geojson` requests are NOT intercepted; they hit the real
  local http.server serving the real repo data, which is what makes the
  network-request assertions meaningful.
"""

import re
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

import numpy as np
import pytest
from PIL import Image
from playwright.sync_api import sync_playwright

REPO_ROOT = Path(__file__).resolve().parent.parent
SCREENSHOT_DIR = Path(__file__).resolve().parent / "screenshots"
BASELINE_DIR = SCREENSHOT_DIR / "baseline"
ACTUAL_DIR = SCREENSHOT_DIR / "actual"

EXTERNAL_TILE_HOST_RE = re.compile(
    r"basemaps\.cartocdn\.com|tile\.openstreetmap\.org|wms\.nrw\.de"
)


def _placeholder_tile_png() -> bytes:
    buf = BytesIO()
    Image.new("RGB", (256, 256), (58, 62, 74)).save(buf, format="PNG")
    return buf.getvalue()


_PLACEHOLDER_TILE = _placeholder_tile_png()


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _wait_for_server(url: str, timeout: float = 15.0) -> None:
    deadline = time.time() + timeout
    last_err = None
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=1).read(1)
            return
        except (urllib.error.URLError, ConnectionError, OSError) as e:
            last_err = e
            time.sleep(0.2)
    raise RuntimeError(f"Local server never became ready at {url}: {last_err}")


@pytest.fixture(scope="session")
def base_url():
    port = _free_port()
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
        cwd=str(REPO_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    url = f"http://127.0.0.1:{port}"
    try:
        _wait_for_server(f"{url}/index.html")
        yield url
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 960})

    def _fulfill_placeholder(route):
        route.fulfill(status=200, content_type="image/png", body=_PLACEHOLDER_TILE)

    context.route(EXTERNAL_TILE_HOST_RE, _fulfill_placeholder)

    pg = context.new_page()
    pg.console_errors = []
    pg.page_errors = []
    pg.requests = []
    pg.on(
        "console",
        lambda msg: pg.console_errors.append(msg.text) if msg.type == "error" else None,
    )
    pg.on("pageerror", lambda exc: pg.page_errors.append(str(exc)))
    pg.on("request", lambda req: pg.requests.append(req.url))

    yield pg

    context.close()


def goto(page, base_url, filename):
    """Navigate to a page and wait for the sidebar + initial fetch burst to settle."""
    page.goto(f"{base_url}/{filename}")
    page.wait_for_selector('.filter-btn[data-layer-name]')
    page.wait_for_load_state("networkidle")


def assert_no_js_errors(page):
    assert page.console_errors == [], f"console.error fired: {page.console_errors}"
    assert page.page_errors == [], f"uncaught JS exception: {page.page_errors}"


def layer_button(page, name):
    return page.locator(f'.filter-btn[data-layer-name="{name}"]')


def is_button_active(page, name) -> bool:
    classes = layer_button(page, name).get_attribute("class") or ""
    return "active" in classes.split()


def map_has_layer(page, name) -> bool:
    return page.evaluate("name => map.hasLayer(overlayMaps[name])", name)


# --- screenshot diffing -------------------------------------------------

DIFF_THRESHOLD = 0.005  # fraction of pixels allowed to differ (0.5%)
UPDATE_BASELINES = False  # flipped by --update-baselines


def pytest_addoption(parser):
    parser.addoption(
        "--update-baselines",
        action="store_true",
        default=False,
        help="Write current screenshots as the new baseline instead of diffing against it.",
    )


@pytest.fixture(autouse=True)
def _capture_update_flag(request):
    global UPDATE_BASELINES
    UPDATE_BASELINES = request.config.getoption("--update-baselines")


def assert_screenshot_matches(page, name: str):
    """
    Full-page screenshot vs. a committed baseline PNG, compared with PIL.
    Fails if more than DIFF_THRESHOLD of pixels differ by more than a small
    per-channel tolerance (anti-aliasing/font-hinting noise).
    """
    baseline_path = BASELINE_DIR / f"{name}.png"
    ACTUAL_DIR.mkdir(parents=True, exist_ok=True)
    actual_path = ACTUAL_DIR / f"{name}.png"
    page.screenshot(path=str(actual_path), full_page=True)

    if UPDATE_BASELINES or not baseline_path.exists():
        baseline_path.parent.mkdir(parents=True, exist_ok=True)
        baseline_path.write_bytes(actual_path.read_bytes())
        if not UPDATE_BASELINES:
            pytest.fail(
                f"No baseline for '{name}' — wrote one from the current run. "
                f"Re-run to actually diff, and verify+commit {baseline_path}."
            )
        return

    actual = Image.open(actual_path).convert("RGB")
    baseline = Image.open(baseline_path).convert("RGB")
    if actual.size != baseline.size:
        pytest.fail(
            f"Screenshot '{name}' size changed: baseline={baseline.size} actual={actual.size}"
        )

    a = np.asarray(actual, dtype=np.int16)
    b = np.asarray(baseline, dtype=np.int16)
    per_pixel_delta = np.abs(a - b).sum(axis=2)  # sum over R,G,B
    diff_pixels = int((per_pixel_delta > 30).sum())
    fraction = diff_pixels / float(a.shape[0] * a.shape[1])
    assert fraction <= DIFF_THRESHOLD, (
        f"Screenshot '{name}' differs from baseline by {fraction:.4%} of pixels "
        f"(threshold {DIFF_THRESHOLD:.2%}). See {actual_path} vs {baseline_path}."
    )
