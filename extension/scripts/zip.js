#!/usr/bin/env node
/**
 * Build the Chrome Web Store upload ZIP from dist/ (TRD §12.5).
 *
 * Uses archiver rather than the system `zip` binary so packaging behaves
 * identically on macOS, Linux, Windows and CI images that ship no zip CLI.
 * Preflight runs before packaging, and the archive is re-inspected afterwards
 * so what we report is what the file actually contains.
 */
import { createWriteStream, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZipArchive } from 'archiver';
import { preflight } from './preflight.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const releaseDir = join(root, 'release');

const { manifest } = preflight({ root, dist });

const zipPath = join(releaseDir, `deeplens-${manifest.version}.zip`);
mkdirSync(releaseDir, { recursive: true });
if (existsSync(zipPath)) rmSync(zipPath);

const output = createWriteStream(zipPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

const done = new Promise((resolvePromise, reject) => {
  output.on('close', resolvePromise);
  archive.on('warning', reject);
  archive.on('error', reject);
});

archive.pipe(output);
// Deterministic: directory order is sorted by archiver, and the glob excludes
// the artifacts preflight already refuses to ship.
archive.glob('**/*', {
  cwd: dist,
  dot: false,
  ignore: ['**/*.map', '**/.DS_Store', '__MACOSX/**', '**/*.log'],
});
await archive.finalize();
await done;

// Re-run preflight against the finished artifact so the size gate sees the
// real file rather than an estimate.
preflight({ root, dist, zipPath, log: () => {} });

const bytes = statSync(zipPath).size;
console.log(`\n✓ Release package: ${zipPath}`);
console.log(`  ${(bytes / 1024).toFixed(1)} KB · version ${manifest.version}`);
console.log('  Upload in Chrome Web Store Developer Dashboard → Package.');
