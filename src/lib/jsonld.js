// Dati strutturati (JSON-LD, schema.org) per la SEO locale.
// Area10 -> ExerciseGym/HealthClub, A10 Medical -> MedicalClinic/Physiotherapy.
// Solo dati reali: niente prezzi, recensioni od orari non confermati.
import { centro, servizi } from './dati.js';
import { urlAssoluto } from './url.js';

const GIORNI_SCHEMA = {
  lun: 'Monday',
  mar: 'Tuesday',
  mer: 'Wednesday',
  gio: 'Thursday',
  ven: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
};

function indirizzo(ind) {
  return {
    '@type': 'PostalAddress',
    streetAddress: ind.via,
    postalCode: ind.cap,
    addressLocality: ind.citta,
    addressRegion: ind.provincia,
    addressCountry: ind.paese,
  };
}

/** Raggruppa le fasce orarie identiche: una specifica per fascia, con l'elenco dei giorni. */
function orariSchema(settimana) {
  const specifiche = [];
  for (const [giorno, fasce] of Object.entries(settimana)) {
    for (const [opens, closes] of fasce) {
      let s = specifiche.find((x) => x.opens === opens && x.closes === closes);
      if (!s) {
        s = { '@type': 'OpeningHoursSpecification', dayOfWeek: [], opens, closes };
        specifiche.push(s);
      }
      s.dayOfWeek.push(GIORNI_SCHEMA[giorno]);
    }
  }
  return specifiche;
}

/** Elenco servizi senza prezzi (non pubblicati dal centro) */
function catalogo(nome, voci) {
  return {
    '@type': 'OfferCatalog',
    name: nome,
    itemListElement: voci.map((v) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: v } })),
  };
}

export function idPalestra(site) {
  return `${urlAssoluto('/area10/', site)}#palestra`;
}
export function idClinica(site) {
  return `${urlAssoluto('/medical/', site)}#clinica`;
}

/** Grafo principale: sito + le due attività. Va in ogni pagina. */
export function grafoBase(site) {
  const a = centro.area10;
  const m = centro.medical;
  const home = urlAssoluto('/', site);

  const palestra = {
    '@type': ['ExerciseGym', 'HealthClub'],
    '@id': idPalestra(site),
    name: a.nome,
    url: urlAssoluto('/area10/', site),
    image: urlAssoluto('/og/area10.png', site),
    telephone: a.telefono,
    address: indirizzo(a.indirizzo),
    geo: { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng },
    openingHoursSpecification: orariSchema(a.orari.sala.settimana),
    sameAs: [a.instagram],
    hasMap: centro.mappe.google,
    hasOfferCatalog: catalogo('Servizi Area10', servizi.area10.map((s) => s.nome)),
  };

  const clinica = {
    '@type': ['MedicalClinic', 'Physiotherapy'],
    '@id': idClinica(site),
    name: m.nome,
    url: urlAssoluto('/medical/', site),
    image: urlAssoluto('/og/medical.png', site),
    telephone: m.telefono,
    email: m.email,
    address: indirizzo(m.indirizzo),
    // TODO: coordinate esatte del civico 8 (accanto ad Area10) e orari di segreteria
    medicalSpecialty: ['Physiotherapy', 'Musculoskeletal', 'DietNutrition'],
    hasOfferCatalog: catalogo('Servizi A10 Medical', [
      ...servizi.medical.map((s) => s.nome),
      servizi.visiteSportive.nome,
    ]),
    sameAs: [m.instagram],
  };

  return [
    {
      '@type': 'WebSite',
      '@id': `${home}#sito`,
      url: home,
      name: 'Area10 Fitness Club e A10 Medical',
      inLanguage: 'it-IT',
      publisher: { '@id': idPalestra(site) },
    },
    palestra,
    clinica,
  ];
}

/** Briciole di pane: [{ nome: 'Home', url: '/' }, { nome: 'Area10', url: '/area10/' }] */
export function briciole(voci, site) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: voci.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: v.nome,
      item: urlAssoluto(v.url, site),
    })),
  };
}

/** Articolo divulgativo di "Lo sai che..." */
export function articolo({ titolo, descrizione, data, percorso }, site) {
  return {
    '@type': 'Article',
    headline: titolo,
    description: descrizione,
    datePublished: data,
    dateModified: data,
    inLanguage: 'it-IT',
    mainEntityOfPage: urlAssoluto(percorso, site),
    image: urlAssoluto('/og/lo-sai-che.png', site),
    author: { '@id': idClinica(site) },
    publisher: { '@id': idClinica(site) },
  };
}

/** Domande frequenti */
export function faq(domande) {
  return {
    '@type': 'FAQPage',
    mainEntity: domande.map((d) => ({
      '@type': 'Question',
      name: d.domanda,
      acceptedAnswer: { '@type': 'Answer', text: d.risposta },
    })),
  };
}

/** Avvolge i nodi in un unico documento JSON-LD */
export function documento(nodi) {
  return { '@context': 'https://schema.org', '@graph': nodi.flat().filter(Boolean) };
}
