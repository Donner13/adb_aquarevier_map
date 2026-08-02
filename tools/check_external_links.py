#!/usr/bin/env python3
"""Check every municipal portal link rendered by the two AquaRevier pages."""

from __future__ import annotations

import html.parser
import pathlib
import sys
import urllib.error
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = ("index.html", "internal.html")
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/138.0.0.0 Safari/537.36"
)


class PortalLinkParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.portal_links: list[dict[str, str]] = []
        self.local_links: list[str] = []
        self.inline_portal_buttons = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name: value or "" for name, value in attrs}
        classes = set(values.get("class", "").split())

        if tag == "button" and "external-portal-link" in classes:
            self.inline_portal_buttons += 1

        if tag != "a":
            return

        href = values.get("href", "")
        if "external-portal-link" in classes:
            self.portal_links.append(
                {
                    "key": values.get("data-portal-key", ""),
                    "href": href,
                    "target": values.get("target", ""),
                    "rel": values.get("rel", ""),
                }
            )
        elif href and not href.startswith(("http://", "https://", "#")):
            self.local_links.append(href)


def parse_page(filename: str) -> PortalLinkParser:
    parser = PortalLinkParser()
    parser.feed((ROOT / filename).read_text(encoding="utf-8"))
    return parser


def check_url(url: str) -> tuple[bool, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            status = response.status
            final_url = response.geturl()
            response.read(1)
        return 200 <= status < 400, f"HTTP {status} -> {final_url}"
    except (urllib.error.URLError, TimeoutError) as error:
        return False, str(error)


def main() -> int:
    parsed = {filename: parse_page(filename) for filename in PAGES}
    failures: list[str] = []

    expected_links = parsed[PAGES[0]].portal_links
    for filename, page in parsed.items():
        if page.inline_portal_buttons:
            failures.append(
                f"{filename}: {page.inline_portal_buttons} externe Links sind noch als "
                "onclick-Buttons statt als sichere <a>-Links umgesetzt"
            )
        if page.portal_links != expected_links:
            failures.append(f"{filename}: Portallinks weichen von {PAGES[0]} ab")
        for link in page.portal_links:
            if not link["key"]:
                failures.append(f"{filename}: data-portal-key fehlt bei {link['href']}")
            if link["target"] != "_blank":
                failures.append(f"{filename}: target=_blank fehlt bei {link['href']}")
            rel = set(link["rel"].split())
            if not {"noopener", "noreferrer"}.issubset(rel):
                failures.append(f"{filename}: sicherer rel-Wert fehlt bei {link['href']}")
        for local_link in page.local_links:
            target = ROOT / local_link.split("#", 1)[0].split("?", 1)[0]
            if not target.is_file():
                failures.append(f"{filename}: lokales Linkziel fehlt: {local_link}")

    print(f"Prüfe {len(expected_links)} kommunale Portallinks aus {len(PAGES)} Seiten ...")
    for link in expected_links:
        ok, detail = check_url(link["href"])
        marker = "OK" if ok else "FEHLER"
        print(f"[{marker}] {link['key']}: {detail}")
        if not ok:
            failures.append(f"{link['key']}: {detail}")

    if failures:
        print("\nLinkprüfung fehlgeschlagen:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("\nAlle Portal- und lokalen Linkziele sind gültig.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
