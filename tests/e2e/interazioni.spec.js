// Interazioni principali: menu mobile, tema, modulo, mappa a richiesta, mappa del corpo, barra mobile.
import { test, expect } from '@playwright/test';

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menu: si apre, si chiude con Esc e il focus torna sul pulsante', async ({ page }) => {
    await page.goto('');
    const apri = page.getByRole('button', { name: 'Menu', exact: true });
    await apri.click();
    const menu = page.getByRole('dialog', { name: 'Menu del sito' });
    await expect(menu).toBeVisible();
    await expect(apri).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(apri).toBeFocused();
    await expect(apri).toHaveAttribute('aria-expanded', 'false');
  });

  test('barra mobile: nelle pagine Area10 chiama Area10', async ({ page }) => {
    await page.goto('area10/');
    const chiama = page.getByRole('navigation', { name: 'Azioni rapide' }).getByRole('link', { name: /Chiama/ });
    await expect(chiama).toHaveAttribute('href', 'tel:+393381042067');
  });

  test('barra mobile: nelle pagine A10 Medical chiama A10 Medical', async ({ page }) => {
    await page.goto('medical/');
    const chiama = page.getByRole('navigation', { name: 'Azioni rapide' }).getByRole('link', { name: /Chiama/ });
    await expect(chiama).toHaveAttribute('href', 'tel:+393355776832');
  });

  test('barra mobile in home: "Chiama" propone i due numeri, "Come arrivare" usa le coordinate', async ({ page }) => {
    await page.goto('');
    const barra = page.getByRole('navigation', { name: 'Azioni rapide' });
    await barra.getByRole('button', { name: 'Chiama' }).click();
    const scelta = page.locator('#barra-chiama');
    await expect(scelta).toBeVisible();
    await expect(scelta.locator('a[href="tel:+393381042067"]')).toBeVisible();
    await expect(scelta.locator('a[href="tel:+393355776832"]')).toBeVisible();
    await expect(barra.getByRole('link', { name: /Come arrivare/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=44.949094,9.678713',
    );
  });
});

test('tema: il pulsante passa allo scuro e la scelta resta dopo il ricaricamento', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.header [data-toggle-tema]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('modulo: errori chiari se vuoto, messaggio dimostrativo senza chiave Web3Forms', async ({ page }) => {
  await page.goto('contatti/');
  const modulo = page.locator('[data-modulo]');
  await modulo.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page.locator('#m-nome-err')).toHaveText(/Scrivi il tuo nome/);
  await expect(page.locator('#m-nome')).toBeFocused();
  await expect(page.locator('#m-nome')).toHaveAttribute('aria-invalid', 'true');

  await page.locator('#m-nome').fill('Mario Rossi');
  await page.locator('#m-tel').fill('338 1234567');
  await page.locator('#m-interesse').selectOption('Prova gratuita in palestra');
  await page.locator('#m-privacy').check();
  await modulo.getByRole('button', { name: 'Invia la richiesta' }).click();
  await expect(page.locator('[data-esito]')).toBeVisible();
  await expect(page.locator('[data-esito-titolo]')).toHaveText('Modulo dimostrativo.');
});

test('mappa: nessun iframe esterno finché non lo chiedi', async ({ page }) => {
  await page.route('**/openstreetmap.org/**', (r) => r.abort());
  await page.goto('contatti/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostra la mappa interattiva' }).click();
  await expect(page.locator('iframe.mappa__iframe')).toHaveAttribute('src', /openstreetmap\.org\/export\/embed/);
});

test('mappa del corpo: scegliendo "Schiena" compare solo la scheda della schiena', async ({ page }) => {
  await page.goto('medical/');
  await page.getByRole('button', { name: 'Schiena' }).click();
  await expect(page.getByRole('button', { name: 'Schiena' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#zona-schiena')).toBeVisible();
  await expect(page.locator('#zona-ginocchio')).toBeHidden();
});

test('pagina inesistente: mostra la 404 del sito', async ({ page }) => {
  const risposta = await page.goto('pagina-che-non-esiste/');
  expect(risposta?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fuori campo.');
});

test('demo: ogni pagina ha noindex e il credito RoleFigz', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('footer')).toContainText('Proposta di design realizzata da RoleFigz');
});
