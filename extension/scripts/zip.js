#!/usr/bin/env node
/**
 * Build Chrome Web Store upload ZIP from dist/ (TRD §12.5).
 * Excludes source maps and dev artifacts.
 */
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const iconsDir = join(root, 'icons');
const releaseDir = join(root, 'release');

if (!existsSync(dist)) {
  console.error('Run `npm run build` before packaging. dist/ not found.');
  process.exit(1);
}

for (const icon of ['icon16.png', 'icon48.png', 'icon128.png']) {
  const p = join(iconsDir, icon);
  if (!existsSync(p)) {
    console.error(`Missing ${p}. Run \`npm run icons\` first.`);
    process.exit(1);
  }
}

const version = JSON.parse(
  readFileSync(join(dist, 'manifest.json'), 'utf8'),
).version;
mkdirSync(releaseDir, { recursive: true });
const zipName = `deeplens-${version}.zip`;
const zipPath = join(releaseDir, zipName);

if (existsSync(zipPath)) {
  execSync(`rm -f "${zipPath}"`);
}

execSync(
  `cd "${dist}" && zip -r "${zipPath}" . -x "*.map" -x "*.DS_Store" -x "__MACOSX/*"`,
  { stdio: 'inherit' },
);

const kb = (statSync(zipPath).size / 1024).toFixed(1);
console.log(`\nRelease package: ${zipPath} (${kb} KB)`);
console.log('Upload in Chrome Web Store Developer Dashboard → Package.');
