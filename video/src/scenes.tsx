import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {Appear, Card, Count, Scene} from './ui';

const KREISE = ['Heinsberg', 'Mönchengladbach', 'Euskirchen', 'Städteregion Aachen', 'Düren', 'Rhein-Erft-Kreis', 'Rhein-Kreis Neuss'];

export const SceneA: React.FC<{len: number}> = ({len}) => (
  <Scene len={len} kicker="Statusbericht November 2026" title="AquaRevier – Akteurskarte Rheinisches Revier">
    <Appear delay={20} style={{fontSize: 38, color: C.muted, maxWidth: 1400, lineHeight: 1.4}}>
      Interaktive Leaflet-Karte mit Akteuren, Fachdaten und Gewässern im Auftrag von Florian.
    </Appear>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 50, maxWidth: 1600}}>
      {KREISE.map((k, i) => (
        <Appear key={k} delay={60 + i * 25}><Card style={{fontSize: 34, borderLeft: `8px solid ${C.accent}`}}>{k}</Card></Appear>
      ))}
    </div>
    <Appear delay={280} style={{fontSize: 44, marginTop: 50, color: C.accent}}>7 Kreise im Untersuchungsgebiet</Appear>
  </Scene>
);

const LAYERS: {n: number; label: string; note?: string}[] = [
  {n: 101, label: 'Industrieeinleiter', note: 'ELWAS'},
  {n: 60, label: 'Kläranlagen', note: 'ELWAS'},
  {n: 4410, label: 'Grundwassermessstellen', note: 'ELWAS-Rohbestand; im Kartenlayer 3.746'},
  {n: 46, label: 'Pegel', note: 'ELWAS'},
  {n: 131, label: 'Einzugsgebiet-Statistik', note: 'Abschnitte im Rur-Einzugsgebiet'},
];

export const SceneB: React.FC<{len: number}> = ({len}) => (
  <Scene len={len} kicker="Live-Layer" title="Was die Karte heute zeigt">
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26}}>
      {LAYERS.map((l, i) => (
        <Appear key={l.label} delay={20 + i * 40}>
          <Card style={{minHeight: 250}}>
            <div style={{fontSize: 96, fontWeight: 800, color: C.accent}}><Count to={l.n} delay={20 + i * 40} /></div>
            <div style={{fontSize: 34, marginTop: 6}}>{l.label}</div>
            <div style={{fontSize: 24, color: C.muted, marginTop: 8}}>{l.note}</div>
          </Card>
        </Appear>
      ))}
    </div>
    <Appear delay={300} style={{fontSize: 30, color: C.muted, marginTop: 36}}>
      Zahlen aus den Daten im Repository, Stand 25.11.2026.
    </Appear>
  </Scene>
);

const NOTEN: {k: string; n: number}[] = [
  {k: 'Performance', n: 3}, {k: 'Barrierefreiheit', n: 3}, {k: 'Mobile Ansicht', n: 3},
  {k: 'Konsolenfehler', n: 3}, {k: 'Links', n: 3}, {k: 'Tests', n: 2},
  {k: 'CI / Deploy', n: 2}, {k: 'Sicherheit', n: 2}, {k: 'Datenqualität', n: 3},
];

const Bar: React.FC<{k: string; n: number; i: number}> = ({k, n, i}) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [20 + i * 12, 50 + i * 12], [0, n / 5 * 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const col = n <= 2 ? C.bad : C.warn;
  return (
    <div style={{display: 'flex', alignItems: 'center', marginBottom: 26, fontSize: 30}}>
      <div style={{width: 260}}>{k}</div>
      <div style={{width: 520, height: 26, background: C.card, borderRadius: 13}}>
        <div style={{width: `${w}%`, height: '100%', background: col, borderRadius: 13}} />
      </div>
      <div style={{marginLeft: 16, color: C.muted}}>{n} / 5</div>
    </div>
  );
};

export const SceneC: React.FC<{len: number}> = ({len}) => (
  <Scene len={len} kicker="Webseiten-Bewertung" title="Ehrliche Noten, echte Zahlen">
    <div style={{display: 'flex', gap: 60}}>
      <div>{NOTEN.map((x, i) => <Bar key={x.k} {...x} i={i} />)}</div>
      <div style={{fontSize: 32, lineHeight: 1.9}}>
        {[
          ['Lighthouse Performance', '62 Desktop · 54 mobil'],
          ['Datenmenge pro Aufruf', 'ca. 13 MB'],
          ['Elemente ohne Namen', '135'],
          ['Kontakt-E-Mails im Repo', '345'],
          ['Tests (gleiche 78)', 'main 6 → Branch 51 grün'],
          ['npm audit', '0 Schwachstellen'],
        ].map(([a, b], i) => (
          <Appear key={a} delay={150 + i * 40}>
            <div><span style={{color: C.muted}}>{a}: </span><b>{b}</b></div>
          </Appear>
        ))}
      </div>
    </div>
    <Appear delay={470} style={{fontSize: 30, marginTop: 24, color: C.good}}>
      Repariert: interne Seite (SyntaxError), Build-Skript, Deploy-Workflow, dompurify.
    </Appear>
    <Appear delay={520} style={{fontSize: 26, marginTop: 10, color: C.muted}}>
      Live-Seite aus der Testumgebung nicht erreichbar; Live-Befunde stammen aus dem Systemtest vom 13.11.
    </Appear>
  </Scene>
);

const STEPS = [
  {t: 'Daten', d: 'Abfluss Wurm / Rur'},
  {t: 'Baselines', d: 'u. a. Ridge-Regression'},
  {t: 'DWD-Wetter', d: 'Regen als Eingang'},
  {t: 'LSTM', d: 'Prognose 1 / 3 / 7 Tage'},
];

export const SceneD: React.FC<{len: number}> = ({len}) => (
  <Scene len={len} kicker="Prognosemodell (außerhalb des Repos)" title="Abfluss Wurm / Rur – 1, 3 und 7 Tage">
    <div style={{display: 'flex', gap: 22, alignItems: 'stretch'}}>
      {STEPS.map((s, i) => (
        <Appear key={s.t} delay={20 + i * 30}>
          <Card style={{width: 380, height: 150}}>
            <div style={{fontSize: 40, fontWeight: 700, color: C.accent}}>{s.t}</div>
            <div style={{fontSize: 28, color: C.muted, marginTop: 8}}>{s.d}</div>
          </Card>
        </Appear>
      ))}
    </div>
    <Appear delay={200} style={{marginTop: 44}}>
      <Card style={{borderLeft: `8px solid ${C.warn}`, fontSize: 36, lineHeight: 1.45}}>
        <b>Befund:</b> Das LSTM schlägt die Ridge-Baseline mit Oberlieger-Abfluss bisher nirgends.
        Der Gewinn kommt vom Oberlieger-Abfluss, nicht vom Regen.
      </Card>
    </Appear>
    <Appear delay={330} style={{fontSize: 34, marginTop: 34, lineHeight: 1.5}}>
      Protokoll eingefroren (Gate 1 / 2a). Die Rechenläufe ziehen auf den Simulationsrechner um.
    </Appear>
  </Scene>
);

const NEXT = [
  {t: 'Sicherheit & Deploy', items: ['Kontakte aus Repo und Verlauf nehmen', 'Zugangsdaten rotieren', 'Deploy-CI grün bekommen, dann freigeben']},
  {t: 'Prognoseläufe', items: ['Läufe auf dem Simulationsrechner', 'Baselines gegen LSTM sauber vergleichen', 'Oberlieger-Abfluss gegen Regen trennen']},
  {t: 'Cockpit-Ideen', items: ['Pegel-Ampel', 'Zeitschieber', 'Gewässergüte-Daten nachliefern']},
];

export const SceneE: React.FC<{len: number}> = ({len}) => (
  <Scene len={len} kicker="Ausblick" title="Nächste Schritte">
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28}}>
      {NEXT.map((c, i) => (
        <Appear key={c.t} delay={20 + i * 40}>
          <Card style={{height: 440}}>
            <div style={{fontSize: 42, fontWeight: 700, color: C.accent, marginBottom: 20}}>{c.t}</div>
            {c.items.map((it) => <div key={it} style={{fontSize: 30, marginBottom: 16, lineHeight: 1.35}}>• {it}</div>)}
          </Card>
        </Appear>
      ))}
    </div>
    <Appear delay={200} style={{fontSize: 30, color: C.muted, marginTop: 30}}>
      Push auf main und Deploy bleiben deine Freigabe.
    </Appear>
  </Scene>
);
