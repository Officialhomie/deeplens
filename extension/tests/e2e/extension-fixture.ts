import { test as base, type BrowserContext, type Page } from '@playwright/test';
import {
  fixtureUrl,
  getExtensionId,
  launchExtensionContext,
  seedExtensionSettings,
} from './helpers/extension';

type ExtensionFixtures = {
  extContext: BrowserContext;
  extensionId: string;
  extPage: Page;
};

export const test = base.extend<ExtensionFixtures>({
  extContext: async ({}, use) => {
    const context = await launchExtensionContext();
    await use(context);
    await context.close();
  },
  extensionId: async ({ extContext }, use) => {
    await use(await getExtensionId(extContext));
  },
  extPage: async ({ extContext, extensionId }, use) => {
    await seedExtensionSettings(extContext, extensionId);
    if (extContext.serviceWorkers().length === 0) {
      await extContext.waitForEvent('serviceworker', { timeout: 15_000 });
    }
    const page = await extContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
export {
  fixtureUrl,
  hoverWord,
  hoverText,
  selectTextPhrase,
  waitForTooltipHost,
  tooltipHostCount,
} from './helpers/extension';
