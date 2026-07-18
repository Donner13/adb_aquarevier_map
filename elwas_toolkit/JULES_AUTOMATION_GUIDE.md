# Jules Automation & API Handoff Guide

Dieses Dokument beschreibt die Interaktion mit Google Jules via REST API und die zur Verfügung stehenden Automatisierungsskripte, damit künftige Sessions (insb. Claude) nahtlos anknüpfen können.

---

## 1. Wie die Jules-Interaktion funktioniert

Jules-Sessions werden über die Google Jules REST-Schnittstelle verwaltet, da das lokale CLI (`jules.exe new`) den gesamten Workspace packt und hochlädt (was bei großen Datensätzen wie 200 MB GeoJSONs extrem langsam ist). Die REST API weist Jules stattdessen an, den aktuellen Stand direkt von GitHub auszuchecken.

*   **API-Endpunkt:** `https://jules.googleapis.com/v1alpha`
*   **API-Key:** Liegt unter `C:\Users\user\.gemini\antigravity-ide\scratch\jules_api_key.txt`.
*   **Authentifizierung:** HTTP-Header `X-Goog-Api-Key: <key>`
*   **Session freigeben / Message senden:**
    *   **Methode:** `POST`
    *   **URL:** `https://jules.googleapis.com/v1alpha/sessions/<session_id>:sendMessage`
    *   **Payload:** `{"prompt": "<dein text>"}`

---

## 2. Vorhandene Automatisierungs-Werkzeuge

Im Arbeitsverzeichnis `C:\Users\user\.gemini\antigravity-ide\scratch\contact_map\` befinden sich folgende Hilfsskripte:

### a) Status-Überwachung & Freigabe (`approve_all_jules.py`)
Dieses Skript listet alle Sessions über das CLI auf, sucht nach Status wie `Awaiting User Feedback` oder `Awaiting Plan Approval` und sendet automatisch das Freigabe-Signal (`"Plan approved. Please proceed with the implementation."`).
*   **Ausführung:** `python approve_all_jules.py`

### b) Der Freigabe-Daemon (`loop_approve.py`)
Führt `approve_all_jules.py` in einer Schleife (z. B. 10 Minuten lang alle 30 Sekunden) aus, damit neu generierte Pläne im Hintergrund freigegeben werden, während die Sessions parallel anlaufen.
*   **Ausführung:** `python loop_approve.py`

### c) Spezifikations-Injektion (`send_spec_to_session.py` & `send_spec_to_audit_session.py`)
Liest die gewünschten Zeilenausschnitte aus der im Repository-Root liegenden `Aquarevier_Map_Backlog.md` aus und sendet diese als Prompt an eine bestimmte Session-ID, falls ein Agent die Anforderungen nicht lokal lesen kann.

---

## 3. Übergabe-Prompt für Folgesitzungen (z. B. Claude)

Kopiere bei einer neuen Session folgenden Prompt in den Chat, damit der Agent sofort Bescheid weiß:

```markdown
Hi! Wir arbeiten am Projekt AquaRevier (Dtunder/adb_aquarevier_map).
Es laufen aktuell mehrere parallele Jules-Sessions für das Backlog.
Bitte beachte folgende Tools und Pfade:
1. Der API-Key für Google Jules liegt in:
   C:\Users\user\.gemini\antigravity-ide\scratch\jules_api_key.txt
2. Es gibt fertige Skripte im Projekt-Root:
   - `approve_all_jules.py` (Gibt alle wartenden Jules-Pläne frei)
   - `loop_approve.py` (Daemon für periodische Freigaben im Hintergrund)
3. Führe `python approve_all_jules.py` oder `loop_approve.py` aus, um den Abarbeitungsstatus zu prüfen und offene Planungsphasen freizugeben.
4. Nutze `C:\Users\user\.gemini\antigravity-ide\scratch\ai_agent_repos\sonu-cli-advanced\jules.exe remote list --session` für die manuelle Status-Übersicht.
```
