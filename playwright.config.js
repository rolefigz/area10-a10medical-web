// Test end-to-end con Playwright sul sito già compilato (npm run build, poi npm run test:e2e).
import { defineConfig, devices } from '@playwright/test';

const PORTA = 4322;
export const BASE = `http://127.0.0.1:${PORTA}/area10-a10medical-web/`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npx astro preview --port ${PORTA} --host 127.0.0.1`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
