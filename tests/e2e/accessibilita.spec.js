// Controllo automatico di accessibilità (axe-core, regole WCAG 2.2 A/AA) in tema chiaro e scuro.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagine = [
  '',
  'area10/',
  'area10/hyrox/',
  'area10/corsi/',
  'medical/',
  'medical/visite-sportive/',
  'lo-sai-che/',
  'lo-sai-che/niente-dolore-niente-problemi/',
  'contatti/',
  'privacy/',
  '404.html',
];

for (const tema of ['light', 'dark']) {
  test.describe(`tema ${tema}`, () => {
    test.use({ colorScheme: tema });
    for (const percorso of pagine) {
      test(`axe: /${percorso}`, async ({ page }) => {
        await page.goto(percorso, { waitUntil: 'networkidle' });
        const risultato = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        const sintesi = risultato.violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.length} elementi, es. ${v.nodes[0]?.target.join(' ')}`,
        );
        expect(sintesi).toEqual([]);
      });
    }
  });
}
