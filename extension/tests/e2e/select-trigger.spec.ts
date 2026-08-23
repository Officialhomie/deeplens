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

  // Tooltip internals live behind a closed shadow root (see hover-trigger.spec).
  test('selection tooltip host is attached and rendered', async ({ extPage }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);

    await selectTextPhrase(extPage, 'quantum entanglement');
    await waitForTooltipHost(extPage, 10_000);

    const rect = await extPage.evaluate(() => {
      const host = document.querySelector('#deeplens-host');
      if (!host) return null;
      const r = host.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    expect(rect).not.toBeNull();
    expect(rect!.w).toBeGreaterThan(0);
    expect(rect!.h).toBeGreaterThan(0);
  });
});
