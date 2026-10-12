// Validazione locale dei dati strutturati (JSON-LD) in tutte le pagine di dist/.
// Controlla che il JSON sia valido e che i nodi principali abbiano i campi richiesti da Google
// per LocalBusiness, Article, BreadcrumbList e FAQPage. Esce con errore se qualcosa non va.
//   npm run build && node scripts/valida-jsonld.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

function* pagineHtml(cartella) {
  for (const voce of readdirSync(cartella)) {
    const percorso = join(cartella, voce);
    if (statSync(percorso).isDirectory()) yield* pagineHtml(percorso);
    else if (voce.endsWith('.html')) yield percorso;
  }
}

const tipi = (n) => [].concat(n['@type'] ?? []);
const errori = [];
const conteggio = {};

function controllaNodo(nodo, pagina) {
  const t = tipi(nodo);
  t.forEach((x) => (conteggio[x] = (conteggio[x] ?? 0) + 1));
  const manca = (campo) => errori.push(`${pagina}: ${t.join('/')} senza "${campo}"`);
  const attivita = ['ExerciseGym', 'HealthClub', 'MedicalClinic', 'Physiotherapy', 'LocalBusiness'];
  if (t.some((x) => attivita.includes(x))) {
    for (const campo of ['name', 'address', 'telephone', 'url', '@id']) if (!nodo[campo]) manca(campo);
    const a = nodo.address ?? {};
    for (const campo of ['streetAddress', 'postalCode', 'addressLocality', 'addressCountry']) if (!a[campo]) manca(`address.${campo}`);
    if (nodo.geo && (typeof nodo.geo.latitude !== 'number' || typeof nodo.geo.longitude !== 'number')) manca('geo numerico');
    for (const o of nodo.openingHoursSpecification ?? []) {
      if (!/^\d\d:\d\d$/.test(o.opens) || !/^\d\d:\d\d$/.test(o.closes) || !o.dayOfWeek?.length) manca('openingHoursSpecification valido');
    }
    if (!/^\+39\d{8,11}$/.test(nodo.telephone ?? '')) manca('telephone in formato +39');
  }
  if (t.includes('Article')) for (const campo of ['headline', 'datePublished', 'author', 'image']) if (!nodo[campo]) manca(campo);
  if (t.includes('BreadcrumbList')) {
    (nodo.itemListElement ?? []).forEach((el, i) => {
      if (el.position !== i + 1 || !el.name || !/^https:\/\//.test(el.item)) manca(`itemListElement[${i}] valido`);
    });
  }
  if (t.includes('FAQPage')) {
    for (const q of nodo.mainEntity ?? []) if (!q.name || !q.acceptedAnswer?.text) manca('domanda/risposta');
  }
}

let pagine = 0;
for (const file of pagineHtml(dist)) {
  const html = readFileSync(file, 'utf8');
  const pagina = relative(dist, file).replaceAll('\\', '/');
  const blocchi = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocchi.length) {
    errori.push(`${pagina}: nessun JSON-LD`);
    continue;
  }
  pagine++;
  for (const [, json] of blocchi) {
    let dati;
    try {
      dati = JSON.parse(json);
    } catch (e) {
      errori.push(`${pagina}: JSON non valido (${e.message})`);
      continue;
    }
    if (dati['@context'] !== 'https://schema.org') errori.push(`${pagina}: @context mancante`);
    for (const nodo of dati['@graph'] ?? [dati]) controllaNodo(nodo, pagina);
  }
}

console.log(`JSON-LD controllato in ${pagine} pagine.`);
console.log('Nodi trovati:', Object.entries(conteggio).map(([k, v]) => `${k} ${v}`).join(', '));
if (errori.length) {
  console.error(`\n${errori.length} problemi:\n- ${errori.join('\n- ')}`);
  process.exit(1);
}
console.log('Nessun problema.');
