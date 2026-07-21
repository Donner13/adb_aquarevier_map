import subprocess
import time

jules_exe = r"C:\Users\user\.gemini\antigravity-ide\scratch\ai_agent_repos\sonu-cli-advanced\jules.exe"
repo = "Dtunder/adb_aquarevier_map"

items = [
    {"num": 1, "name": "#12 Geometrie-Vereinfachung als Build-Step vor dem Deploy", "line": 1542},
    {"num": 2, "name": "#14 Barrierefreiheit", "line": 1838},
    {"num": 3, "name": "#15 Golden-Sample-Regressionstest für Extraktionslogik", "line": 1996},
    {"num": 4, "name": "Gewässergüte-Layer (EU-WRRL)", "line": 2299},
    {"num": 5, "name": "Automatisierte Sprechzettel-/Beschlussvorlagen-Generierung", "line": 2403},
    {"num": 6, "name": "Nährstoff-/Nitratbelastung im Grundwasser", "line": 2540},
    {"num": 7, "name": "Zuständigkeits-/Ansprechpartner-Layer", "line": 2674},
    {"num": 8, "name": "Nutzer-Feedback-Kanal für Datenfehler mit Status-Tracking", "line": 2948},
    {"num": 9, "name": "Struktureller Daten-Audit-Trail (Change-Feed) pro Scrape-Lauf", "line": 3110, "notes": "Achtung: Bitte zuerst Punkt 0 'KRITISCHE ARCHITEKTUR-VORGABE' bei Zeile 2968 lesen!"},
    {"num": 10, "name": "Update-Radar: Was hat sich seit dem letzten Besuch geändert?", "line": 3490},
    {"num": 11, "name": "Offener Datenexport (GeoJSON/CSV) mit Lizenz-/Versionsstempel", "line": 3644},
    {"num": 12, "name": "Coverage-Anomalie-Erkennung über Record-Counts pro Layer/Kreis", "line": 3890},
    {"num": 13, "name": "Rollenbasiertes Onboarding mit Kontext-Tour", "line": 4023},
    {"num": 14, "name": "Ökologische Durchgängigkeit an Querbauwerken (Fischwanderung)", "line": 4167},
    {"num": 15, "name": "Embed-Widget-Generator für Drittseiten (iframe/oEmbed)", "line": 4309}
]

prompt_template = """Task: {name}
Spezifikation: Aquarevier_Map_Backlog.md Zeile {line} (volle Spezifikation steht dort).
{notes_text}

Muster & Projektregeln (Auszug aus Handoff-Abschnitt B):
1. "Keine Konsolenfehler" ist NICHT ausreichend. Echter Daten-Spotcheck (Werteverteilung/Counter über alle Features) und Klickpfad mit Playwright.
2. <style vs </style Tag-Count muss nach HTML-Änderung in index.html UND internal.html exakt gleich bleiben.
3. Ablauf: Build -> Test lokal -> Commit (aussagekräftige Message) -> Push -> Auto-Deploy -> Live-Verify.
4. Bei Push-Konflikt: 'git pull --rebase', niemals force-push.
5. Jedes neue ELWAS-Dataset: Koordinaten können unter "Lage" statt "Stammdaten" liegen, ggf. dekameter-maskiert (x10-Fehler-Falle beachten!).
"""

print(f"Starte {len(items)} Jules-Sessions in PARALLEL gegen {repo}...", flush=True)

processes = []
for item in items:
    notes_text = item.get("notes", "")
    if notes_text:
        notes_text = f"\nHinweis: {notes_text}\n"
    prompt = prompt_template.format(name=item["name"], line=item["line"], notes_text=notes_text)
    
    cmd = [jules_exe, "new", "--repo", repo, prompt]
    print(f"Starte Prozess für Item {item['num']}...", flush=True)
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    processes.append((item, p))
    # Kurze Pause zum Entlasten der API-Rate-Limits
    time.sleep(0.5)

print("\nWarte auf den Abschluss aller Prozesse...", flush=True)
for item, p in processes:
    stdout, stderr = p.communicate()
    print(f"\n=== Item {item['num']}: {item['name']} ===", flush=True)
    print("Stdout:", stdout.strip(), flush=True)
    if stderr.strip():
        print("Stderr:", stderr.strip(), flush=True)
