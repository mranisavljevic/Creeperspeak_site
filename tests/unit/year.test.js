import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// NOTE: this test fails each January until the footers are bumped. It runs in
// `npm test` and CI but is excluded from `npm run test:build` (Netlify deploy gate).
const dist = join(resolve(import.meta.dirname, '../..'), 'dist');

describe('footer year', () => {
  it('equals the current year on every page', () => {
    const year = String(new Date().getFullYear());
    for (const p of ['index', 'music', 'contact', 'lookmom', '404']) {
      expect(readFileSync(join(dist, `${p}.html`), 'utf8'), p).toContain(`&copy; ${year}`);
    }
  });
});
