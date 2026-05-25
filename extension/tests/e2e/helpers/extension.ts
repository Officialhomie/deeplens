import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  chromium,
  type BrowserContext,
  type Page,
} from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const EXTENSION_PATH = path.resolve(__dirname, '../../../dist');
export const FIXTURES_BASE = 'http://127.0.0.1:4173';

export async function launchExtensionContext(): Promise<BrowserContext> {
  return chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
}

export async function getExtensionId(context: BrowserContext): Promise<string> {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15_000 });
  }
  const match = serviceWorker.url().match(/chrome-extension:\/\/([^/]+)/);
  if (!match) throw new Error('Could not resolve extension id');
  return match[1];
}

export async function seedExtensionSettings(
  context: BrowserContext,
  extensionId: string,
  overrides: Record<string, unknown> = {},
): Promise<void> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await page.evaluate((extra) => {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set(
        {
          isEnabled: true,
          hoverEnabled: true,
          selectionEnabled: true,
          hoverDelayMs: 300,
          defaultMode: 'quick',
          apiKey: 'sk-ant-api03-e2e-placeholder-not-valid',
          onboardingComplete: true,
          blacklistedDomains: [],
          outputLanguage: 'en',
          ...extra,
        },
        () => resolve(),
      );
    });
  }, overrides);
  await page.close();
}

export async function fixtureUrl(name: string): Promise<string> {
  return `${FIXTURES_BASE}/${name}`;
}

export async function hoverWord(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`No bounding box for ${selector}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
}

/** Hover the center of visible text (more reliable than selector center for caret APIs). */
export async function hoverText(page: Page, text: string): Promise<void> {
  const loc = page.getByText(text).first();
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) throw new Error(`No bounding box for text: ${text}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

export async function selectTextPhrase(page: Page, phrase: string): Promise<void> {
  const loc = page.getByText(phrase).first();
  const box = await loc.boundingBox();
  if (!box) throw new Error(`No bounding box for phrase: ${phrase}`);
  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  await page.mouse.up();
}

export async function waitForTooltipHost(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForSelector('#deeplens-host', {
    state: 'attached',
    timeout: timeoutMs,
  });
}

export async function tooltipHostCount(page: Page, settleMs = 400): Promise<number> {
  await page.waitForTimeout(settleMs);
  return page.locator('#deeplens-host').count();
}
