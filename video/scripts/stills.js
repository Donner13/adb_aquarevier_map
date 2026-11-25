// Rendert fuenf Kontroll-Stills (je Szene eines) nach out/stills/.
// Nutzung: BROWSER=/pfad/zu/chrome node scripts/stills.js   (BROWSER optional)
const {execFileSync} = require('child_process');
const frames = [330, 1100, 2050, 3500, 4500];
const extra = process.env.BROWSER ? ['--browser-executable=' + process.env.BROWSER, '--chrome-mode=chrome-for-testing'] : [];
for (const f of frames) {
  execFileSync('npx', ['remotion', 'still', 'src/index.ts', 'Status', `out/stills/frame_${f}.png`, `--frame=${f}`, ...extra], {stdio: 'inherit'});
}
