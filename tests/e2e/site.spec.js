import { test, expect } from '@playwright/test';

const pages = ['index.html', 'music.html', 'contact.html', 'lookmom.html'];

for (const p of pages) {
  test(`${p} loads and has no horizontal scroll`, async ({ page }) => {
    const res = await page.goto(`/${p}`);
    expect(res.status()).toBe(200);
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);
  });
}

test('nav links resolve', async ({ page }) => {
  await page.goto('/index.html');
  await page.click('nav a[href="contact.html"]');
  await expect(page).toHaveURL(/contact\.html$/);
  await page.click('#logo');
  await expect(page).toHaveURL(/index\.html$/);
});

test('unknown path shows 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist.html');
  expect(res.status()).toBe(404);
  await expect(page.locator('a[href="index.html"]').last()).toBeVisible();
  await expect(page.locator('body')).toContainText('Page not found');
});
