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

  test('does not show tooltip at 200ms hover', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await hoverText(extPage, 'eigenvalue');
    await extPage.waitForTimeout(200);
    expect(await tooltipHostCount(extPage, 50)).toBe(0);
  });
});
