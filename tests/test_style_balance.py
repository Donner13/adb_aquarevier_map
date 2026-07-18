"""
Regression test for commit 527cc3e ("fix: stray closing </style> tag broke
ALL page styling on production"). A single unbalanced `</style>` in either
page silently breaks every subsequent CSS rule in the browser with zero
console errors — this check catches it before it ever reaches a browser.

Pure string counting, no server/browser needed.
"""

from pathlib import Path

import pytest

from layer_data import PAGES

REPO_ROOT = Path(__file__).resolve().parent.parent


@pytest.mark.parametrize("filename", PAGES)
def test_style_tags_are_balanced(filename):
    html = (REPO_ROOT / filename).read_text(encoding="utf-8")
    open_count = html.count("<style")
    close_count = html.count("</style")
    assert open_count == close_count, (
        f"{filename}: {open_count} '<style' vs {close_count} '</style' — "
        "an unbalanced style tag silently breaks ALL page CSS (see commit 527cc3e)."
    )
    # sanity: the page must actually have inline styling, otherwise a count
    # of 0 == 0 would pass this test for the wrong reason.
    assert open_count >= 1, f"{filename}: expected at least one <style> block"
