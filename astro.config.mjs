// Configurazione di Astro.
// Il sito viene pubblicato su GitHub Pages in una sottocartella (/<nome-repo>/).
// Per un dominio proprio: SITE_URL=https://www.dominio.it e BASE_PATH=/ (vedi README).
import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL ?? 'https://rolefigz.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/area10-a10medical-web';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  // 'true' comprime l'HTML senza perdere gli spazi tra elementi inline
  // (il default di Astro 7, 'jsx', unirebbe le parole tra due tag).
  compressHTML: true,
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  // Variabili d'ambiente lette in fase di build (impostabili come "Variables" su GitHub).
  env: {
    schema: {
      // true = sito dimostrativo: aggiunge noindex. Mettere false quando il cliente approva.
      PUBLIC_DEMO: envField.boolean({ context: 'client', access: 'public', default: true }),
      // Chiave pubblica di Web3Forms per il modulo contatti (non è un segreto, ma resta fuori dal codice).
      PUBLIC_WEB3FORMS_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  // Font self-hosted: scaricati in build e serviti dal sito stesso (niente Google Fonts, GDPR ok).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Big Shoulders Display',
      cssVariable: '--font-display',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
      display: 'swap',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Figtree',
      cssVariable: '--font-sans',
      weights: ['300 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
    },
  ],
});
