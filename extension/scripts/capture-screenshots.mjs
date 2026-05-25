#!/usr/bin/env node
/**
 * Capture Chrome Web Store screenshots (1280×800).
 * Uses marketing scenes in docs/store-assets/scenes/ and optional live extension popup.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(root, '..');
const scenesDir = join(repoRoot, 'docs/store-assets/scenes');
const outDir = join(repoRoot, 'docs/store-assets/captured');
const dist = join(root, 'dist');
const VIEWPORT = { width: 1280, height: 800 };

const SCENES = [
  { file: '01-article-hover.html', name: '01-hover-streaming.png' },
  { file: '02-popup-settings.html', name: '02-popup-settings.png' },
  { file: '03-deep-pinned.html', name: '03-deep-pinned.png' },
  { file: '04-onboarding.html', name: '04-onboarding.png' },
];

async function main() {
  if (!existsSync(dist)) {
    console.error('Run `npm run build` first.');
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });

  for (const scene of SCENES) {
    const filePath = join(scenesDir, scene.file);
    if (!existsSync(filePath)) {
      console.warn('Skip missing scene', filePath);
      continue;
    }
    const page = await context.newPage();
    await page.goto(pathToFileURL(filePath).href, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const outPath = join(outDir, scene.name);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log('Wrote', outPath);
    await page.close();
  }

  await captureLivePopup(context).catch((err) => {
    console.warn('Live popup capture skipped:', err.message);
  });

  await browser.close();
  console.log('\nScreenshots ready in docs/store-assets/captured/');
  console.log('Upload 1280×800 PNGs to Chrome Web Store listing.');
}

async function captureLivePopup(context) {
  const extPath = dist;
  const extContext = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
    ],
  });
  try {
    let [sw] = extContext.serviceWorkers();
    if (!sw) {
      sw = await extContext.waitForEvent('serviceworker', { timeout: 15_000 });
    }
    const extId = sw.url().match(/chrome-extension:\/\/([^/]+)/)?.[1];
    if (!extId) throw new Error('extension id not found');

    const page = await extContext.newPage();
    await page.setViewportSize({ width: 400, height: 640 });
    await page.goto(`chrome-extension://${extId}/src/popup/popup.html`);
    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.set(
          {
            apiKey: 'sk-ant-api03-demo-key-for-screenshot-only',
            onboardingComplete: true,
            isEnabled: true,
            hoverEnabled: true,
            selectionEnabled: true,
          },
          resolve,
        );
      });
    });
    await page.reload();
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const first = document.getElementById('view-first-run');
      const onboard = document.getElementById('view-onboarding');
      const settings = document.getElementById('view-settings');
      if (first) first.hidden = true;
      if (onboard) onboard.hidden = true;
      if (settings) settings.hidden = false;
    });
    await page.waitForTimeout(200);

    const outPath = join(outDir, '05-popup-live.png');
    await page.screenshot({ path: outPath, type: 'png' });
    console.log('Wrote', outPath);
    await page.close();
  } finally {
    await extContext.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
