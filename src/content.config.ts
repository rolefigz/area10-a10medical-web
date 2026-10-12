// Collezioni di contenuti: gli articoli di "Lo sai che..." sono file Markdown in /content/lo-sai-che.
// Per aggiungerne uno basta creare un nuovo file .md con gli stessi campi in testa.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const loSaiChe = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/lo-sai-che' }),
  schema: z.object({
    titolo: z.string(),
    descrizione: z.string().max(170),
    data: z.coerce.date(),
    /** "mito" = falso mito smontato; "approfondimento" = articolo informativo */
    tipo: z.enum(['mito', 'approfondimento']),
    /** la frase falsa, solo per i miti */
    mito: z.string().optional(),
    /** 2-3 frasi da ricordare, mostrate in un riquadro */
    inBreve: z.array(z.string()).default([]),
    /** servizi collegati (id di data/servizi.json) */
    servizi: z.array(z.string()).default([]),
    ordine: z.number().default(99),
    /** false finché il Dott. Sportelli o il team medico non ha riletto il testo */
    revisionato: z.boolean().default(false),
  }),
});

export const collections = { loSaiChe };
