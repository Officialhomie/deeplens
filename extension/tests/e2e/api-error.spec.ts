import { test } from './extension-fixture';

test.describe('API error state', () => {
  test('invalid API key error UX (requires live API)', async () => {
    test.skip(
      true,
      'Network-dependent; error recovery matrix covered in tests/unit/errorDisplay.test.ts',
    );
  });
});
