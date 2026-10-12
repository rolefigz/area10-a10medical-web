// Elenca le foto e i loghi presenti o mancanti rispetto a data/foto.json.
//   npm run foto
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = join(dirname(fileURLToPath(import.meta.url)), '..');
const dati = JSON.parse(readFileSync(join(radice, 'data', 'foto.json'), 'utf8'));
const ESTENSIONI = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];

function trova(id) {
  const cartella = join(radice, 'assets', dirname(id).startsWith('brand') ? '' : 'photos', dirname(id));
  if (!existsSync(cartella)) return null;
  const nome = basename(id).toLowerCase();
  return readdirSync(cartella).find(
    (f) => ESTENSIONI.includes(extname(f).toLowerCase()) && basename(f, extname(f)).toLowerCase() === nome,
  );
}

let mancanti = 0;
const riga = (ok, id, testo) => console.log(`${ok ? '  [ok]     ' : '  [manca]  '}${id.padEnd(32)} ${testo}`);

console.log('\nFOTO (assets/photos/...)');
for (const f of dati.foto) {
  const file = trova(f.id);
  if (!file) mancanti++;
  riga(Boolean(file), f.id, file ? file : `${f.formato} - ${f.dove}`);
}
console.log('\nLOGHI (assets/brand/...)');
for (const l of dati.loghi) {
  const file = trova(l.id);
  if (!file) mancanti++;
  riga(Boolean(file), l.id, file ? file : l.nota);
}
const totale = dati.foto.length + dati.loghi.length;
console.log(`\n${totale - mancanti}/${totale} presenti. Dopo aver aggiunto i file: npm run build.\n`);
