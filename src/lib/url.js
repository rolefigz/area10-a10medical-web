// Costruisce i link interni tenendo conto della sottocartella di GitHub Pages
// (import.meta.env.BASE_URL, es. "/area10-a10medical-web/").

const BASE = import.meta.env.BASE_URL;

/** Percorso interno con la base corretta: url('/area10/') -> '/area10-a10medical-web/area10/' */
export function url(percorso = '/') {
  if (/^(https?:|mailto:|tel:|#)/.test(percorso)) return percorso;
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  return base + percorso.replace(/^\//, '');
}

/** URL assoluto (per canonical, Open Graph, JSON-LD) */
export function urlAssoluto(percorso, site) {
  return new URL(url(percorso), site).href;
}

/** true se `percorso` è la pagina corrente o una sua sottopagina */
export function eAttivo(corrente, percorso, esatto = false) {
  const target = url(percorso);
  return esatto ? corrente === target : corrente.startsWith(target);
}
