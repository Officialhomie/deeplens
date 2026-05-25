import {
  expect,
  test,
  fixtureUrl,
  hoverText,
  waitForTooltipHost,
} from './extension-fixture';

test.describe('escape dismiss', () => {
  test('Escape removes tooltip host', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);
    await hoverText(extPage, 'eigenvalue');
    await extPage.waitForTimeout(450);
    await waitForTooltipHost(extPage);
    await extPage.keyboard.press('Escape');
    await extPage.waitForTimeout(200);
    expect(await extPage.locator('#deeplens-host').count()).toBe(0);
  });
});
