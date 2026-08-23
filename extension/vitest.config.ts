import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts'],
    // The content script inlines styles/tooltip.css via a `?raw` import.
    // Without this, Vitest stubs CSS and the import resolves to an empty string.
    css: true,
  },
});
