// Indicatore "Aperto ora / Chiuso" con l'orologio del browser bloccato su tre momenti diversi.
// Le date sono in UTC; il calcolo avviene sempre nel fuso di Roma (ottobre 2026 = UTC+2).
import { test, expect } from '@playwright/test';

const casi = [
  {
    nome: 'feriale (martedì 10:00)',
    data: '2026-10-13T08:00:00Z',
    etichetta: 'Aperto ora',
    dettaglio: 'Chiude alle 13:30',
    oggi: 'mar',
  },
  {
    nome: 'sabato pomeriggio (15:00)',
    data: '2026-10-17T13:00:00Z',
    etichetta: 'Chiuso',
    dettaglio: 'Riapre lunedì alle 9:00',
    oggi: null,
  },
  {
    nome: 'domenica (11:00)',
    data: '2026-10-18T09:00:00Z',
    etichetta: 'Chiuso',
    dettaglio: 'Riapre domani alle 9:00',
    oggi: null,
  },
];

for (const caso of casi) {
  test(`stato apertura: ${caso.nome}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(caso.data));
    await page.goto('area10/');
    const stato = page.locator('[data-stato]').first();
    await expect(stato.locator('[data-stato-etichetta]')).toHaveText(caso.etichetta);
    await expect(stato.locator('[data-stato-dettaglio]')).toHaveText(caso.dettaglio);
    await expect(stato).toHaveAttribute('data-aperto', String(caso.etichetta === 'Aperto ora'));
  });

  test(`home, giorno evidenziato nella settimana dei corsi: ${caso.nome}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(caso.data));
    await page.goto('');
    if (caso.oggi) {
      await expect(page.locator(`[data-settimana] [data-giorno="${caso.oggi}"]`)).toHaveClass(/giorno--oggi/);
    } else {
      // sabato e domenica non hanno corsi: nessuna colonna evidenziata
      await expect(page.locator('[data-settimana] .giorno--oggi')).toHaveCount(0);
    }
  });
}
