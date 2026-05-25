import { expect, test, fixtureUrl, hoverText, tooltipHostCount } from './extension-fixture';

test.describe('abort on leave', () => {
  test('cancels pending hover when pointer leaves before delay', async ({
    extPage,
  }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));
    const loc = extPage.getByText('eigenvalue').first();
    const box = await loc.boundingBox();
    if (!box) throw new Error('missing box');

    await extPage.mouse.move(box.x + 2, box.y + box.height / 2);
    await extPage.waitForTimeout(120);
    await extPage.mouse.move(box.x + 400, box.y + 200);
    await extPage.waitForTimeout(400);
    expect(await tooltipHostCount(extPage, 100)).toBe(0);
  });
});
