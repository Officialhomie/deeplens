import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import type { ManifestV3Export } from '@crxjs/vite-plugin';
import baseManifest from './manifest.json';
import pkg from './package.json';

/**
 * package.json is the single source of truth for the version — manifest.json
 * intentionally carries no `version` field so the two can never drift.
 */
const manifest = {
  ...baseManifest,
  version: pkg.version,
} as ManifestV3Export;

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    // Store review reads the shipped bundle; keep it minified but never
    // emit sourcemaps into the package.
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: 'src/popup/popup.html',
      },
    },
  },
});
