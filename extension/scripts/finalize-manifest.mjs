#!/usr/bin/env node
/**
 * Post-build manifest finalization.
 *
 * The content script is built outside the CRXJS pipeline (see
 * vite.content.config.ts), so its manifest entry is injected here — pointing
 * at the self-contained IIFE rather than a CRXJS loader stub.
 *
 * This also asserts that nothing reintroduced web_accessible_resources: with
 * the IIFE content script, no extension resource needs to be reachable from a
 * host page, and every entry there is a fingerprinting surface.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const manifestPath = join(dist, 'manifest.json');
const CONTENT_SCRIPT = 'content/deeplens.js';

if (!existsSync(manifestPath)) {
  console.error('dist/manifest.json not found — run the Vite builds first.');
  process.exit(1);
}

if (!existsSync(join(dist, CONTENT_SCRIPT))) {
  console.error(
    `Content script missing at dist/${CONTENT_SCRIPT}. ` +
      'Did `vite build --config vite.content.config.ts` run?',
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

manifest.content_scripts = [
  {
    matches: ['<all_urls>'],
    js: [CONTENT_SCRIPT],
    run_at: 'document_idle',
    all_frames: false,
  },
];

// The IIFE bundle is injected directly by Chrome, so nothing needs page access.
if (
  Array.isArray(manifest.web_accessible_resources) &&
  manifest.web_accessible_resources.length > 0
) {
  console.error(
    'Unexpected web_accessible_resources in the built manifest:\n' +
      JSON.stringify(manifest.web_accessible_resources, null, 2) +
      '\nThe IIFE content script should not require any. Investigate before shipping.',
  );
  process.exit(1);
}
delete manifest.web_accessible_resources;

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Vite's own build manifest is a build artifact, not something Chrome loads.
rmSync(join(dist, '.vite'), { recursive: true, force: true });

console.log(`Manifest finalized — content script: ${CONTENT_SCRIPT}`);
