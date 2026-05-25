import {
  expect,
  test,
  fixtureUrl,
  hoverText,
  tooltipHostCount,
} from './extension-fixture';
import { seedExtensionSettings } from './helpers/extension';

test.describe('domain blacklist', () => {
  test('is silent when hostname is blacklisted', async ({
    extContext,
    extensionId,
  }) => {
    await seedExtensionSettings(extContext, extensionId, {
      blacklistedDomains: ['127.0.0.1'],
    });
    const page = await extContext.newPage();
    await page.goto(await fixtureUrl('test-page.html'));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await hoverText(page, 'eigenvalue');
    await page.waitForTimeout(450);
    expect(await tooltipHostCount(page, 100)).toBe(0);
    await page.close();
  });
});
