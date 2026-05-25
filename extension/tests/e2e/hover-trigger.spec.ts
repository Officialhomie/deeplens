import {
  expect,
  test,
  fixtureUrl,
  hoverText,
  waitForTooltipHost,
  tooltipHostCount,
} from './extension-fixture';

test.describe('hover trigger', () => {
  test('shows tooltip after 300ms hover on a word', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);
    await hoverText(extPage, 'eigenvalue');
    await extPage.waitForTimeout(500);
    await waitForTooltipHost(extPage, 15_000);
  });

  test('tooltip shows word label and mode buttons', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);
    await hoverText(extPage, 'eigenvalue');
    await waitForTooltipHost(extPage, 15_000);

    await expect(extPage.locator('pierce/.dl-tooltip')).toBeVisible({ timeout: 5_000 });
    await expect(extPage.locator('pierce/.dl-word')).toHaveText('eigenvalue', { timeout: 3_000 });
    await expect(extPage.locator('pierce/.dl-mode-btn[data-mode="quick"]')).toBeVisible();
    await expect(extPage.locator('pierce/.dl-mode-btn[data-mode="deep"]')).toBeVisible();
    await expect(extPage.locator('pierce/.dl-icon-btn[aria-label="Close"]')).toBeVisible();
  });

  test('tooltip stays open for 5 seconds without flickering', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);
    await hoverText(extPage, 'eigenvalue');
    await waitForTooltipHost(extPage, 15_000);

    // Sample every 500ms for 5 seconds — host must remain attached throughout
    for (let i = 0; i < 10; i++) {
      await extPage.waitForTimeout(500);
      expect(
        await extPage.locator('#deeplens-host').count(),
        `tooltip must still be present at ${(i + 1) * 500}ms`,
      ).toBe(1);
    }
  });

  test('does not show tooltip at 200ms hover', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await hoverText(extPage, 'eigenvalue');
    await extPage.waitForTimeout(200);
    expect(await tooltipHostCount(extPage, 50)).toBe(0);
  });
});
