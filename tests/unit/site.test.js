import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dist = join(root, 'dist');
const pages = ['index', 'music', 'contact', 'lookmom', '404'];
const html = Object.fromEntries(pages.map((p) => [p, readFileSync(join(dist, `${p}.html`), 'utf8')]));

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const navOf = (s) => (s.match(/<nav>[\s\S]*?<\/nav>/) ?? [''])[0].replace(/\s*class="selected"/g, '');

describe('built site', () => {
  it('has every Vite input', () => {
    for (const p of pages) expect(existsSync(join(root, `${p}.html`)), p).toBe(true);
    for (const p of pages) expect(existsSync(join(dist, `${p}.html`)), p).toBe(true);
  });

  it('resolves all relative href/src', () => {
    for (const [p, s] of Object.entries(html)) {
      for (const m of s.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const ref = m[1];
        if (/^(https?:|mailto:|#|data:)/.test(ref)) continue;
        const target = join(dist, ref.split(/[?#]/)[0]);
        expect(existsSync(target), `${p}: ${ref}`).toBe(true);
      }
    }
  });

  it('has lang, unique non-empty title, viewport', () => {
    const titles = new Set();
    for (const [p, s] of Object.entries(html)) {
      expect(s, p).toMatch(/<html lang="en"/);
      const t = (s.match(/<title>([^<]*)<\/title>/) ?? [])[1];
      expect(t && t.trim().length > 0, p).toBe(true);
      titles.add(t);
      expect(s, p).toMatch(/name="viewport"/);
    }
    expect(titles.size).toBe(pages.length);
  });

  it('has alt on images and noopener on _blank links', () => {
    for (const [p, s] of Object.entries(html)) {
      for (const m of s.matchAll(/<img\b[^>]*>/g)) expect(m[0], p).toMatch(/\balt="/);
      for (const m of s.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) expect(m[0], p).toMatch(/rel="[^"]*noopener/);
    }
  });

  it('shares identical nav and the page skeleton', () => {
    const base = navOf(html.index);
    for (const [p, s] of Object.entries(html)) {
      expect(navOf(s), p).toBe(base);
      expect(s, p).toMatch(/rel="stylesheet"[^>]*\.css/);
      const src = readFileSync(join(root, `${p}.html`), 'utf8');
      const order = ['normalize', 'main', 'responsive'].map((n) => src.indexOf(`css/${n}.css`));
      expect(order[0] >= 0 && order[0] < order[1] && order[1] < order[2], p).toBe(true);
      for (const tag of ['id="wrapper"', '<header>', '<nav>', '<section', '<footer>']) expect(s, p).toContain(tag);
    }
  });

  it('has no inline style attributes', () => {
    for (const [p, s] of Object.entries(html)) expect(s, p).not.toMatch(/\sstyle="/);
  });

  it('has no image over 500 KB', () => {
    for (const f of walk(dist).filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))) {
      expect(statSync(f).size, f).toBeLessThan(500 * 1024);
    }
  });
});
