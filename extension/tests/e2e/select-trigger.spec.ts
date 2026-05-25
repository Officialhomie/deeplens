import {
  expect,
  test,
  fixtureUrl,
  selectTextPhrase,
  waitForTooltipHost,
} from './extension-fixture';

test.describe('selection trigger', () => {
  test('fires tooltip after drag-selecting text', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);

    await selectTextPhrase(extPage, 'quantum entanglement');
    await waitForTooltipHost(extPage, 10_000);
    expect(await extPage.locator('#deeplens-host').count()).toBe(1);
  });

  test('selection tooltip shows visible content', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);

    await selectTextPhrase(extPage, 'quantum entanglement');
    await waitForTooltipHost(extPage, 10_000);

    await expect(extPage.locator('pierce/.dl-tooltip')).toBeVisible({ timeout: 5_000 });
    await expect(extPage.locator('pierce/.dl-mode-btn[data-mode="quick"]')).toBeVisible();
    await expect(extPage.locator('pierce/.dl-mode-btn[data-mode="deep"]')).toBeVisible();
    await expect(extPage.locator('pierce/.dl-icon-btn[aria-label="Close"]')).toBeVisible();
  });
});
