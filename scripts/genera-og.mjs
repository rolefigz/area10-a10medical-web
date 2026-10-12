// Genera le immagini social (Open Graph 1200x630) e l'icona per iOS (180x180) con Playwright.
//   npm run og   ->  public/og/*.png  e  public/apple-touch-icon.png
// Le grafiche riprendono l'identità del sito: nero/oro con curve di livello per Area10,
// bianco/turchese con carta millimetrata per A10 Medical.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const qui = dirname(fileURLToPath(import.meta.url));
const radice = join(qui, '..');
const daB64 = (percorso, tipo) => `data:${tipo};base64,${readFileSync(percorso).toString('base64')}`;

const fontDisplay = daB64(
  join(radice, 'node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2'),
  'font/woff2',
);
const fontSans = daB64(join(radice, 'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2'), 'font/woff2');
const topo = daB64(join(radice, 'src/assets/textures/topografia.svg'), 'image/svg+xml');

const stileBase = `
  @font-face { font-family: Display; src: url(${fontDisplay}) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: Sans; src: url(${fontSans}) format('woff2'); font-weight: 300 900; }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: Sans; }
  .tela { position: relative; width: 1200px; height: 630px; overflow: hidden; }
  .nero { background: #0f0e0c; color: #ecebe5; }
  .bianco { background: #fafdfd; color: #132322; }
  .topo::after { content: ''; position: absolute; inset: 0; background: #d8a838; opacity: .2;
    -webkit-mask: url(${topo}) center / cover no-repeat; mask: url(${topo}) center / cover no-repeat; }
  .mm { background-image:
      linear-gradient(to right, rgb(6 112 104 / .16) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(6 112 104 / .16) 1px, transparent 1px),
      linear-gradient(to right, rgb(6 112 104 / .06) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(6 112 104 / .06) 1px, transparent 1px);
    background-size: 40px 40px, 40px 40px, 8px 8px, 8px 8px; }
  .display { font-family: Display; font-weight: 900; text-transform: uppercase; line-height: .86; }
  .z { position: relative; z-index: 2; }
  .piede { position: absolute; left: 64px; right: 64px; bottom: 44px; z-index: 3; display: flex;
    justify-content: space-between; align-items: center; font-size: 22px; font-weight: 600; }
  .marchio { display: flex; align-items: center; gap: 14px; }
  .marchio b { font-family: Display; font-size: 34px; font-weight: 900; text-transform: uppercase; letter-spacing: .02em; }
  .marchio i { width: 3px; height: 34px; background: linear-gradient(#d8a838, #0fa89e); transform: skewX(-18deg); }
  .marchio span { font-weight: 700; font-size: 24px; }
`;

const scheletro = (colore) => {
  const P = {
    collo: [120, 80], spSx: [84, 98], spDx: [156, 98], gomSx: [70, 160], gomDx: [170, 160], polSx: [62, 218],
    polDx: [178, 218], dorso: [120, 150], lombi: [120, 190], bacino: [120, 214], ancaSx: [100, 218],
    ancaDx: [140, 218], ginSx: [95, 310], ginDx: [145, 310], cavSx: [92, 398], cavDx: [148, 398],
    piedeSx: [76, 412], piedeDx: [164, 412],
  };
  const ossa = [['collo', 'spSx'], ['collo', 'spDx'], ['spSx', 'gomSx'], ['gomSx', 'polSx'], ['spDx', 'gomDx'],
    ['gomDx', 'polDx'], ['collo', 'dorso'], ['dorso', 'lombi'], ['lombi', 'bacino'], ['bacino', 'ancaSx'],
    ['bacino', 'ancaDx'], ['ancaSx', 'ginSx'], ['ginSx', 'cavSx'], ['cavSx', 'piedeSx'], ['ancaDx', 'ginDx'],
    ['ginDx', 'cavDx'], ['cavDx', 'piedeDx']];
  const linee = ossa.map(([a, b]) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`).join('');
  const giunti = Object.values(P).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5"/>`).join('');
  return `<svg viewBox="0 0 240 440" width="256" height="470"><g fill="none" stroke="${colore}" stroke-width="3" stroke-linecap="round">
    <circle cx="120" cy="44" r="22"/>${linee}</g><g fill="#fafdfd" stroke="${colore}" stroke-width="2.5">${giunti}</g>
    <circle cx="145" cy="310" r="17" fill="rgb(15 168 158 / .25)"/><circle cx="145" cy="310" r="9" fill="${colore}"/></svg>`;
};

const marchio = `<div class="marchio"><b>Area10</b><i></i><span>A10 Medical</span></div>`;

const immagini = {
  home: `
    <div class="tela bianco mm">
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,58% 0,44% 100%,0 100%)" class="nero topo"></div>
      <div class="display z" style="position:absolute;left:64px;top:110px;font-size:168px;color:#ecebe5">Allenati.</div>
      <div class="z" style="position:absolute;left:720px;top:250px;font-size:96px;font-weight:650;letter-spacing:-.045em;color:#132322">Recupera.</div>
      <div class="z" style="position:absolute;left:64px;top:330px;font-size:44px;font-weight:800;letter-spacing:-.03em;color:#ecebe5;max-width:520px;line-height:1.05">Resta in forma.</div>
      <div class="piede"><span style="color:#ecebe5">${marchio.replace('class="marchio"', 'class="marchio" style="color:#ecebe5"')}</span><span>Via Formaleoni, Podenzano (PC)</span></div>
    </div>`,
  area10: `
    <div class="tela nero topo">
      <div class="display" style="position:absolute;right:-30px;bottom:-60px;font-size:400px;color:rgb(216 168 56 / .12)">Area10</div>
      <div class="z" style="position:absolute;left:64px;top:96px">
        <div class="display" style="font-size:150px">Area10<br>Fitness Club</div>
        <p style="margin-top:28px;font-size:34px;color:#a9a59a;max-width:760px;line-height:1.3">Palestra, personal training, corsi e HYROX a Podenzano</p>
      </div>
      <div class="piede"><span style="color:#d8a838;font-weight:800">Prova gratuita</span><span style="color:#a9a59a">Via Formaleoni 6, Podenzano (PC)</span></div>
    </div>`,
  hyrox: `
    <div class="tela nero topo">
      <div class="z" style="position:absolute;left:64px;top:70px">
        <div class="display" style="font-size:70px">Siamo</div>
        <div class="display" style="font-size:250px;color:#d8a838">HYROX</div>
        <div class="display" style="font-size:96px">Training Club</div>
      </div>
      <div class="piede"><span style="color:#a9a59a">Corso ufficiale di preparazione alla gara</span><span style="color:#ecebe5;font-family:Display;font-weight:900;font-size:34px;text-transform:uppercase">Area10, Podenzano</span></div>
    </div>`,
  corsi: `
    <div class="tela nero topo">
      <div class="display" style="position:absolute;right:-20px;bottom:-70px;font-size:420px;color:rgb(216 168 56 / .12)">Corsi</div>
      <div class="z" style="position:absolute;left:64px;top:96px">
        <div class="display" style="font-size:170px">Corsi 2026/27</div>
        <p style="margin-top:30px;font-size:32px;color:#a9a59a;max-width:900px;line-height:1.35">Pilates, funzionale, yoga, ginnastica leggera, spinning, fitboxe e danza per bambini</p>
      </div>
      <div class="piede"><span style="color:#d8a838;font-weight:800">Area10 Fitness Club</span><span style="color:#a9a59a">Podenzano e San Polo</span></div>
    </div>`,
  medical: `
    <div class="tela bianco mm">
      <div style="position:absolute;right:120px;top:30px">${scheletro('#067068')}</div>
      <div class="z" style="position:absolute;left:64px;top:120px;max-width:700px">
        <p style="font-size:30px;font-weight:700;color:#067068">A10 Medical</p>
        <div style="margin-top:16px;font-size:84px;font-weight:650;letter-spacing:-.04em;line-height:1.02">Torna in forma, nel modo giusto.</div>
        <p style="margin-top:26px;font-size:30px;color:#43585a;line-height:1.35">Fisioterapia, ortopedia, nutrizione e visite sportive a Podenzano</p>
      </div>
      <div class="piede"><span style="color:#067068;font-weight:800">335 5776832</span><span style="color:#43585a">Via Formaleoni 8, Podenzano (PC)</span></div>
    </div>`,
  visite: `
    <div class="tela bianco mm">
      <div class="z" style="position:absolute;left:64px;top:120px;max-width:1000px">
        <p style="font-size:30px;font-weight:700;color:#067068">A10 Medical</p>
        <div style="margin-top:16px;font-size:104px;font-weight:650;letter-spacing:-.045em;line-height:1">Visite medico-sportive</div>
        <p style="margin-top:28px;font-size:34px;color:#43585a">Idoneità agonistica in struttura, con il Dott. Giancarlo Sportelli</p>
      </div>
      <div class="piede"><span style="color:#067068;font-weight:800">Prenota: 335 5776832</span><span style="color:#43585a">Podenzano (PC)</span></div>
    </div>`,
  'lo-sai-che': `
    <div class="tela mm" style="background-color:#e6f3f2;color:#132322">
      <div class="z" style="position:absolute;left:64px;top:100px;max-width:1060px">
        <div style="font-size:120px;font-weight:650;letter-spacing:-.05em">Lo sai che...</div>
        <div style="display:flex;align-items:center;gap:28px;margin-top:40px">
          <p style="font-size:46px;font-weight:650;text-decoration:line-through;text-decoration-color:#067068;text-decoration-thickness:4px;color:#43585a">“Se non ho dolore, non ho problemi.”</p>
          <span style="padding:6px 16px;border:4px solid #067068;border-radius:8px;color:#067068;font-weight:900;font-size:30px;letter-spacing:.08em;transform:rotate(-8deg)">FALSO</span>
        </div>
      </div>
      <div class="piede"><span style="color:#067068;font-weight:800">Il team di A10 Medical</span><span style="color:#43585a">Fisioterapia e prevenzione</span></div>
    </div>`,
  contatti: `
    <div class="tela bianco mm">
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,58% 0,44% 100%,0 100%)" class="nero topo"></div>
      <div class="z" style="position:absolute;left:64px;top:100px;color:#ecebe5">
        <div class="display" style="font-size:120px">Vieni a<br>trovarci</div>
        <p style="margin-top:24px;font-size:30px;color:#a9a59a">Via Formaleoni 6 e 8, Podenzano</p>
      </div>
      <div class="z" style="position:absolute;left:760px;top:190px;display:grid;gap:30px">
        <div><p style="font-family:Display;font-weight:900;font-size:34px;text-transform:uppercase">Area10</p><p style="font-size:44px;font-weight:800">338 1042067</p></div>
        <div><p style="font-weight:700;font-size:28px;color:#067068">A10 Medical</p><p style="font-size:44px;font-weight:800">335 5776832</p></div>
      </div>
    </div>`,
};

const icona = `
  <div style="width:180px;height:180px;position:relative;overflow:hidden;background:#0fa89e">
    <div style="position:absolute;inset:0;background:#0f0e0c;clip-path:polygon(0 0,66% 0,34% 100%,0 100%)"></div>
    <div style="position:absolute;left:50%;top:0;width:10px;height:200px;background:#d8a838;transform:translateX(-50%) rotate(10deg);transform-origin:top"></div>
  </div>`;

const destinazione = join(radice, 'public', 'og');
mkdirSync(destinazione, { recursive: true });
const browser = await chromium.launch();
const pagina = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [nome, html] of Object.entries(immagini)) {
  await pagina.setContent(`<!doctype html><html lang="it"><head><style>${stileBase}</style></head><body>${html}</body></html>`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(destinazione, `${nome}.png`) });
  console.log(`og/${nome}.png`);
}
const p2 = await browser.newPage({ viewport: { width: 180, height: 180 } });
await p2.setContent(`<!doctype html><html><head><style>*{margin:0}</style></head><body>${icona}</body></html>`);
await p2.screenshot({ path: join(radice, 'public', 'apple-touch-icon.png') });
console.log('apple-touch-icon.png');
await browser.close();
