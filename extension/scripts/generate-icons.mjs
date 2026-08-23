import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'icons');
mkdirSync(iconsDir, { recursive: true });

// DeepLens mark: a lens ring over a gradient field with an AI "spark" —
// legible as a solid dot at 16px, reveals the ring + spark at 48/128px.
const SVG = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7B7DFF"/>
      <stop offset="100%" stop-color="#3A2FBF"/>
    </linearGradient>
    <radialGradient id="glass" cx="42%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="128" height="128" rx="28" fill="url(#bg)"/>

  <!-- lens ring -->
  <circle cx="54" cy="54" r="30" fill="url(#glass)" stroke="#FFFFFF" stroke-width="9"/>
  <!-- handle -->
  <line x1="76" y1="76" x2="100" y2="100" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round"/>

  <!-- AI spark -->
  <path d="M97 22 L101 32 L111 36 L101 40 L97 50 L93 40 L83 36 L93 32 Z" fill="#FFE566"/>
</svg>
`;

// At 16px the ring/handle/spark combo turns to mush — a bigger, simpler
// glass with no handle and no spark is what actually reads at that size.
const SVG_16 = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7B7DFF"/>
      <stop offset="100%" stop-color="#3A2FBF"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <circle cx="64" cy="64" r="38" fill="none" stroke="#FFFFFF" stroke-width="16"/>
</svg>
`;

for (const size of [48, 128]) {
  const resvg = new Resvg(SVG, { fitTo: { mode: 'width', value: size } });
  writeFileSync(join(iconsDir, `icon${size}.png`), resvg.render().asPng());
}

const resvg16 = new Resvg(SVG_16, { fitTo: { mode: 'width', value: 16 } });
writeFileSync(join(iconsDir, 'icon16.png'), resvg16.render().asPng());

console.log('Icons written to', iconsDir);
