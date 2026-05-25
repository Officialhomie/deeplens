import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../../dist/manifest.json');

export default function globalSetup(): void {
  if (!existsSync(dist)) {
    execSync('npm run build', {
      cwd: path.resolve(__dirname, '../..'),
      stdio: 'inherit',
    });
  }
}
