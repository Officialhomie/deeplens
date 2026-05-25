import { existsSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
if (!existsSync(dist)) {
  console.error('Run `npm run build` before packaging. dist/ not found.');
  process.exit(1);
}
console.log('Build output ready at:', dist);
console.log('For Chrome Web Store: zip the dist/ folder (exclude source maps if shipping).');
