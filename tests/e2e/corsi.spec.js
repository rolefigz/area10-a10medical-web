// Filtri del calendario corsi: giorno, disciplina, sede, stato vuoto, azzeramento e link condivisibili.
import { test, expect } from '@playwright/test';

const visibiliTabella = (page) => page.locator('.tabella [data-corso]:visible');
const visibiliSchede = (page) => page.locator('.schede [data-corso]:visible');
const conteggio = (page) => page.locator('[data-conteggio]');

test.describe('desktop (tabella)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('area10/corsi/');
  });

  test('senza filtri mostra tutti i 13 corsi', async ({ page }) => {
    await expect(conteggio(page)).toHaveText('13 corsi a settimana');
    await expect(visibiliTabella(page)).toHaveCount(13);
  });

  test('filtro per giorno: giovedì ha 4 corsi e aggiorna l\'indirizzo', async ({ page }) => {
    await page.getByText('Gio', { exact: true }).click();
    await expect(visibiliTabella(page)).toHaveCount(4);
    await expect(conteggio(page)).toHaveText('4 corsi trovati su 13');
    await expect(page).toHaveURL(/\?giorno=gio$/);
    // le colonne degli altri giorni spariscono
    await expect(page.locator('.tabella thead th[data-col]:visible')).toHaveCount(1);
  });

  test('filtro per sede: San Polo ha 2 corsi', async ({ page }) => {
    await page.locator('label[for="f-sede-san-polo"]').click();
    await expect(visibiliTabella(page)).toHaveCount(2);
    await expect(page.locator('.tabella [data-corso]:visible .slot__sede')).toHaveCount(2);
  });

  test('disciplina + sede: pilates a San Polo è uno solo', async ({ page }) => {
    await page.getByLabel('Disciplina').selectOption('pilates');
    await expect(visibiliTabella(page)).toHaveCount(3);
    await page.locator('label[for="f-sede-san-polo"]').click();
    await expect(visibiliTabella(page)).toHaveCount(1);
    await expect(visibiliTabella(page).first()).toContainText('Pilates');
    await expect(page).toHaveURL(/disciplina=pilates/);
  });

  test('nessun risultato: messaggio e pulsante per azzerare', async ({ page }) => {
    await page.getByLabel('Disciplina').selectOption('yoga');
    await page.locator('label[for="f-sede-san-polo"]').click();
    await expect(page.locator('[data-vuoto]')).toBeVisible();
    await expect(page.locator('.tabella-contenitore')).toBeHidden();
    await page.locator('[data-azzera-vuoto]').click();
    await expect(conteggio(page)).toHaveText('13 corsi a settimana');
    await expect(page.locator('[data-vuoto]')).toBeHidden();
    await expect(page).toHaveURL(/corsi\/$/);
  });

  test('link condivisibile: ?giorno=ven mostra i 2 corsi del venerdì', async ({ page }) => {
    await page.goto('area10/corsi/?giorno=ven');
    await expect(visibiliTabella(page)).toHaveCount(2);
    await expect(page.locator('#f-giorno-ven')).toBeChecked();
  });

  test('valori sconosciuti nell\'indirizzo vengono ignorati', async ({ page }) => {
    await page.goto('area10/corsi/?giorno=xyz&disciplina=boh');
    await expect(visibiliTabella(page)).toHaveCount(13);
  });
});

test.describe('mobile (schede)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('le schede si filtrano come la tabella', async ({ page }) => {
    await page.goto('area10/corsi/');
    await expect(page.locator('.tabella-contenitore')).toBeHidden();
    await expect(visibiliSchede(page)).toHaveCount(13);
    await page.getByText('Mer', { exact: true }).click();
    await expect(visibiliSchede(page)).toHaveCount(2);
    await expect(page.locator('[data-giorno-sezione]:visible')).toHaveCount(1);
  });
});
