#!/usr/bin/env node
/**
 * Reports gzipped asset sizes against TRD §9.1 targets.
 * Run after: npm run build
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const TARGETS_KB = {
  content: 40,
  background: 20,
  popup: 15,
  tooltipCss: 5,
};

function gzipSize(bytes) {
  return gzipSync(bytes).length;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function kb(n) {
  return (n / 1024).toFixed(2);
}

const assets = walk(DIST).filter(
  (p) => /\.(js|css)$/.test(p) && !p.includes('loader'),
);

let contentKb = 0;
let backgroundKb = 0;
let popupKb = 0;
let tooltipCssKb = 0;
let totalKb = 0;

for (const file of assets) {
  const raw = readFileSync(file);
  const gz = gzipSize(raw);
  totalKb += gz / 1024;
  const rel = file.replace(DIST, '');
  if (rel.includes('index.ts') && rel.endsWith('.js')) contentKb += gz / 1024;
  if (rel.includes('service-worker') && rel.endsWith('.js')) backgroundKb += gz / 1024;
  if (rel.includes('popup') && rel.endsWith('.js')) popupKb += gz / 1024;
  if (rel.endsWith('tooltip.css')) tooltipCssKb = gz / 1024;
  console.log(`${rel}: ${kb(gz)} KB gzipped`);
}

console.log('\n--- TRD §9.1 summary ---');
console.log(`content (index): ${contentKb.toFixed(2)} KB (target < ${TARGETS_KB.content})`);
console.log(`background SW: ${backgroundKb.toFixed(2)} KB (target < ${TARGETS_KB.background})`);
console.log(`popup: ${popupKb.toFixed(2)} KB (target < ${TARGETS_KB.popup})`);
console.log(`tooltip.css: ${tooltipCssKb.toFixed(2)} KB (target < ${TARGETS_KB.tooltipCss})`);
console.log(`total tracked assets: ${totalKb.toFixed(2)} KB`);
