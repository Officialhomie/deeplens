import {
  expect,
  test,
  fixtureUrl,
  waitForTooltipHost,
} from './extension-fixture';

test.describe('selection trigger', () => {
  test('fires tooltip after text selection', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);

    await extPage.evaluate(() => {
      const el = document.getElementById('select-target');
      if (!el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
    await extPage.evaluate(() => {
      window.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
      );
    });

    await extPage.waitForTimeout(200);
    await waitForTooltipHost(extPage, 10_000);
    expect(await extPage.locator('#deeplens-host').count()).toBe(1);
  });
});
