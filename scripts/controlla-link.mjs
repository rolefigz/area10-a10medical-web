// Controllo dei collegamenti in dist/: ogni link interno (href/src/srcset) deve puntare a un file esistente,
// le ancore (#id) devono esistere nella pagina di destinazione, tel: e mailto: devono essere ben formati.
// Con --esterni controlla anche i link esterni con una richiesta di rete.
//   npm run build && node scripts/controlla-link.mjs [--esterni]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(radice, 'dist');
const config = readFileSync(join(radice, 'astro.config.mjs'), 'utf8');
const base = (process.env.BASE_PATH || config.match(/BASE_PATH \|\| '([^']+)'/)?.[1] || '/').replace(/\/?$/, '/');
const esterni = process.argv.includes('--esterni');

function* pagineHtml(cartella) {
  for (const voce of readdirSync(cartella)) {
    const percorso = join(cartella, voce);
    if (statSync(percorso).isDirectory()) yield* pagineHtml(percorso);
    else if (voce.endsWith('.html')) yield percorso;
  }
}

const idPerPagina = new Map();
const idDi = (file) => {
  if (!idPerPagina.has(file)) {
    const html = readFileSync(file, 'utf8');
    idPerPagina.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idPerPagina.get(file);
};

/** Converte un percorso del sito nel file di dist corrispondente */
function fileDi(percorso) {
  if (!percorso.startsWith(base)) return null;
  let rel = decodeURIComponent(percorso.slice(base.length));
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  const file = join(dist, rel);
  return existsSync(file) ? file : null;
}

const errori = [];
const linkEsterni = new Set();
let controllati = 0;

for (const file of pagineHtml(dist)) {
  const html = readFileSync(file, 'utf8');
  const pagina = relative(dist, file).replaceAll('\\', '/');
  const valori = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
  ];
  for (const valore of valori) {
    controllati++;
    if (valore.startsWith('tel:')) {
      if (!/^tel:\+39\d{8,11}$/.test(valore)) errori.push(`${pagina}: tel non valido ${valore}`);
      continue;
    }
    if (valore.startsWith('mailto:')) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(valore)) errori.push(`${pagina}: mailto non valido ${valore}`);
      continue;
    }
    if (/^https?:\/\//.test(valore)) {
      linkEsterni.add(valore.replaceAll('&amp;', '&'));
      continue;
    }
    if (valore.startsWith('data:')) continue;
    const [percorso, ancora] = valore.replaceAll('&amp;', '&').split('#');
    if (!percorso) {
      if (ancora && !idDi(file).has(ancora)) errori.push(`${pagina}: ancora #${ancora} inesistente`);
      continue;
    }
    const senzaQuery = percorso.split('?')[0];
    const destinazione = fileDi(senzaQuery);
    if (!destinazione) {
      errori.push(`${pagina}: link rotto ${valore}`);
      continue;
    }
    if (ancora && destinazione.endsWith('.html') && !idDi(destinazione).has(ancora)) {
      errori.push(`${pagina}: ancora #${ancora} inesistente in ${senzaQuery}`);
    }
  }
}

if (esterni) {
  for (const link of linkEsterni) {
    try {
      const r = await fetch(link, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (verifica link)' } });
      if (r.status >= 400 && r.status !== 429 && r.status !== 403) errori.push(`esterno ${r.status}: ${link}`);
      else console.log(`  ${r.status}  ${link}`);
    } catch (e) {
      errori.push(`esterno non raggiungibile: ${link} (${e.message})`);
    }
  }
}

console.log(`Link controllati: ${controllati} (${linkEsterni.size} esterni distinti${esterni ? ', verificati' : ''}).`);
if (errori.length) {
  console.error(`\n${errori.length} problemi:\n- ${[...new Set(errori)].join('\n- ')}`);
  process.exit(1);
}
console.log('Nessun link rotto.');
