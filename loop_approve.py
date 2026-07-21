import time
import subprocess

print("Starte automatische Freigabe-Schleife (läuft 10 Minuten, alle 30 Sekunden)...")
for i in range(20):
    print(f"Durchlauf {i+1}/20...")
    subprocess.run(["python", "approve_all_jules.py"])
    time.sleep(30)
print("Schleife beendet.")
