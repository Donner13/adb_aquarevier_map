"""
Synthetic Uptime-Watchdog (Backlog #11) - pure Python, no LLM calls.

Runs standalone for up to MAX_RUNTIME_HOURS, polling on an interval:
  - live site reachability (Surge.sh)
  - every root-level *.geojson: fetchable + valid JSON + non-empty features
  - ELWAS-WEB base URL reachability (external upstream dependency)
Every check appends one line to watchdog_log.jsonl (timestamp, target, ok,
status/latency_ms/error). Anomalies additionally append a line to
watchdog_alerts.log (human-readable, one line per incident).

Usage:
    python tools/synthetic_watchdog.py
Stop early: create a file named STOP_WATCHDOG next to this script, or Ctrl+C.
"""
import json
import os
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_PATH = os.path.join(REPO_ROOT, "tools", "watchdog_log.jsonl")
ALERT_PATH = os.path.join(REPO_ROOT, "tools", "watchdog_alerts.log")
STOP_FLAG = os.path.join(REPO_ROOT, "tools", "STOP_WATCHDOG")

LIVE_SITE = "https://adb-aquarevier-secure.surge.sh/index.html"
ELWAS_BASE = "https://www.elwasweb.nrw.de/elwas-web/index.xhtml"

CHECK_INTERVAL_S = 15 * 60          # site + geojson sanity every 15 min
ELWAS_CHECK_EVERY_N = 4             # ELWAS (heavier/external) every 4th cycle = hourly
MAX_RUNTIME_HOURS = 24

# contacts.geojson holds raw PII (names/emails/phones) and is intentionally
# excluded from every deploy via .surgeignore - never live, checking it would
# just be a permanent false alert.
NEVER_DEPLOYED = {"contacts.geojson"}

GEOJSON_FILES = sorted(
    f for f in os.listdir(REPO_ROOT)
    if f.endswith(".geojson") and os.path.isfile(os.path.join(REPO_ROOT, f))
    and f not in NEVER_DEPLOYED
)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def log_result(target, ok, **fields):
    rec = {"ts": now_iso(), "target": target, "ok": ok, **fields}
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    if not ok:
        with open(ALERT_PATH, "a", encoding="utf-8") as f:
            f.write(f"{now_iso()} ALERT {target}: {fields}\n")


def check_url(url, target_name, timeout=15):
    start = time.monotonic()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "aquarevier-watchdog/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            latency_ms = round((time.monotonic() - start) * 1000)
            ok = 200 <= resp.status < 400
            log_result(target_name, ok, status=resp.status, latency_ms=latency_ms)
            return ok
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        latency_ms = round((time.monotonic() - start) * 1000)
        log_result(target_name, False, error=str(e), latency_ms=latency_ms)
        return False


def check_geojson_files():
    for fname in GEOJSON_FILES:
        url = LIVE_SITE.replace("index.html", fname)
        start = time.monotonic()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "aquarevier-watchdog/1.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                latency_ms = round((time.monotonic() - start) * 1000)
                raw = resp.read()
                data = json.loads(raw)
                n_features = len(data.get("features", []))
                ok = resp.status == 200 and n_features > 0
                log_result(f"geojson:{fname}", ok, status=resp.status,
                           latency_ms=latency_ms, n_features=n_features,
                           size_bytes=len(raw))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError,
                json.JSONDecodeError) as e:
            log_result(f"geojson:{fname}", False, error=str(e))


def main():
    print(f"[watchdog] starting, logging to {LOG_PATH}")
    print(f"[watchdog] tracking {len(GEOJSON_FILES)} geojson files")
    deadline = time.monotonic() + MAX_RUNTIME_HOURS * 3600
    cycle = 0
    while time.monotonic() < deadline:
        if os.path.exists(STOP_FLAG):
            print("[watchdog] STOP_WATCHDOG flag found, exiting.")
            os.remove(STOP_FLAG)
            break

        check_url(LIVE_SITE, "live_site")
        check_geojson_files()
        if cycle % ELWAS_CHECK_EVERY_N == 0:
            check_url(ELWAS_BASE, "elwas_web_base", timeout=25)

        cycle += 1
        time.sleep(CHECK_INTERVAL_S)

    print("[watchdog] max runtime reached or stopped, exiting.")


if __name__ == "__main__":
    main()
