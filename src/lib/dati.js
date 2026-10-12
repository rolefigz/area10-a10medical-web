// Punto unico di accesso ai dati modificabili (cartella /data).
// Per cambiare orari, corsi o servizi si modificano i file JSON, non i componenti.
import centro from '../../data/centro.json';
import corsi from '../../data/corsi.json';
import servizi from '../../data/servizi.json';
import foto from '../../data/foto.json';
import { formattaOra } from './orari.js';

export { centro, corsi, servizi, foto, formattaOra };

export const ORDINE_GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

export const GIORNI_BREVI = {
  lun: 'Lun',
  mar: 'Mar',
  mer: 'Mer',
  gio: 'Gio',
  ven: 'Ven',
  sab: 'Sab',
  dom: 'Dom',
};

/** [["09:00","13:30"],["16:30","21:00"]] -> "9:00-13:30 e 16:30-21:00" */
export function fasceTesto(fasce) {
  if (!fasce?.length) return 'Chiuso';
  return fasce.map(([a, b]) => `${formattaOra(a)}-${formattaOra(b)}`).join(' e ');
}

/**
 * Raggruppa i giorni consecutivi con lo stesso orario:
 * [{ giorni: 'Lun-Ven', fasce: [...] }, { giorni: 'Sab', fasce: [...] }, { giorni: 'Dom', fasce: [] }]
 */
export function orariRaggruppati(settimana) {
  const gruppi = [];
  for (const g of ORDINE_GIORNI) {
    const fasce = settimana[g] ?? [];
    const firma = JSON.stringify(fasce);
    const ultimo = gruppi[gruppi.length - 1];
    if (ultimo && ultimo.firma === firma) {
      ultimo.fine = g;
    } else {
      gruppi.push({ inizio: g, fine: g, firma, fasce });
    }
  }
  return gruppi.map(({ inizio, fine, fasce }) => ({
    giorni: inizio === fine ? GIORNI_BREVI[inizio] : `${GIORNI_BREVI[inizio]}-${GIORNI_BREVI[fine]}`,
    giorniEstesi:
      inizio === fine
        ? corsi.giorni[inizio]
        : `Da ${corsi.giorni[inizio].toLowerCase()} a ${corsi.giorni[fine].toLowerCase()}`,
    fasce,
  }));
}

/** Corsi ordinati per giorno e ora */
export function corsiOrdinati() {
  return [...corsi.corsi].sort(
    (a, b) =>
      ORDINE_GIORNI.indexOf(a.giorno) - ORDINE_GIORNI.indexOf(b.giorno) || a.inizio.localeCompare(b.inizio),
  );
}

/** Giorni che hanno almeno un corso, in ordine */
export function giorniConCorsi() {
  return ORDINE_GIORNI.filter((g) => corsi.corsi.some((c) => c.giorno === g));
}

/** Indirizzo su una riga */
export function indirizzoTesto(ind) {
  return `${ind.via}, ${ind.cap} ${ind.citta} (${ind.provincia})`;
}
