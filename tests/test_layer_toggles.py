"""
Playwright UI regression suite for the 13 sidebar layer-toggle buttons on
index.html and internal.html.

Toggle-state coverage chosen for this suite (task explicitly allows
judgment here instead of full combinatorial explosion):

  1. Each of the 13 layers individually: default -> click ON/OFF -> back to
     default, asserting both the button's visual `active` class and the
     underlying `map.hasLayer()` state flip correctly. This is the direct
     regression test for the bug class that already happened once: a
     sidebar refactor silently disconnected the toggle click handlers,
     with zero console errors.
  2. All-layers-ON and all-layers-OFF, each backed by a screenshot compare
     against a committed baseline (catches CSS/layout regressions the
     click-handler check above can't see, e.g. the stray </style> incident).
  3. Default (as-loaded) state screenshot.
  4. Network-request assertions split by *when* each layer's data actually
     loads (see layer_data.py): eager layers must have been fetched by page
     load; lazy/WMS layers must fire their request the moment they're first
     switched on. A disconnected click handler breaks the lazy case
     silently (no fetch, no console error) — that's the exact bug shape.
  5. Zero console.error / pageerror across the whole interaction sweep in
     each test — but never as the *only* signal (see module docstring in
     conftest.py / task history: "0 console errors" already produced false
     confidence once).
"""

import pytest

from conftest import assert_no_js_errors, assert_screenshot_matches, goto, is_button_active, layer_button, map_has_layer
from layer_data import ALL_LAYERS, DEFAULT_ON, EAGER_LAYERS, GWM_LAYER_VAR, GWM_NAME, LAZY_OR_WMS, PAGES


def _page_id(filename: str) -> str:
    return filename.rsplit(".", 1)[0]


@pytest.mark.parametrize("filename", PAGES)
def test_all_expected_layer_buttons_present(page, base_url, filename):
    goto(page, base_url, filename)
    found = set(page.eval_on_selector_all(
        ".filter-btn[data-layer-name]",
        "els => els.map(e => e.getAttribute('data-layer-name'))",
    ))
    assert found == set(ALL_LAYERS.keys()), (
        f"{filename}: sidebar layer-toggle buttons changed.\n"
        f"missing: {set(ALL_LAYERS) - found}\nunexpected: {found - set(ALL_LAYERS)}"
    )


@pytest.mark.parametrize("filename", PAGES)
def test_default_state_matches_config(page, base_url, filename):
    goto(page, base_url, filename)
    for name in ALL_LAYERS:
        expected = name in DEFAULT_ON
        assert is_button_active(page, name) == expected, f"{filename}/{name}: wrong initial button class"
        assert map_has_layer(page, name) == expected, f"{filename}/{name}: wrong initial map layer state"
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
@pytest.mark.parametrize("name", list(ALL_LAYERS.keys()))
def test_toggle_flips_visual_and_map_state(page, base_url, filename, name):
    """Each layer individually: click ON/OFF from default, and back. Requirement #2 baseline."""
    goto(page, base_url, filename)
    start_active = is_button_active(page, name)
    assert map_has_layer(page, name) == start_active

    btn = layer_button(page, name)
    btn.click()
    assert is_button_active(page, name) != start_active, (
        f"{filename}/{name}: click did not flip the button's active class "
        "(click handler may be disconnected)"
    )
    assert map_has_layer(page, name) != start_active, (
        f"{filename}/{name}: click did not flip map.hasLayer() "
        "(click handler may be disconnected)"
    )

    btn.click()
    assert is_button_active(page, name) == start_active
    assert map_has_layer(page, name) == start_active

    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
def test_eager_layers_fetched_at_page_load(page, base_url, filename):
    goto(page, base_url, filename)
    for name, geojson_file in EAGER_LAYERS.items():
        assert any(geojson_file in url for url in page.requests), (
            f"{filename}/{name}: expected '{geojson_file}' to be fetched at page load, "
            f"but it never was. Observed requests: {page.requests}"
        )
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
@pytest.mark.parametrize("name,expected_substr", list(LAZY_OR_WMS.items()))
def test_lazy_layer_fetches_on_first_toggle_on(page, base_url, filename, name, expected_substr):
    """
    Lazy/WMS layers only fetch their data the first time they're switched
    on (map.on('overlayadd', ...)). This is the strongest available check
    for a disconnected toggle handler: no fetch happens, no console error
    is raised either, so this class of bug is otherwise invisible.
    """
    goto(page, base_url, filename)
    assert not any(expected_substr in url for url in page.requests), (
        f"{filename}/{name}: '{expected_substr}' was already requested before "
        "toggling on — expected lazy-load-on-first-activation."
    )

    with page.expect_request(lambda r: expected_substr in r.url, timeout=5000):
        layer_button(page, name).click()

    assert map_has_layer(page, name) is True
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
def test_gwm_cluster_populates_on_first_toggle_on(page, base_url, filename):
    """
    Grundwassermessstellen is a special case (see layer_data.py GWM_NAME
    docstring): its geojson is fetched eagerly by the search-index builder
    regardless of layer state, so "was it fetched" can't detect a
    disconnected click handler here. What *can* detect it: the
    MarkerClusterGroup (window.gwmLayer) only receives its ~3700 markers
    inside the map.on('overlayadd', ...) handler in layers-loader.js, the
    first time the layer is switched on.
    """
    goto(page, base_url, filename)
    assert map_has_layer(page, GWM_NAME) is False
    before = page.evaluate(f"window.{GWM_LAYER_VAR}.getLayers().length")
    assert before == 0, f"{filename}: GWM cluster already had markers before first toggle-on"

    layer_button(page, GWM_NAME).click()
    page.wait_for_function(f"window.{GWM_LAYER_VAR}.getLayers().length > 0", timeout=5000)

    assert map_has_layer(page, GWM_NAME) is True
    after = page.evaluate(f"window.{GWM_LAYER_VAR}.getLayers().length")
    assert after > 0, f"{filename}: toggling Grundwassermessstellen on did not populate the cluster layer"
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
def test_default_state_screenshot(page, base_url, filename):
    goto(page, base_url, filename)
    assert_screenshot_matches(page, f"{_page_id(filename)}/default")
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
def test_all_layers_on_screenshot_and_state(page, base_url, filename):
    goto(page, base_url, filename)
    for name in ALL_LAYERS:
        if not is_button_active(page, name):
            layer_button(page, name).click()
    page.wait_for_load_state("networkidle")

    for name in ALL_LAYERS:
        assert is_button_active(page, name), f"{filename}/{name}: expected ON after 'all on' sweep"
        assert map_has_layer(page, name), f"{filename}/{name}: map layer missing after 'all on' sweep"

    assert_screenshot_matches(page, f"{_page_id(filename)}/all_on")
    assert_no_js_errors(page)


@pytest.mark.parametrize("filename", PAGES)
def test_all_layers_off_screenshot_and_state(page, base_url, filename):
    goto(page, base_url, filename)
    # start from all-on, then sweep all off, so this test also exercises
    # every button's OFF transition regardless of its own default state.
    for name in ALL_LAYERS:
        if not is_button_active(page, name):
            layer_button(page, name).click()
    for name in ALL_LAYERS:
        if is_button_active(page, name):
            layer_button(page, name).click()
    page.wait_for_load_state("networkidle")

    for name in ALL_LAYERS:
        assert not is_button_active(page, name), f"{filename}/{name}: expected OFF after 'all off' sweep"
        assert not map_has_layer(page, name), f"{filename}/{name}: map layer still present after 'all off' sweep"

    assert_screenshot_matches(page, f"{_page_id(filename)}/all_off")
    assert_no_js_errors(page)
