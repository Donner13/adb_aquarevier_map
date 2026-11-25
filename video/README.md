# AquaRevier Statusvideo (Remotion)

Ca. 2:38 Min, 1920x1080, 30 fps, ohne Ton, deutsche Texteinblendungen.

Szenen (Datei `src/scenes.tsx`, Laengen in `src/Status.tsx`):

1. Was AquaRevier ist (22 s): Akteurskarte Rheinisches Revier, 7 Kreise
2. Live-Layer (34 s): 101 Industrieeinleiter, 60 Klaeranlagen, 4.410 Grundwassermessstellen
   (ELWAS-Rohbestand; im Kartenlayer 3.746), 46 Pegel, 131 Abschnitte Einzugsgebiet-Statistik
3. Webseiten-Bewertung (42 s): Noten und Zahlen aus `docs/WEBSEITEN_BEWERTUNG.md`
4. Prognosemodell Wurm/Rur (40 s): Daten, Baselines, DWD-Wetter, LSTM, Befund, Protokoll
5. Naechste Schritte (20 s)

Alle Zahlen stammen aus den Repo-Daten bzw. der Bewertung. Die Aussagen zum Prognosemodell
(Befund, Protokoll, Umzug auf den Simulationsrechner) sind die Angaben des Auftraggebers; das
Modell liegt nicht in diesem Repo und wurde hier nicht nachgerechnet.

## Nutzung

```bash
cd video
npm install
npm run studio     # Vorschau
npm run render     # -> out/aquarevier_status.mp4
npm run stills     # Kontroll-Stills nach out/stills/
```

Auf Rechnern ohne passenden Chrome-Download kann der Render mit
`--browser-executable=/pfad/zu/chrome --chrome-mode=chrome-for-testing` aufgerufen werden.
