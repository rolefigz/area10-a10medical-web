// Calcolo dello stato "Aperto ora / Chiuso" a partire dagli orari reali.
// L'ora è sempre quella di Roma (Europe/Rome), qualunque sia il fuso del visitatore.
// Modulo puro, senza dipendenze: usato nel browser e nei test (tests/unit/orari.test.js).

export const GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

export const NOMI_GIORNI = {
  lun: 'lunedì',
  mar: 'martedì',
  mer: 'mercoledì',
  gio: 'giovedì',
  ven: 'venerdì',
  sab: 'sabato',
  dom: 'domenica',
};

const DA_INGLESE = { Sun: 'dom', Mon: 'lun', Tue: 'mar', Wed: 'mer', Thu: 'gio', Fri: 'ven', Sat: 'sab' };

/** "09:00" -> 540 */
export function aMinuti(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** "09:00" -> "9:00" (forma usata nei testi) */
export function formattaOra(hhmm) {
  return hhmm.replace(/^0(\d)/, '$1');
}

/** Giorno, minuti dalla mezzanotte e data (AAAA-MM-GG) nell'ora locale del fuso indicato. */
export function oraLocale(data = new Date(), fuso = 'Europe/Rome') {
  const parti = new Intl.DateTimeFormat('en-GB', {
    timeZone: fuso,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data);
  const v = Object.fromEntries(parti.map((p) => [p.type, p.value]));
  return {
    giorno: DA_INGLESE[v.weekday],
    minuti: Number(v.hour) * 60 + Number(v.minute),
    data: `${v.year}-${v.month}-${v.day}`,
  };
}

function aggiungiGiorni(iso, n) {
  const [a, m, g] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g + n)).toISOString().slice(0, 10);
}

/**
 * Stato di apertura.
 * @param {Record<string, [string, string][]>} settimana  es. { lun: [["09:00","13:30"],["16:30","21:00"]], dom: [] }
 * @param {Date} [data]
 * @param {{ chiusure?: string[], fuso?: string }} [opzioni]  chiusure straordinarie in formato AAAA-MM-GG
 * @returns {{ aperto: true, fino: string } | { aperto: false, prossima: { giorno: string, ora: string, traGiorni: number } | null }}
 */
export function statoApertura(settimana, data = new Date(), { chiusure = [], fuso = 'Europe/Rome' } = {}) {
  const ora = oraLocale(data, fuso);
  const fasceOggi = chiusure.includes(ora.data) ? [] : (settimana[ora.giorno] ?? []);

  for (const [inizio, fine] of fasceOggi) {
    if (ora.minuti >= aMinuti(inizio) && ora.minuti < aMinuti(fine)) {
      return { aperto: true, fino: fine };
    }
  }

  // Prossima apertura: più tardi oggi oppure nei prossimi giorni (max due settimane, per le ferie).
  const indiceOggi = GIORNI.indexOf(ora.giorno);
  for (let k = 0; k < 15; k++) {
    if (chiusure.includes(aggiungiGiorni(ora.data, k))) continue;
    const giorno = GIORNI[(indiceOggi + k) % 7];
    for (const [inizio] of settimana[giorno] ?? []) {
      if (k === 0 && aMinuti(inizio) <= ora.minuti) continue;
      return { aperto: false, prossima: { giorno, ora: inizio, traGiorni: k } };
    }
  }
  return { aperto: false, prossima: null };
}

/** Testi in italiano per lo stato calcolato. */
export function testoStato(stato) {
  if (stato.aperto) {
    return { etichetta: 'Aperto ora', dettaglio: `Chiude alle ${formattaOra(stato.fino)}` };
  }
  if (!stato.prossima) return { etichetta: 'Chiuso', dettaglio: '' };
  const { giorno, ora, traGiorni } = stato.prossima;
  const quando = traGiorni === 0 ? 'oggi' : traGiorni === 1 ? 'domani' : NOMI_GIORNI[giorno];
  return { etichetta: 'Chiuso', dettaglio: `Riapre ${quando} alle ${formattaOra(ora)}` };
}
