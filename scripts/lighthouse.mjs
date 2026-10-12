// Audit Lighthouse (profilo mobile) delle pagine principali.
//   npm run lighthouse                      -> avvia "astro preview" e controlla il build locale
//   npm run lighthouse -- https://sito/     -> controlla un sito già pubblicato
// Nota: in modalità demo (PUBLIC_DEMO=true) la categoria SEO perde punti per il meta "noindex":
// è voluto. Per misurare la SEO reale: PUBLIC_DEMO=false npm run build, poi npm run lighthouse.
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
const cartella = join(radice, 'lighthouse');
mkdirSync(cartella, { recursive: true });

const PORTA = 4323;
let base = process.argv[2];
let server;
if (!base) {
  base = `http://127.0.0.1:${PORTA}/area10-a10medical-web/`;
  server = spawn(`npx astro preview --port ${PORTA} --host 127.0.0.1 --force`, { cwd: radice, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {
      /* il server non è ancora pronto */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}
if (!base.endsWith('/')) base += '/';

const pagine = [
  ['home', ''],
  ['area10', 'area10/'],
  ['hyrox', 'area10/hyrox/'],
  ['corsi', 'area10/corsi/'],
  ['medical', 'medical/'],
  ['visite', 'medical/visite-sportive/'],
  ['contatti', 'contatti/'],
];

const righe = [];
try {
  for (const [nome, percorso] of pagine) {
    const uscita = join(cartella, `${nome}.json`);
    execSync(
      `npx -y lighthouse@13.5.0 "${base + percorso}" --output=json --output-path="${uscita}" ` +
        '--only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new" --quiet',
      { cwd: radice, stdio: 'inherit' },
    );
    const r = JSON.parse(readFileSync(uscita, 'utf8'));
    const p = (id) => Math.round(r.categories[id].score * 100);
    const m = (id) => r.audits[id]?.displayValue ?? '-';
    righe.push({
      pagina: nome,
      performance: p('performance'),
      accessibilita: p('accessibility'),
      'best practices': p('best-practices'),
      seo: p('seo'),
      LCP: m('largest-contentful-paint'),
      CLS: m('cumulative-layout-shift'),
      TBT: m('total-blocking-time'),
    });
  }
} finally {
  server?.kill();
  if (server) execSync('npx astro preview stop', { cwd: radice, stdio: 'ignore' });
}
console.table(righe);
const minimo = Math.min(...righe.flatMap((r) => [r.performance, r.accessibilita, r['best practices'], r.seo]));
console.log(`Punteggio minimo: ${minimo}. Report completi in lighthouse/*.json`);
