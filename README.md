# Area10 Fitness Club + A10 Medical: proposta di sito web

Proposta di design realizzata da **RoleFigz** per Area10 Fitness Club e A10 Medical (via Formaleoni 6 e 8, Podenzano, PC).
**È un sito dimostrativo**: non è il sito ufficiale del centro e, finché il cliente non lo approva, non viene indicizzato dai motori di ricerca.

- Sito pubblicato: https://rolefigz.github.io/area10-a10medical-web/
- Codice: https://github.com/rolefigz/area10-a10medical-web

Un unico sito con due identità: **Area10** (palestra: nero, bianco osso, oro, titoli condensati Big Shoulders) e **A10 Medical** (poliambulatorio: bianco, turchese, carbone, Figtree). Il messaggio che le unisce: *allenamento, riabilitazione e prevenzione sotto lo stesso tetto*.

---

## Indice

1. [Come aggiornare un orario (in 3 righe)](#come-aggiornare-un-orario-in-3-righe)
2. [Cosa contiene il sito](#cosa-contiene-il-sito)
3. [Modificare testi, orari, corsi e foto](#modificare-testi-orari-corsi-e-foto)
4. [Lavorare in locale](#lavorare-in-locale)
5. [Pubblicazione su GitHub Pages](#pubblicazione-su-github-pages)
6. [Modulo contatti (Web3Forms)](#modulo-contatti-web3forms)
7. [Modalità demo e noindex](#modalità-demo-e-noindex)
8. [Piano B: Cloudflare Pages o Netlify](#piano-b-cloudflare-pages-o-netlify)
9. [Dominio proprio](#dominio-proprio)
10. [Verifiche di qualità](#verifiche-di-qualità)
11. [Contenuti, diritti e cose da confermare](#contenuti-diritti-e-cose-da-confermare)
12. [Aspetti legali: checklist prima della pubblicazione ufficiale](#aspetti-legali-checklist-prima-della-pubblicazione-ufficiale)
13. [Struttura del progetto](#struttura-del-progetto)

---

## Come aggiornare un orario (in 3 righe)

1. Apri `data/centro.json` (su GitHub: apri il file e premi la matita "Edit").
2. Cambia gli orari in `area10.orari.sala.settimana` (es. `"sab": [["09:00", "12:30"]]`; giorno chiuso = `[]`).
3. Salva con "Commit changes": in un paio di minuti il sito si aggiorna da solo, compreso l'indicatore "Aperto ora".

I corsi si cambiano allo stesso modo in `data/corsi.json`.

---

## Cosa contiene il sito

| Pagina | Indirizzo | Contenuto |
|---|---|---|
| Home | `/` | Hero diviso tra le due aree, percorso allenamento → fisioterapia → ritorno, servizi, HYROX, orari e corsi della settimana, "Lo sai che...", persone, galleria, contatti |
| Area10 | `/area10/` | Servizi della palestra, attività extra, orari con "Aperto ora" |
| HYROX | `/area10/hyrox/` | HYROX Training Club: formato della gara, corso, FAQ |
| Corsi | `/area10/corsi/` | Calendario 2026/27 filtrabile per giorno, disciplina e sede (tabella su desktop, schede su mobile) |
| A10 Medical | `/medical/` | Servizi, mappa del corpo "Dove senti fastidio?", ponte verso Area10 |
| Visite sportive | `/medical/visite-sportive/` | Visite medico-sportive con il Dott. Giancarlo Sportelli |
| Lo sai che... | `/lo-sai-che/` | 8 articoli divulgativi (falsi miti e approfondimenti) |
| Contatti | `/contatti/` | Recapiti, orari, mappa su richiesta, modulo prova gratuita |
| Legali | `/privacy/`, `/cookie/` | Modelli da completare (nessun dato legale inventato) |
| 404 | `/404.html` | "Fuori campo." |

Funzioni principali:
- **Aperto ora / Chiuso** calcolato con l'orario reale nel fuso di Roma (anche per chi visita dall'estero).
- **Tema chiaro e scuro** (segue il sistema, con pulsante per cambiarlo).
- **Barra fissa su smartphone** con "Chiama" e "Come arrivare" (Google Maps con le coordinate reali).
- **SEO locale**: titoli e descrizioni per pagina, Open Graph con immagini dedicate, JSON-LD (`ExerciseGym`/`HealthClub`, `MedicalClinic`/`Physiotherapy`, `BreadcrumbList`, `Article`, `FAQPage`), sitemap e canonical.
- **Privacy by design**: font ospitati sul sito, nessun cookie, mappa di terze parti caricata solo su richiesta.

---

## Modificare testi, orari, corsi e foto

Tutti i dati modificabili sono in `data/` e `content/`: non serve toccare i componenti.

| Cosa | Dove |
|---|---|
| Indirizzi, telefoni, email, Instagram, orari, chiusure straordinarie | `data/centro.json` |
| Calendario corsi, discipline, sedi (Podenzano / San Polo) | `data/corsi.json` |
| Servizi delle due aree (nomi, descrizioni, icone) | `data/servizi.json` |
| Formato della gara HYROX | `data/hyrox.json` |
| Elenco delle foto previste e relativi testi alternativi | `data/foto.json` |
| Articoli "Lo sai che..." | `content/lo-sai-che/*.md` (un file per articolo) |

**Chiusure straordinarie** (festività, ferie): aggiungi le date in `area10.chiusure`, es. `["2026-12-25", "2026-12-26"]`. L'indicatore "Aperto ora" ne tiene conto.

**Nuovo articolo**: copia un file in `content/lo-sai-che/`, cambia nome del file (diventa l'indirizzo) e i campi in testa (`titolo`, `descrizione`, `data`, `tipo`: `mito` o `approfondimento`).

**Icone**: set [Tabler](https://tabler.io/icons) (licenza MIT); in `data/servizi.json` basta scrivere il nome dell'icona.

### Foto e loghi

Finché le foto non ci sono, il sito mostra segnaposto eleganti con la scritta "Foto reale in arrivo" (niente foto di repertorio che sembrino il centro).

1. Salva ogni foto in `assets/photos/` con il nome indicato in `data/foto.json`, ad esempio `assets/photos/area10/sala-pesi.jpg` o `assets/photos/medical/fisioterapia.jpg` (vanno bene .jpg, .png, .webp, .avif).
2. Lancia `npm run foto` per vedere quali mancano ancora.
3. Al build successivo le foto compaiono da sole, **ottimizzate automaticamente** in AVIF e WebP a 480/960/1600 px con `srcset`, dimensioni fisse (niente salti di layout) e caricamento lazy; la prima foto di ogni pagina viene caricata con priorità alta.

Servono circa 12 foto di Area10 (sala, pesi, funzionale, pilates, spinning, HYROX, staff, ingresso) e 9 di A10 Medical (ambulatorio, lettino, fisioterapia, palestra fisioterapica, visita sportiva, nutrizione, facciata, ritratto del Dott. Sportelli). Meglio foto originali ad alta risoluzione, in orizzontale dove indicato.

**Loghi**: salva i file originali come `assets/brand/area10-logo.svg` e `assets/brand/a10-medical-logo.svg` (o .png con sfondo trasparente). Il sito li usa così come sono al posto dei nomi in testo. I loghi non vanno ridisegnati né imitati.

> Per le persone riconoscibili nelle foto serve la liberatoria (autorizzazione all'uso dell'immagine) da parte del cliente.

---

## Lavorare in locale

Requisiti: Node.js 22.12 o superiore (consigliato Node 24 LTS).

```bash
npm install          # dipendenze
npm run dev          # sito in sviluppo su http://localhost:4321/area10-a10medical-web/
npm run build        # build statico in dist/
npm run preview      # anteprima del build
```

Tecnologie: [Astro 7](https://astro.build) (sito statico multipagina, zero JavaScript di framework), CSS moderno con variabili (nessun framework CSS), font Big Shoulders Display e Figtree self-hosted tramite la Fonts API di Astro, immagini ottimizzate con sharp.

---

## Pubblicazione su GitHub Pages

Ogni push sul ramo `main` avvia il workflow `.github/workflows/deploy.yml`, che:
1. installa le dipendenze ed esegue i test unitari;
2. compila il sito;
3. valida HTML, JSON-LD e link interni;
4. pubblica `dist/` su GitHub Pages.

Pages è configurato con *Settings → Pages → Source: GitHub Actions*. Lo stato dei deploy è nella scheda **Actions** del repository.

Variabili facoltative (*Settings → Secrets and variables → Actions → Variables*):

| Variabile | Valore | A cosa serve |
|---|---|---|
| `PUBLIC_DEMO` | `true` (predefinito) / `false` | `true` aggiunge `noindex` a ogni pagina |
| `PUBLIC_WEB3FORMS_KEY` | chiave di Web3Forms | attiva l'invio del modulo contatti |
| `SITE_URL` | es. `https://www.area10podenzano.it` | solo con un dominio proprio |
| `BASE_PATH` | es. `/` | solo con un dominio proprio |

Dopo aver cambiato una variabile: *Actions → Pubblica su GitHub Pages → Run workflow*.

---

## Modulo contatti (Web3Forms)

Il sito è statico, quindi il modulo usa [Web3Forms](https://web3forms.com): gratuito fino a 250 invii al mese, senza backend, con campo esca anti-spam (honeypot) già incluso.

1. Vai su web3forms.com e crea una chiave inserendo l'**email del cliente** che riceverà le richieste.
2. Su GitHub aggiungi la variabile `PUBLIC_WEB3FORMS_KEY` con quella chiave (vedi tabella sopra) e rilancia il workflow.
3. Prova il modulo dalla pagina Contatti: la richiesta arriva via email con oggetto "Richiesta dal sito: ...".

La chiave di Web3Forms è pubblica per natura (compare nel codice della pagina), ma resta comunque fuori dal repository. **Senza chiave** il modulo funziona in modalità dimostrativa: valida i campi e, all'invio, invita a telefonare.

---

## Modalità demo e noindex

Finché è una proposta, ogni pagina contiene `<meta name="robots" content="noindex, nofollow">` e il piè di pagina riporta "Proposta di design realizzata da RoleFigz. Sito dimostrativo, non è il sito ufficiale del centro."

Quando il cliente approva:
1. imposta la variabile `PUBLIC_DEMO` a `false` (il noindex sparisce);
2. aggiorna o rimuovi il credito nel piè di pagina (`src/components/Footer.astro`);
3. completa privacy e cookie con i dati reali.

---

## Piano B: Cloudflare Pages o Netlify

Entrambi gratuiti per un sito come questo.

**Cloudflare Pages**: *Workers & Pages → Create → Pages → Connect to Git* → scegli il repository. Build command `npm run build`, output `dist`. Variabili d'ambiente: `NODE_VERSION=24`, `BASE_PATH=/`, `SITE_URL=https://<progetto>.pages.dev` (o il dominio), più `PUBLIC_DEMO` e `PUBLIC_WEB3FORMS_KEY` se servono.

**Netlify**: *Add new site → Import an existing project* → repository. Build command `npm run build`, publish directory `dist`, stesse variabili (`BASE_PATH=/`, `SITE_URL=https://<sito>.netlify.app`).

---

## Dominio proprio

Con GitHub Pages:
1. crea il file `public/CNAME` con dentro solo il dominio (es. `www.area10podenzano.it`);
2. nel pannello DNS del dominio aggiungi un record `CNAME` da `www` a `rolefigz.github.io` (per il dominio senza www, i record `A` di GitHub Pages indicati nella documentazione ufficiale);
3. su GitHub: *Settings → Pages → Custom domain* e attiva "Enforce HTTPS";
4. imposta le variabili `SITE_URL=https://www.area10podenzano.it` e `BASE_PATH=/`, poi rilancia il workflow.

Con un dominio proprio diventa efficace anche `robots.txt` (su GitHub Pages in sottocartella i motori leggono solo quello alla radice del dominio).

---

## Verifiche di qualità

```bash
npm test             # test unitari dell'indicatore "Aperto ora" (feriale, sabato pomeriggio, domenica, Natale, ora solare...)
npm run build
npm run valida       # HTML valido (html-validate), JSON-LD, link interni, tel: e mailto:
npm run test:e2e     # Playwright: schermate 390/768/1440 px chiaro e scuro, filtri corsi, "Aperto ora" con orologio simulato,
                     # accessibilità axe-core (WCAG 2.2 AA) su 11 pagine in entrambi i temi, menu, modulo, mappa, 404
npm run lighthouse   # Lighthouse mobile su 7 pagine (avvia da solo l'anteprima)
```

Risultati al 12 ottobre 2026 (Lighthouse mobile, build con `PUBLIC_DEMO=false`): **Performance 99-100, Accessibilità 100, Best Practices 100, SEO 100** su tutte le pagine controllate; LCP 1,4-1,8 s, CLS 0, TBT 0 ms. In modalità demo la SEO scende di proposito per via del `noindex`.

Accessibilità: contrasto AA verificato per ogni coppia testo/sfondo nei due temi, focus visibile, navigazione da tastiera, `lang="it"`, landmark, link "Vai al contenuto", aree di tocco di almeno 44 px, rispetto di `prefers-reduced-motion`.

Configurazione di html-validate in `.htmlvalidate.mjs`: le poche regole disattivate sono spiegate nel file (ad esempio `role="list"` voluto per VoiceOver).

---

## Contenuti, diritti e cose da confermare

**Di chi è cosa**
- Nomi, marchi, loghi, foto e dati di contatto sono di Area10 Fitness Club e A10 Medical. I dati vengono dai loro profili Instagram pubblici (11-12 ottobre 2026).
- I testi del sito e gli articoli "Lo sai che..." sono originali, scritti per questa proposta prendendo spunto dai temi trattati dal centro sui social. Brevi claim del centro riutilizzati: "Siamo diventati training club HYROX" e "HYROX, da dove si comincia" (da confermare con il cliente). Il claim "Torna in forma, senza rischi" è stato volutamente attenuato in "Torna in forma, nel modo giusto" per evitare promesse di risultato.
- HYROX è un marchio dei rispettivi titolari: il nome è usato solo come testo, come fa il centro; nessun logo HYROX finché non si verifica la loro guida all'uso del marchio.
- Font Big Shoulders Display e Figtree: SIL Open Font License. Icone Tabler: licenza MIT. Texture "curve di livello": generata con `scripts/genera-topografia.mjs`.

**Da confermare con il cliente** (nel codice sono segnati con `TODO`)
- Prezzi, abbonamenti e condizioni della prova gratuita (oggi non mostrati).
- Nomi e foto di allenatori, istruttori, fisioterapisti, ortopedico e nutrizionista (l'unico nome pubblicato è il Dott. Giancarlo Sportelli).
- WhatsApp ed email di Area10 (oggi solo telefono).
- Orari di segreteria di A10 Medical e coordinate esatte del civico 8.
- Ragione sociale, P.IVA e dati societari di entrambe le attività (campi `datiLegali` in `data/centro.json`), dati per privacy e cookie.
- Calendario corsi 2026/27 e indirizzo della sede di San Polo.
- Se A10 Medical offre osteopatia (citata nei post, assente dalla bio).
- Elettrostimolazione Compex, preparazione atletica per sport e merchandising (dalle storie in evidenza): dettagli.
- Giorni, orari e costi del corso HYROX; verifica del formato di gara e della guida al marchio HYROX.
- Revisione medica degli articoli "Lo sai che..." e dei testi della mappa del corpo da parte del Dott. Sportelli o del team (campo `revisionato` negli articoli).
- Elenco "cosa portare" e informazioni sulle visite non agonistiche.
- Liberatorie per le persone riconoscibili nelle foto.
- Turchese esatto del logo A10 Medical (oggi `#0fa89e`, da campionare dal file originale).

---

## Aspetti legali: checklist prima della pubblicazione ufficiale

Non è una consulenza legale: i punti segnati vanno verificati con il commercialista e con il consulente privacy del centro.

- **Cookie (pronto).** Il sito non usa cookie né strumenti di tracciamento: si collega solo al proprio dominio, i font sono ospitati in locale, la mappa OpenStreetMap si carica solo su richiesta e la preferenza del tema (localStorage) viene salvata solo se l'utente usa il pulsante. Per questo non serve il banner. **Se in futuro si aggiungono Google Analytics, Meta Pixel, Google Maps incorporata, video YouTube o feed Instagram, serve un banner di consenso e va aggiornata la cookie policy.**
- **Dati societari (obbligatori).** Compilare `datiLegali` in `data/centro.json` per entrambe le attività: compaiono da soli nel piè di pagina. P.IVA in home per tutti (art. 35 DPR 633/1972); per le S.r.l. anche sede legale, ufficio e numero del registro imprese, capitale sociale versato (art. 2250 c.c.); PEC consigliata.
- **Informativa privacy.** La pagina `/privacy/` è un modello: va completata con i dati dei titolari, idealmente dal consulente privacy del centro (che, come struttura sanitaria, dovrebbe già averne uno).
- **Modulo contatti.** Web3Forms (Web3Creative) offre un accordo sul trattamento dei dati, ma la sede dei server va verificata. Per una struttura sanitaria è preferibile un servizio con server nell'UE, oppure rinunciare al modulo e lasciare solo telefono ed email. Il modulo invita già a non scrivere dati sulla salute.
- **Pubblicità sanitaria (A10 Medical).** La L. 145/2018 (comma 525) consente alle strutture sanitarie private solo comunicazioni informative, senza elementi promozionali o suggestivi; le violazioni sono segnalate dagli Ordini professionali. Far approvare i testi di A10 Medical al direttore sanitario e verificare con l'Ordine dei Medici di Piacenza se indicare nel sito direttore sanitario e autorizzazione sanitaria (campi già previsti in `datiLegali`).
- **Foto.** Liberatoria per ogni persona riconoscibile; foto scattate o fornite dal cliente.
- **La demo.** Finché il cliente non approva, non diffondere il link e non usarlo nel portfolio. Se il cliente rinuncia, eliminare repository e sito.

---

## Struttura del progetto

```
assets/            foto e loghi del cliente (si aggiungono qui)
content/           articoli "Lo sai che..." (Markdown)
data/              dati modificabili (centro, corsi, servizi, HYROX, foto)
public/            favicon, immagini social (og/), apple-touch-icon
scripts/           texture topografica, immagini social, controllo foto, JSON-LD, link, Lighthouse
src/
  components/      componenti (hero, calendario corsi, mappa del corpo, modulo, mappa, ...)
  layouts/         layout comune (SEO, tema, header, footer)
  lib/             orari "Aperto ora", JSON-LD, dati, link
  pages/           una pagina per indirizzo
  styles/          token di design (palette, tipografia, temi) e stili di base
tests/             test unitari (node:test) e end-to-end (Playwright)
```

Palette (contrasti WCAG verificati):

| Token | Colore | Uso |
|---|---|---|
| `--nero` | `#0f0e0c` | fondo poster Area10 |
| `--osso` | `#ecebe5` | fondo chiaro Area10, testo su nero (16:1) |
| `--oro` | `#d8a838` | accento Area10 (su nero 8,8:1; testo nero su oro 8,6:1) |
| `--ocra` | `#735409` | oro leggibile su fondo chiaro (5,9:1) |
| `--teal` | `#0fa89e` | accento A10 Medical (forme e decorazioni) |
| `--teal-scuro` | `#067068` | testo e bottoni turchesi su bianco (5,8:1) |
| `--teal-chiaro` | `#3fcabe` | turchese nel tema scuro (9:1) |
| `--carbone` | `#132322` | testo A10 Medical (15,9:1) |
