import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'icons');
mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = 91;
      png.data[idx + 1] = 93;
      png.data[idx + 2] = 255;
      png.data[idx + 3] = 255;
    }
  }
  writeFileSync(join(iconsDir, `icon${size}.png`), PNG.sync.write(png));
}

console.log('Icons written to', iconsDir);
