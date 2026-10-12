// robots.txt generato in build, con l'indirizzo corretto della sitemap.
// Nota: su GitHub Pages (sottocartella) i motori leggono solo il robots.txt alla radice del dominio;
// questo file diventa efficace con un dominio proprio. Il blocco dell'indicizzazione in modalità demo
// è affidato al meta "noindex" (vedi PUBLIC_DEMO nel README).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const sitemap = new URL(`${base}sitemap-index.xml`, site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
