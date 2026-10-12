// Test dell'indicatore "Aperto ora / Chiuso" (node --test tests/unit/).
// Le date sono espresse in UTC: ottobre 2026 = ora legale (UTC+2), dicembre = ora solare (UTC+1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { statoApertura, testoStato, oraLocale } from '../../src/lib/orari.js';

const centro = JSON.parse(readFileSync(new URL('../../data/centro.json', import.meta.url), 'utf8'));
const sala = centro.area10.orari.sala.settimana;
const personal = centro.area10.orari.personal.settimana;

const stato = (iso, settimana = sala, opzioni) => testoStato(statoApertura(settimana, new Date(iso), opzioni));

test('feriale mattina (martedì 10:00 a Roma): aperto fino alle 13:30', () => {
  assert.deepEqual(stato('2026-10-13T08:00:00Z'), { etichetta: 'Aperto ora', dettaglio: 'Chiude alle 13:30' });
});

test('feriale, pausa pranzo (martedì 14:00): chiuso, riapre oggi alle 16:30', () => {
  assert.deepEqual(stato('2026-10-13T12:00:00Z'), { etichetta: 'Chiuso', dettaglio: 'Riapre oggi alle 16:30' });
});

test('feriale sera dopo la chiusura (martedì 21:30): riapre domani alle 9:00', () => {
  assert.deepEqual(stato('2026-10-13T19:30:00Z'), { etichetta: 'Chiuso', dettaglio: 'Riapre domani alle 9:00' });
});

test('sabato mattina (10:00): aperto fino alle 12:30', () => {
  assert.deepEqual(stato('2026-10-17T08:00:00Z'), { etichetta: 'Aperto ora', dettaglio: 'Chiude alle 12:30' });
});

test('sabato pomeriggio (15:00): chiuso, riapre lunedì alle 9:00', () => {
  assert.deepEqual(stato('2026-10-17T13:00:00Z'), { etichetta: 'Chiuso', dettaglio: 'Riapre lunedì alle 9:00' });
});

test('domenica (11:00): chiuso, riapre domani alle 9:00', () => {
  assert.deepEqual(stato('2026-10-18T09:00:00Z'), { etichetta: 'Chiuso', dettaglio: 'Riapre domani alle 9:00' });
});

test("limiti dell'orario: alle 9:00 è aperto, alle 13:30 è chiuso", () => {
  assert.equal(statoApertura(sala, new Date('2026-10-14T07:00:00Z')).aperto, true);
  assert.equal(statoApertura(sala, new Date('2026-10-14T11:30:00Z')).aperto, false);
});

test('ora solare (dicembre, martedì 9:30 a Roma = 8:30 UTC): aperto', () => {
  assert.equal(oraLocale(new Date('2026-12-01T08:30:00Z')).minuti, 9 * 60 + 30);
  assert.equal(statoApertura(sala, new Date('2026-12-01T08:30:00Z')).aperto, true);
});

test('chiusura straordinaria (Natale): chiuso e riapre il giorno dopo', () => {
  const opzioni = { chiusure: ['2026-12-25'] };
  assert.deepEqual(stato('2026-12-25T09:00:00Z', sala, opzioni), {
    etichetta: 'Chiuso',
    dettaglio: 'Riapre domani alle 9:00',
  });
});

test('personal training: lunedì alle 8:30 è aperto anche se la sala apre alle 9:00', () => {
  assert.equal(statoApertura(personal, new Date('2026-10-12T06:30:00Z')).aperto, true);
  assert.equal(statoApertura(sala, new Date('2026-10-12T06:30:00Z')).aperto, false);
});
