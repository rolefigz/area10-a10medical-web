// Schermate a 390, 768 e 1440 px, tema chiaro e scuro, delle pagine principali.
// Le immagini finiscono in tests/screenshots/ (non versionate) per la revisione visiva.
// Per ogni combinazione verifica anche: niente scroll orizzontale, nessun errore in console.
import { test, expect } from '@playwright/test';

const pagine = [
  ['home', ''],
  ['area10', 'area10/'],
  ['medical', 'medical/'],
  ['corsi', 'area10/corsi/'],
  ['contatti', 'contatti/'],
];
const larghezze = [390, 768, 1440];
const temi = ['light', 'dark'];

for (const [nome, percorso] of pagine) {
  for (const larghezza of larghezze) {
    for (const tema of temi) {
      test(`${nome} ${larghezza}px ${tema}`, async ({ browser }) => {
        const contesto = await browser.newContext({
          viewport: { width: larghezza, height: larghezza < 600 ? 844 : 1000 },
          colorScheme: tema,
          reducedMotion: 'reduce',
          locale: 'it-IT',
          timezoneId: 'Europe/Rome',
        });
        const pagina = await contesto.newPage();
        const errori = [];
        pagina.on('console', (m) => m.type() === 'error' && errori.push(m.text()));
        pagina.on('pageerror', (e) => errori.push(e.message));

        await pagina.goto(percorso, { waitUntil: 'networkidle' });
        await pagina.evaluate(() => document.fonts.ready);
        expect(await pagina.evaluate(() => document.documentElement.dataset.theme)).toBe(tema);

        const eccesso = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(eccesso, 'scroll orizzontale').toBeLessThanOrEqual(0);

        await pagina.screenshot({ path: `tests/screenshots/${nome}-${larghezza}-${tema}.png`, fullPage: true });
        expect(errori, 'errori in console').toEqual([]);
        await contesto.close();
      });
    }
  }
}
