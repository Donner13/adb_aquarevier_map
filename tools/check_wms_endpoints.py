#!/usr/bin/env python3
"""
AquaRevier WMS Completeness & Availability Verification Script (Backlog 7)
Performs real HTTP checks against all WMS endpoints.
"""
import sys
import json
import urllib.request
import urllib.error
import time

WMS_ENDPOINTS = [
    {
        "name": "Geobasis NRW Verwaltungsgrenzen",
        "url": "https://www.wms.nrw.de/geobasis/wms_nw_dvg?service=WMS&request=GetCapabilities"
    },
    {
        "name": "LANUV Gewässernetz GSK3E",
        "url": "https://www.wms.nrw.de/umwelt/gsk3e?service=WMS&request=GetCapabilities"
    },
    {
        "name": "GD NRW Bergbauberechtigungen",
        "url": "https://www.wms.nrw.de/wms/bebu?service=WMS&request=GetCapabilities"
    },
    {
        "name": "LANUV Hochwassergefahrenkarten",
        "url": "https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte?service=WMS&request=GetCapabilities"
    },
    {
        "name": "Starkregen Euskirchen",
        "url": "https://starkregen-euskirchen-v11.cismet.de/geoserver/wms?service=WMS&request=GetCapabilities"
    },
    {
        "name": "OpenStreetMap Base Tile Server",
        "url": "https://tile.openstreetmap.org/0/0/0.png"
    },
    {
        "name": "CartoDB Dark Matter Base Tile Server",
        "url": "https://a.basemaps.cartocdn.com/dark_all/0/0/0.png"
    }
]

def check_endpoint(endpoint):
    name = endpoint["name"]
    url = endpoint["url"]
    start_time = time.time()
    req = urllib.request.Request(url, headers={'User-Agent': 'AquaRevier-WMS-Checker/1.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            elapsed = round((time.time() - start_time) * 1000, 2)
            content_type = response.headers.get('Content-Type', 'unknown')
            print(f"[OK] {name}")
            print(f"     Status: {status} | Duration: {elapsed}ms | Type: {content_type}")
            return True, status, elapsed
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {name} - HTTP Error {e.code}: {e.reason}")
        return False, e.code, 0
    except urllib.error.URLError as e:
        print(f"[FAIL] {name} - URL Error: {e.reason}")
        return False, 0, 0
    except Exception as e:
        print(f"[FAIL] {name} - Error: {e}")
        return False, 0, 0

def main():
    print("==================================================")
    print("AquaRevier WMS & Tile Endpoint Completeness Check")
    print("==================================================")
    
    results = []
    all_ok = True
    
    for ep in WMS_ENDPOINTS:
        ok, status, duration = check_endpoint(ep)
        results.append({"name": ep["name"], "ok": ok, "status": status, "duration_ms": duration})
        if not ok:
            all_ok = False
        print("-" * 50)
        
    summary = {
        "total": len(WMS_ENDPOINTS),
        "passed": sum(1 for r in results if r["ok"]),
        "failed": sum(1 for r in results if not r["ok"]),
        "endpoints": results
    }
    
    print("\nCheck Summary:")
    print(f"Total: {summary['total']} | Passed: {summary['passed']} | Failed: {summary['failed']}")
    
    with open("wms_check_results.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
        
    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
