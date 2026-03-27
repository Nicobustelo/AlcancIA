/**
 * One-off Playwright flow: capture AlcancIA pages at 1440x900.
 * Run with: pnpm exec node scripts/capture-frontend-screenshots.mjs
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = '/workspace/.screenshots';
const BASE = 'http://localhost:3000';

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await goto(page, '/');
    await page.screenshot({ path: `${OUT}/final_landing.png`, type: 'png' });

    await goto(page, '/chat');
    await page.screenshot({ path: `${OUT}/final_chat.png`, type: 'png' });

    const chatInput = page.getByPlaceholder('Escribí tu mensaje…');
    await chatInput.fill('Quiero invertir 0.01 RBTC');
    await page.getByRole('button', { name: 'Enviar' }).click();
    await new Promise((r) => setTimeout(r, 5000));
    await page.screenshot({ path: `${OUT}/final_chat_response.png`, type: 'png' });

    await goto(page, '/dashboard');
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: `${OUT}/final_dashboard.png`, type: 'png' });

    await goto(page, '/remesas');
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: `${OUT}/final_remesas.png`, type: 'png' });

    await goto(page, '/actividad');
    await page.screenshot({ path: `${OUT}/final_actividad.png`, type: 'png' });

    await goto(page, '/configuracion');
    await page.screenshot({ path: `${OUT}/final_configuracion.png`, type: 'png' });
  } finally {
    await browser.close();
  }

  console.log('Screenshots written to', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
