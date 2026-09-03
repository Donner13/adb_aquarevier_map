const chroma = require('chroma-js');

// Using the background colors for badges
const bgSurfaceLight = "#ffffff";
const bgSurfaceDark = "#111827";

const badges = {
    'behorde': { bg: 'rgba(244, 63, 94, 0.15)', fg: '#D55E00' },
    'forschung': { bg: 'rgba(59, 130, 246, 0.15)', fg: '#0072B2' },
    'gebietskorperschaft': { bg: 'rgba(251, 191, 36, 0.15)', fg: '#E69F00' },
    'gewerbe': { bg: 'rgba(168, 85, 247, 0.15)', fg: '#CC79A7' },
    'landwirtschaft': { bg: 'rgba(16, 185, 129, 0.15)', fg: '#009E73' },
    'netzwerk': { bg: 'rgba(255, 0, 127, 0.15)', fg: '#56B4E9' },
    'entsorger': { bg: 'rgba(255, 115, 0, 0.15)', fg: '#F0E442' },
    'sonstige': { bg: 'rgba(139, 92, 246, 0.15)', fg: '#595959' }
};

function blend(fg, bg, alpha) {
    const fgc = chroma(fg);
    const bgc = chroma(bg);
    return chroma.mix(bgc, fgc, alpha, 'rgb');
}

Object.keys(badges).forEach(k => {
    // Light mode blend
    const bgLight = blend(chroma(badges[k].bg).hex(), bgSurfaceLight, 0.15);
    const contrastLight = chroma.contrast(badges[k].fg, bgLight);

    const bgDark = blend(chroma(badges[k].bg).hex(), bgSurfaceDark, 0.15);
    const contrastDark = chroma.contrast(badges[k].fg, bgDark);

    console.log(`${k} Light mode: ${contrastLight.toFixed(2)} | Dark mode: ${contrastDark.toFixed(2)}`);
});
