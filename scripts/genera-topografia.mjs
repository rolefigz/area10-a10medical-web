// Genera la texture "curve di livello" (linee topografiche) usata nelle sezioni Area10,
// ispirata ai poster della stagione 2026/27. Il risultato è un SVG statico e deterministico:
//   node scripts/genera-topografia.mjs  ->  src/assets/textures/topografia.svg
// Tecnica: rumore "value noise" a più ottave + marching squares + unione dei segmenti in polilinee.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const qui = dirname(fileURLToPath(import.meta.url));
const destinazione = join(qui, '..', 'src', 'assets', 'textures', 'topografia.svg');

const W = 96; // celle in orizzontale
const H = 60; // celle in verticale
const SCALA = 10; // unità SVG per cella -> viewBox 960x600
const LIVELLI = 13;
const SEME = 2627; // stagione 26/27 :)

// Generatore pseudo-casuale con seme (mulberry32), così il disegno non cambia a ogni build.
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const caso = mulberry32(SEME);

// Griglia di valori casuali per ogni ottava, interpolata in modo morbido (smoothstep).
function creaRumore(celle) {
  const g = Array.from({ length: celle + 2 }, () => Array.from({ length: celle + 2 }, caso));
  const liscia = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = liscia(x - xi);
    const ty = liscia(y - yi);
    const a = g[yi][xi] + (g[yi][xi + 1] - g[yi][xi]) * tx;
    const b = g[yi + 1][xi] + (g[yi + 1][xi + 1] - g[yi + 1][xi]) * tx;
    return a + (b - a) * ty;
  };
}
const ottave = [
  { rumore: creaRumore(6), freq: 4.2, peso: 1 },
  { rumore: creaRumore(12), freq: 9, peso: 0.42 },
  { rumore: creaRumore(24), freq: 19, peso: 0.16 },
];

// Campo di altitudine: una "collina" principale spostata a destra rende il disegno meno uniforme.
const campo = [];
for (let j = 0; j <= H; j++) {
  const riga = [];
  for (let i = 0; i <= W; i++) {
    const u = i / W;
    const v = j / H;
    let z = 0;
    for (const o of ottave) z += o.rumore(u * o.freq, v * o.freq) * o.peso;
    const dx = u - 0.68;
    const dy = v - 0.42;
    z += Math.exp(-(dx * dx * 5 + dy * dy * 7)) * 0.9;
    riga.push(z);
  }
  campo.push(riga);
}

let min = Infinity;
let max = -Infinity;
for (const riga of campo) for (const z of riga) { min = Math.min(min, z); max = Math.max(max, z); }

// Marching squares: per ogni soglia produce segmenti tra i lati delle celle.
const chiave = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
function segmentiPerSoglia(s) {
  const segmenti = [];
  const interp = (x1, y1, z1, x2, y2, z2) => {
    const t = (s - z1) / (z2 - z1);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const a = campo[j][i];
      const b = campo[j][i + 1];
      const c = campo[j + 1][i + 1];
      const d = campo[j + 1][i];
      const caso4 = (a > s ? 8 : 0) | (b > s ? 4 : 0) | (c > s ? 2 : 0) | (d > s ? 1 : 0);
      if (caso4 === 0 || caso4 === 15) continue;
      const alto = interp(i, j, a, i + 1, j, b);
      const destra = interp(i + 1, j, b, i + 1, j + 1, c);
      const basso = interp(i, j + 1, d, i + 1, j + 1, c);
      const sinistra = interp(i, j, a, i, j + 1, d);
      const mappa = {
        1: [[sinistra, basso]], 2: [[basso, destra]], 3: [[sinistra, destra]], 4: [[alto, destra]],
        5: [[sinistra, alto], [basso, destra]], 6: [[alto, basso]], 7: [[sinistra, alto]],
        8: [[sinistra, alto]], 9: [[alto, basso]], 10: [[sinistra, basso], [alto, destra]],
        11: [[alto, destra]], 12: [[sinistra, destra]], 13: [[basso, destra]], 14: [[sinistra, basso]],
      };
      segmenti.push(...mappa[caso4]);
    }
  }
  return segmenti;
}

// Unisce i segmenti che condividono un estremo in polilinee continue (file molto più leggero).
function unisci(segmenti) {
  const perPunto = new Map();
  segmenti.forEach((seg, idx) => {
    for (const p of seg) {
      const k = chiave(p);
      if (!perPunto.has(k)) perPunto.set(k, []);
      perPunto.get(k).push(idx);
    }
  });
  const usato = new Uint8Array(segmenti.length);
  const linee = [];
  for (let s = 0; s < segmenti.length; s++) {
    if (usato[s]) continue;
    usato[s] = 1;
    const linea = [...segmenti[s]];
    for (const verso of ['fine', 'inizio']) {
      for (;;) {
        const estremo = verso === 'fine' ? linea[linea.length - 1] : linea[0];
        const vicini = (perPunto.get(chiave(estremo)) || []).filter((idx) => !usato[idx]);
        if (!vicini.length) break;
        const idx = vicini[0];
        usato[idx] = 1;
        const [p, q] = segmenti[idx];
        const altro = chiave(p) === chiave(estremo) ? q : p;
        if (verso === 'fine') linea.push(altro); else linea.unshift(altro);
      }
    }
    linee.push(linea);
  }
  return linee;
}

// Ammorbidisce le linee (Chaikin) e le scrive come path con coordinate relative.
function chaikin(pts) {
  if (pts.length < 3) return pts;
  const chiusa = chiave(pts[0]) === chiave(pts[pts.length - 1]);
  const out = chiusa ? [] : [pts[0]];
  for (let k = 0; k < pts.length - 1; k++) {
    const [x1, y1] = pts[k];
    const [x2, y2] = pts[k + 1];
    out.push([0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2], [0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2]);
  }
  if (chiusa) out.push(out[0]); else out.push(pts[pts.length - 1]);
  return out;
}
function comePath(pts) {
  const r = (n) => Math.round(n * SCALA);
  let [px, py] = [r(pts[0][0]), r(pts[0][1])];
  let d = `M${px} ${py}`;
  for (let k = 1; k < pts.length; k++) {
    const x = r(pts[k][0]);
    const y = r(pts[k][1]);
    if (x === px && y === py) continue;
    d += `l${x - px} ${y - py}`;
    px = x;
    py = y;
  }
  return d;
}

const percorsi = [];
for (let l = 1; l <= LIVELLI; l++) {
  const soglia = min + ((max - min) * l) / (LIVELLI + 1);
  for (const linea of unisci(segmentiPerSoglia(soglia))) {
    if (linea.length < 4) continue; // scarta i frammenti minuscoli
    const xs = linea.map((p) => p[0]);
    const ys = linea.map((p) => p[1]);
    if (Math.max(...xs) - Math.min(...xs) < 2.5 && Math.max(...ys) - Math.min(...ys) < 2.5) continue;
    percorsi.push(comePath(chaikin(linea)));
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W * SCALA} ${H * SCALA}" preserveAspectRatio="xMidYMid slice"><path fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" d="${percorsi.join('')}"/></svg>\n`;
mkdirSync(dirname(destinazione), { recursive: true });
writeFileSync(destinazione, svg);
console.log(`Topografia generata: ${percorsi.length} linee, ${(svg.length / 1024).toFixed(1)} KB -> ${destinazione}`);
