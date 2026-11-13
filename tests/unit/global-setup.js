import { existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '../..');
const dist = join(root, 'dist');

function newestSource(dir) {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['css', 'img'].includes(entry.name)) newest = Math.max(newest, newestSource(p));
    } else if (/\.(html|css|jpe?g|png|ico|js)$/i.test(entry.name) || dir !== root) {
      newest = Math.max(newest, statSync(p).mtimeMs);
    }
  }
  return newest;
}

export default async function setup() {
  const marker = join(dist, 'index.html');
  if (!existsSync(marker) || statSync(marker).mtimeMs < newestSource(root)) {
    await build({ root, logLevel: 'warn' });
  }
}
