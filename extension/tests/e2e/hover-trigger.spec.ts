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

  // The tooltip renders into a CLOSED shadow root, so its internals are
  // deliberately unreachable from the page — Playwright's `pierce/` engine
  // only traverses open roots. Assert the observable contract here; the
  // tooltip's markup and controls are covered in tests/unit/tooltipRender.test.ts.
  test('tooltip host attaches and stays isolated from the page', async ({
    extPage,
  }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    await extPage.waitForLoadState('domcontentloaded');
    await extPage.waitForTimeout(300);
    await hoverText(extPage, 'eigenvalue');
    await waitForTooltipHost(extPage, 15_000);

    const probe = await extPage.evaluate(() => {
      const host = document.querySelector('#deeplens-host');
      return {
        present: host !== null,
        // closed root => page scripts cannot read the user's lookups
        shadowReadableByPage: host !== null && host.shadowRoot !== null,
      };
    });
    expect(probe.present).toBe(true);
    expect(probe.shadowReadableByPage).toBe(false);
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
