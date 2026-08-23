#!/usr/bin/env node
/**
 * Release preflight — validates dist/ before it is packaged for the store.
 *
 * Exported so scripts/zip.js can gate on it and CI can run it standalone.
 * Every check either passes or throws; nothing here silently repairs the build,
 * because a build that needs repairing is a build worth looking at.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const REQUIRED_ICONS = [16, 48, 128];
const MAX_ZIP_BYTES = 10 * 1024 * 1024;

/** PNG header: 8-byte signature, then IHDR with big-endian width/height. */
function readPngSize(path) {
  const buf = readFileSync(path);
  const isPng =
    buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a;
  if (!isPng) throw new Error(`${path} is not a valid PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function walk(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [relative(base, full)];
  });
}

/** Files that must never reach the store package. */
const FORBIDDEN = [
  { label: 'source map', test: (f) => f.endsWith('.map') },
  { label: 'log file', test: (f) => f.endsWith('.log') },
  { label: 'TypeScript source', test: (f) => f.endsWith('.ts') || f.endsWith('.tsx') },
  { label: 'dependency directory', test: (f) => f.split(/[\\/]/).includes('node_modules') },
  { label: 'test file', test: (f) => /(^|[\\/])(tests?|__tests__)[\\/]/.test(f) },
  { label: 'spec file', test: (f) => /\.(test|spec)\./.test(f) },
  { label: 'macOS metadata', test: (f) => f.includes('.DS_Store') || f.startsWith('__MACOSX') },
  { label: 'editor/VCS artifact', test: (f) => /(^|[\\/])\.(git|vscode|idea|cursor)[\\/]/.test(f) },
  { label: 'backup artifact', test: (f) => /\.(bak|orig|swp)$/.test(f) },
];

export function preflight({ root, dist, zipPath = null, log = console.log }) {
  const problems = [];
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

  if (!existsSync(dist)) {
    throw new Error('dist/ not found. Run `npm run build` first.');
  }

  const manifestPath = join(dist, 'manifest.json');
  if (!existsSync(manifestPath)) throw new Error('dist/manifest.json not found.');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  // --- version: package.json is the single source of truth ------------------
  if (manifest.version !== pkg.version) {
    problems.push(
      `Version mismatch: manifest.json=${manifest.version} package.json=${pkg.version}. ` +
        'The manifest version is injected from package.json in vite.config.ts.',
    );
  }

  // --- icons ----------------------------------------------------------------
  for (const size of REQUIRED_ICONS) {
    const declared = manifest.icons?.[String(size)];
    if (!declared) {
      problems.push(`manifest.icons is missing the ${size}px entry.`);
      continue;
    }
    const iconPath = join(dist, declared);
    if (!existsSync(iconPath)) {
      problems.push(`Declared icon not present in dist: ${declared}`);
      continue;
    }
    try {
      const { width, height } = readPngSize(iconPath);
      if (width !== size || height !== size) {
        problems.push(`${declared} is ${width}x${height}, expected ${size}x${size}.`);
      }
    } catch (err) {
      problems.push(`${declared}: ${err.message}`);
    }
  }

  // --- content script + service worker actually exist -----------------------
  for (const script of manifest.content_scripts?.flatMap((c) => c.js ?? []) ?? []) {
    if (!existsSync(join(dist, script))) {
      problems.push(`content_scripts references a missing file: ${script}`);
    }
  }
  const sw = manifest.background?.service_worker;
  if (sw && !existsSync(join(dist, sw))) {
    problems.push(`background.service_worker references a missing file: ${sw}`);
  }

  // --- unwanted files -------------------------------------------------------
  const files = walk(dist);
  for (const file of files) {
    for (const rule of FORBIDDEN) {
      if (rule.test(file)) problems.push(`Unwanted ${rule.label} in dist: ${file}`);
    }
  }

  // --- zip size -------------------------------------------------------------
  if (zipPath && existsSync(zipPath)) {
    const bytes = statSync(zipPath).size;
    if (bytes > MAX_ZIP_BYTES) {
      problems.push(
        `Package is ${(bytes / 1024 / 1024).toFixed(2)} MB, over the ${
          MAX_ZIP_BYTES / 1024 / 1024
        } MB limit.`,
      );
    }
  }

  // --- permission summary (always printed, for eyeball review) --------------
  const list = (v) => (v?.length ? v.join(', ') : '(none)');
  log('\n── Permission summary ─────────────────────────────');
  log(`  permissions            : ${list(manifest.permissions)}`);
  log(`  optional_permissions   : ${list(manifest.optional_permissions)}`);
  log(`  host_permissions       : ${list(manifest.host_permissions)}`);
  log(`  optional_host_permissions: ${list(manifest.optional_host_permissions)}`);
  log(
    `  web_accessible_resources : ${
      manifest.web_accessible_resources?.length
        ? JSON.stringify(manifest.web_accessible_resources)
        : '(none)'
    }`,
  );
  log(`  content_scripts matches: ${list(manifest.content_scripts?.[0]?.matches)}`);
  log('───────────────────────────────────────────────────');
  log(`\n  dist files (${files.length}):`);
  for (const f of files.sort()) log(`    ${f}`);

  if (problems.length > 0) {
    throw new Error(
      `Preflight failed with ${problems.length} problem(s):\n` +
        problems.map((p) => `  ✗ ${p}`).join('\n'),
    );
  }

  log(`\n✓ Preflight passed — version ${manifest.version}, ${files.length} files.`);
  return { manifest, files };
}
