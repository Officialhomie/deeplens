import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx --yes serve tests/e2e/fixtures -l 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
  },
  globalSetup: path.join(__dirname, 'tests/e2e/global-setup.ts'),
});
