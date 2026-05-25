import { expect, test, fixtureUrl, hoverWord, hoverText, tooltipHostCount } from './extension-fixture';

test.describe('exclusion zones', () => {
  test('does not trigger inside input, textarea, or contenteditable', async ({
    extPage,
  }) => {
    await extPage.goto(await fixtureUrl('test-page.html'));

    for (const sel of ['#input-field', '#text-area', '#editable']) {
      await hoverWord(extPage, sel);
      await extPage.waitForTimeout(400);
      expect(await tooltipHostCount(extPage, 50)).toBe(0);
    }
  });
});
