<!-- auto-generated: hotfile_maps.py 2026-07-19 (58 Reads im Miner-Fenster). Quelle: elwas_client.py. Nicht manuell editieren - wird beim naechsten Lauf ueberschrieben. -->

### elwas_client.py
```
import re
import json
import os
from playwright.async_api import async_playwright
BASE_URL = ...

async def new_browser(p, headless=True)

async def accept_terms(page)

async def open_dataset(page, path_or_url)   # path_or_url: either a full URL or one of the relative hrefs from

async def get_frame(page)   # Some pages render the search UI inside an iframe named

async def discover_search_fields(frame)   # Auto-inspect a search form: returns list of selects (id + options)

async def fill_regional_search(page, frame, kreis_or_gemeinde_text)   # The 'BR/Kreis/Gemeinde' field used across almost every ELWAS search

async def open_regional_search_dropdown(frame)   # Opens the 'Regionale Suche' dropdown if it's not already open.

async def fill_regional_search(frame, page, kreis_or_gemeinde_text)   # Fills the regional search field (Kreis or Gemeinde) and selects the value.

async def submit_search(frame, wait_ms=3000)

async def has_excel_export(frame)

async def click_excel_export(frame, page, download_dir)   # Triggers the built-in Excel export and saves the file. Prefer this

async def get_result_row_count(frame)

async def open_detail_row(frame, index=0, wait_ms=2200)   # Click the Nth result row's detail link (works for both the

async def get_detail_tab_options(frame)   # The Objektdetails page has a dropdown to switch between sub-views

async def switch_detail_tab(frame, label, wait_ms=1800)

def extract_field(label, text)   # Pull 'Label    Value' out of a page's flattened innerText. Values

async def get_detail_text(frame)

def load_sitemap()
```

