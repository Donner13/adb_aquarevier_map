"""
Pegel-Industrieabwasser-Korrelation.

Berechnet je Pegel (pegel.geojson): "Dieser Pegel fuehrt im Median X m3/s,
die oberhalb liegenden Betriebe leiten bis zu Y% davon als Industrieabwasser
ein." X = mq_m3s des Pegels. Y = Summe der (auf m3/s umgerechneten)
Abwassermengen aller "oberhalb" liegenden Industrie-Direkteinleiter, als
Prozentsatz von X.

METHODIK ("upstream"-Proxy, da kein echtes Fliessgewaesser-Netz-Topologiemodell
im Repo existiert):

1. Nur echte Direkteinleiter zaehlen. elwas_einleiter.geojson enthaelt 101
   Betriebe, davon nur 10 mit "Direkteinleitung" in einleitungsart (Rest sind
   reine Indirekteinleiter, die in die Kanalisation/Klaeranlage einleiten,
   nicht direkt in ein Gewaesser -- deren Abwasser hier mitzuzaehlen waere
   irrefuehrend, da build_catchment_stats.py's Einzugsgebiet-Statistik-Layer
   das bewusst pauschal fuer ALLE Betriebe tut (andere Fragestellung:
   "Industrietaetigkeit im Gebiet"), diese Funktion hier aber eine konkrete
   hydrologische Aussage ueber Fluss-Durchfluss macht.

2. Raeumliche Zuordnung Betrieb -> Teileinzugsgebiet (TEZG) per Point-in-
   Polygon auf rur_einzugsgebiet.geojson (131 TEZG-Polygone, WGS84), exakt
   wie in build_catchment_stats.py (shapely .contains()/.touches() auf dem
   eigenen Betriebs-Standortpunkt -- nicht auf den einzelnen
   Einleitungsstellen-Punkten, da ein Betrieb mehrere Einleitungsstellen ohne
   Mengen-Aufschluesselung pro Stelle haben kann; der Standortpunkt liegt in
   den Stichproben <1km von der tatsaechlichen Einleitungsstelle entfernt).

3. "Oberhalb liegend" (upstream) TEZG-Menge je Pegel: Die TEZG-Polygone tragen
   GEZG ("Gesamteinzugsgebiet" in km2) = kumulierte Einzugsgebietsflaeche am
   Auslass dieses Polygons -- nimmt hydrologisch definitionsgemaess
   flussabwaerts monoton zu. Vorgehen je Pegel:
     a) Anker-Polygon = TEZG-Polygon mit GEW_NAME == Pegel-Gewaesser, dessen
        GEZG am naechsten am Pegel-eigenen einzugsgebiet_km2 liegt (beide
        Werte stammen aus unterschiedlichen Quellen/Erhebungen, daher
        Naeherung statt exaktem Treffer).
     b) Start-Menge = alle gleichnamigen (GEW_NAME) TEZG-Polygone mit
        GEZG <= Anker-GEZG (das sind die Segmente des Pegel-Flusses selbst,
        oberhalb oder auf Hoehe des Pegels).
     c) Flood-Fill ueber die TEZG-Nachbarschaft (Polygone, die sich beruehren/
        ueberschneiden, kleiner Toleranz-Buffer gegen Floating-Point-Luecken):
        von der Start-Menge aus werden angrenzende Polygone JEDER anderen
        GEW_NAME (= Nebenflues-Zuflusse) mit aufgenommen, SOFERN deren
        eigenes GEZG <= Anker-GEZG ist (Groessen-Plausibilitaetsgrenze: ein
        Nebenfluss-Teilgebiet, dessen eigene Gesamtflaeche schon groesser ist
        als alles oberhalb des Pegels, kann nicht vollstaendig oberhalb
        liegen). Iteriert bis keine neuen Polygone mehr dazukommen.
   Das ergibt eine raeumlich zusammenhaengende Flaeche "oberhalb des Pegels"
   ueber Haupt- UND Nebengewaesser, ohne echte Fliessrichtungs-Kanten -- ein
   Proxy, kein exaktes hydrologisches Netzmodell. Bekannte Schwaeche: ein
   Nachbar-Teilgebiet, das eigentlich unterhalb einmuendet, aber zufaellig
   klein genug ist und die Flood-Fill-Grenze beruehrt, kann faelschlich
   mit aufgenommen werden. Bei nur 10 Direkteinleitern im ganzen Datensatz
   ist das Risiko einer nennenswerten Verzerrung gering.

4. ABDECKUNG: rur_einzugsgebiet.geojson deckt nur das Rur-Einzugsgebiet ab
   (bekannte, akzeptierte Limitierung, siehe Task-Kontext), nicht die
   gesamten 7 Kreise. Pegel, deren Gewaesser-Name in KEINEM TEZG-Polygon
   vorkommt, bekommen KEINE Zahl (upstream_data_available=False) statt einer
   irrefuehrenden 0% -- z.B. alle Pegel an Erft, Neffelbach, Nordkanal,
   Gillbach, Ahr, Schwalm etc. liegen ausserhalb der Abdeckung.

5. MENGEN-UMRECHNUNG (m3/s): mengen_je_typ.<Typ> traegt bis zu drei Felder
   max_d (m3/Tag), max_h (m3/Stunde), max_a (m3/Jahr) -- durch Sichtpruefung
   der Rohdaten (mengen_text, z.B. "Produktionsabwasser: 48 m3/d, 17520 m3/a"
   bei KME Stolberg; 17520/48 = 365, konsistent) bestaetigt: die Feld-Suffixe
   sind eindeutig, keine Einheiten-Mehrdeutigkeit pro Feld.

   Es wird NUR max_a verwendet (wie in build_catchment_stats.py) -- bewusst
   KEIN Jahres-Aequivalent aus max_d/max_h hochgerechnet. Ein erster Versuch
   genau das zu tun (*365.25 bzw. *24*365.25) wurde beim Sanity-Check wieder
   verworfen: max_d/max_h sind genehmigte SPITZEN-/MAXIMALWERTE (z.B.
   "Kuehlwasser max_h: 240" oder Niederschlagswasser-Spitzenabfluss bei
   Starkregen), keine Dauerraten. Hochgerechnet auf 24h/365 Tage ergab das
   fuer Anker Gebr. Schoeller allein >2 Mio m3/a Kuehlwasser (240 m3/h * 24 *
   365.25) -- ein Vielfaches realistischer Werte und genau die Art von
   irrefuehrender Zahl, die diese Funktion vermeiden soll. Ergebnis: Betriebe
   mit AUSSCHLIESSLICH max_d/max_h-Angaben (kein max_a) zaehlen zwar als
   "oberhalb liegender Betrieb" (upstream_betriebe_count), tragen aber nicht
   zur quantifizierten Summe bei (upstream_betriebe_mit_wert) -- eine bewusste
   Untererfassung, die der Alternative (grobe Ueberschaetzung) vorgezogen
   wird. Jahresmenge -> m3/s: / (365.25 * 24 * 3600) = / 31.557.600.

Output: pegel.geojson (Kopie im Root, wie bei den anderen build_*-Skripten)
wird um folgende Properties ergaenzt:
  - upstream_data_available (bool)
  - upstream_betriebe_count (int, Anzahl oberhalb liegender Direkteinleiter,
    unabhaengig davon ob quantifiziert)
  - upstream_betriebe_mit_wert (int, davon mit Mengenangabe)
  - upstream_abwasser_m3s (float | null)
  - upstream_mq_pct (float | null, gerundet auf 2 Nachkommastellen)
"""
import json
import os
import shutil

from shapely.geometry import shape
from shapely.strtree import STRtree

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
PEGEL_IN = os.path.join(ROOT, "pegel.geojson")
EINLEITER_IN = os.path.join(ROOT, "elwas_einleiter.geojson")
CATCHMENT_IN = os.path.join(ROOT, "rur_einzugsgebiet.geojson")
OUT_PATH = os.path.join(BASE, "pegel.geojson")
ROOT_PATH = PEGEL_IN

SECONDS_PER_YEAR = 365.25 * 24 * 3600  # 31,557,600
ADJACENCY_BUFFER_DEG = 0.0005  # ~50m, deckt Floating-Point-/Snapping-Luecken zwischen TEZG-Polygonen ab
GEZG_TOLERANCE = 1.0  # km2 Toleranz an den flood-fill/anchor Groessen-Grenzen


def parse_german_number(v):
    """'1.300' -> 1300.0 (Punkt=Tausender), '260,5' -> 260.5 (Komma=Dezimal)."""
    if v is None:
        return None
    v = str(v).strip()
    if not v:
        return None
    v = v.replace(".", "").replace(",", ".")
    try:
        return float(v)
    except ValueError:
        return None


def company_total_m3a(props):
    """Jahresmenge (m3/a) je Betrieb, ueber alle Anfallstellen-Typen summiert.
    Nur max_a (echte gemeldete Jahresmenge) -- siehe Docstring Punkt 5 fuer
    die Begruendung, warum max_d/max_h NICHT hochgerechnet werden."""
    total = 0.0
    has_value = False
    for typ_vals in (props.get("mengen_je_typ") or {}).values():
        a = parse_german_number(typ_vals.get("max_a"))
        if a is not None:
            total += a
            has_value = True
    return total, has_value


def load_tezg(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    polys = []
    for idx, feat in enumerate(data["features"]):
        p = feat["properties"]
        gezg = p.get("GEZG")
        if gezg is None:
            continue
        polys.append({
            "id": idx,
            "geom": shape(feat["geometry"]),
            "gew_name": p.get("GEW_NAME"),
            "gezg": float(gezg),
        })
    return polys


def build_adjacency(polys):
    """Nachbarschaftsgraph: Polygone gelten als angrenzend, wenn ihre um
    ADJACENCY_BUFFER_DEG gepufferten Geometrien sich schneiden (deckt kleine
    Snapping-Luecken zwischen TEZG-Polygonen ab, die reines .touches() ohne
    Puffer verpassen wuerde)."""
    buffered = [p["geom"].buffer(ADJACENCY_BUFFER_DEG) for p in polys]
    tree = STRtree(buffered)
    adjacency = {p["id"]: set() for p in polys}
    for i, geom_i in enumerate(buffered):
        candidate_idxs = tree.query(geom_i)
        for j in candidate_idxs:
            j = int(j)
            if j == i:
                continue
            if geom_i.intersects(buffered[j]):
                adjacency[polys[i]["id"]].add(polys[j]["id"])
    return adjacency


def upstream_polygon_ids(pegel_gewaesser, pegel_area_km2, polys, by_id, adjacency):
    """Liefert die Menge "oberhalb liegender" TEZG-Polygon-IDs fuer einen Pegel.

    Zwei verworfene Zwischenversuche vor dieser Loesung (siehe Git-History
    dieser Funktion), beide empirisch als zu leck erkannt:
      1) Polygon-Flood-Fill mit GLOBALER Groessen-Schwelle (Nachbar.GEZG <=
         Anker.GEZG): fast alle 131 TEZG-Polygone haben individuell ein
         kleines GEZG (kleine Bachlaeufe), sind aber alle irgendwie
         miteinander verzahnt -> die globale Schwelle bremst den Flood-Fill
         praktisch nicht, er lief bei kleinen Kopf-Pegeln (z.B. "Monschau",
         143 km2) trotzdem quer durchs ganze Netz inkl. Wurm/Vichtbach, die
         geografisch gar nicht an der Rur bei Monschau liegen.
      2) Gruppenweise (pro GEW_NAME atomar) Aufnahme bei Beruehrung: noch
         lecker, weil eine einmal aufgenommene Nebenfluss-Gruppe ausnahmslos
         alle ihre Polygone inkl. der eigenen Muendung ins Spiel bringt, die
         wiederum weitere, laengst nicht mehr "oberhalb" liegende Gruppen
         beruehrt -> transitives Durchwandern des gesamten verbundenen
         Wassernetzes.

    Stattdessen: LOKALE Monotonie pro Kante. GEZG ("Gesamteinzugsgebiet",
    kumulierte Flaeche am Auslass eines Polygons) nimmt hydrologisch
    definitionsgemaess entlang jedes echten Fliesswegs monoton flussabwaerts
    zu. Ausgehend vom Anker (das TEZG-Polygon auf dem Pegel-Fluss selbst,
    dessen GEZG am naechsten am Pegel-eigenen einzugsgebiet_km2 liegt) wird
    nur zu einem Nachbar-Polygon weitergelaufen, wenn dessen EIGENES GEZG
    nicht groesser ist als das GEZG des Polygons, von dem aus man kommt (plus
    kleiner Toleranz). Das bildet echte Wasserscheiden ab: ein unzusammen-
    haengendes, gleich grosses Nachbar-Kopfgebiet auf der anderen Seite einer
    Wasserscheide wird zwar theoretisch nicht kategorisch ausgeschlossen
    (dafuer fehlt echte Fliessrichtungs-Information), aber die Ausbreitung
    kann von dort aus nicht weiter "zurueck" in ein grossflaechigeres,
    tatsaechlich unverbundenes System eskalieren, weil jede weitere Kante
    wieder eine GEZG-Abnahme verlangt -- das begrenzt Fehlausbreitung auf
    unmittelbare Nachbar-Kopfgebiete statt auf das gesamte Netz.

    Bekannte Limitierung: in seltenen Faellen kann so ein direkt angrenzendes,
    tatsaechlich unabhaengiges (nicht zufliessendes) Kopfeinzugsgebiet mit
    aehnlich kleinem GEZG faelschlich als "oberhalb" gezaehlt werden, wenn es
    das erste TEZG-Polygon auf dem Weg direkt beruehrt. Bei nur 10 Direkt-
    einleitern im gesamten Datensatz ist die Fehlerflaeche dafuer klein; ohne
    ein echtes Fliessrichtungs-Netz (das dieses Repo nicht hat) ist das der
    Preis der Naeherung.
    """
    same_name = [p for p in polys if p["gew_name"] == pegel_gewaesser]
    if not same_name or pegel_area_km2 is None:
        return None, None

    anchor = min(same_name, key=lambda p: abs(p["gezg"] - pegel_area_km2))
    threshold = anchor["gezg"] + GEZG_TOLERANCE

    start = [p["id"] for p in same_name if p["gezg"] <= threshold]
    upstream = set(start)
    queue = list(start)
    while queue:
        cur = queue.pop()
        cur_gezg = by_id[cur]["gezg"]
        for nb_id in adjacency.get(cur, ()):
            if nb_id in upstream:
                continue
            if by_id[nb_id]["gezg"] <= cur_gezg + GEZG_TOLERANCE:
                upstream.add(nb_id)
                queue.append(nb_id)
    return upstream, anchor


def main():
    with open(PEGEL_IN, encoding="utf-8") as f:
        pegel_data = json.load(f)
    with open(EINLEITER_IN, encoding="utf-8") as f:
        einleiter_data = json.load(f)

    polys = load_tezg(CATCHMENT_IN)
    by_id = {p["id"]: p for p in polys}
    adjacency = build_adjacency(polys)

    # Nur echte Direkteinleiter (siehe Docstring Punkt 1)
    direct_companies = []
    for feat in einleiter_data["features"]:
        p = feat["properties"]
        art = p.get("einleitungsart") or ""
        if "Direkteinleitung" not in art:
            continue
        total_m3a, has_value = company_total_m3a(p)
        direct_companies.append({
            "betriebs_nr": p.get("betriebs_nr"),
            "lng": feat["geometry"]["coordinates"][0],
            "lat": feat["geometry"]["coordinates"][1],
            "anhang_codes": p.get("anhang_codes", []),
            "name": p.get("name"),
            "point": shape(feat["geometry"]),
            "total_m3a": total_m3a,
            "has_value": has_value,
        })

    # Betrieb -> TEZG-Polygon(e), per Point-in-Polygon (wie build_catchment_stats.py)
    company_polygon_ids = []  # list of (company, set(polygon_ids))
    for c in direct_companies:
        matched = set()
        for p in polys:
            if p["geom"].contains(c["point"]) or p["geom"].touches(c["point"]):
                matched.add(p["id"])
        company_polygon_ids.append((c, matched))

    stats = {
        "gew_with_tezg_coverage": 0,
        "without_coverage": 0,
    }

    out_features = []
    for feat in pegel_data["features"]:
        p = dict(feat["properties"])
        gewaesser = p.get("gewaesser")
        pegel_area = parse_german_number(p.get("einzugsgebiet_km2"))
        mq = parse_german_number(p.get("mq_m3s"))

        upstream_ids, anchor = upstream_polygon_ids(gewaesser, pegel_area, polys, by_id, adjacency)

        if upstream_ids is None:
            p["upstream_data_available"] = False
            p["upstream_betriebe_count"] = None
            p["upstream_betriebe_mit_wert"] = None
            p["upstream_betriebe"] = []
            p["upstream_abwasser_m3s"] = None
            p["upstream_mq_pct"] = None
            stats["without_coverage"] += 1
        else:
            stats["gew_with_tezg_coverage"] += 1
            betriebe_count = 0
            betriebe_mit_wert = 0
            upstream_betriebe = []
            total_m3a = 0.0
            for c, poly_ids in company_polygon_ids:
                if poly_ids & upstream_ids:
                    betriebe_count += 1
                    if c["has_value"]:
                        betriebe_mit_wert += 1
                        total_m3a += c["total_m3a"]

            abwasser_m3s = total_m3a / SECONDS_PER_YEAR
            p["upstream_data_available"] = True
            p["upstream_betriebe_count"] = betriebe_count
            p["upstream_betriebe_mit_wert"] = betriebe_mit_wert
            p["upstream_betriebe"] = upstream_betriebe
            p["upstream_abwasser_m3s"] = round(abwasser_m3s, 6)
            if mq and mq > 0 and betriebe_mit_wert > 0:
                p["upstream_mq_pct"] = round((abwasser_m3s / mq) * 100, 2)
            elif mq and mq > 0:
                p["upstream_mq_pct"] = 0.0
            else:
                p["upstream_mq_pct"] = None

        out_features.append({
            "type": "Feature",
            "geometry": feat["geometry"],
            "properties": p,
        })

    out = {"type": "FeatureCollection", "features": out_features}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        # indent=2 wie im Original build_pegel_geojson.py (haelt den Diff
        # minimal / lesbar statt kompakt wie rur_einzugsgebiet_stats.geojson)
        json.dump(out, f, indent=2, ensure_ascii=False, allow_nan=False)
    shutil.copy(OUT_PATH, ROOT_PATH)

    print(f"Pegel gesamt: {len(out_features)}")
    print(f"  mit TEZG-Abdeckung (Fluss hat >=1 Polygon in rur_einzugsgebiet.geojson): {stats['gew_with_tezg_coverage']}")
    print(f"  ohne Abdeckung (kein upstream_mq_pct, kein fabricated 0%): {stats['without_coverage']}")
    print(f"Direkteinleiter gesamt: {len(direct_companies)}, davon mit Mengenangabe: {sum(1 for c in direct_companies if c['has_value'])}")
    print(f"Output: {OUT_PATH} (+ Kopie nach {ROOT_PATH})")

    # Sanity-Ausgabe: ein paar Beispiele mit Abdeckung
    print("\nBeispiele (Pegel mit upstream_data_available=True):")
    shown = 0
    for feat in out_features:
        p = feat["properties"]
        if p.get("upstream_data_available") and p.get("upstream_betriebe_mit_wert", 0) > 0:
            print(f"  {p['name']} ({p['gewaesser']}): MQ={p.get('mq_m3s')} m3/s, "
                  f"upstream Betriebe={p['upstream_betriebe_count']} (mit Wert={p['upstream_betriebe_mit_wert']}), "
                  f"upstream Abwasser={p['upstream_abwasser_m3s']:.5f} m3/s, Y={p['upstream_mq_pct']}%")
            shown += 1
    if shown == 0:
        print("  (keine Pegel mit quantifiziertem upstream-Betrieb gefunden)")


if __name__ == "__main__":
    main()
