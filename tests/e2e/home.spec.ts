import { test, expect } from '@playwright/test';

test.use({ browserName: 'webkit' });

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next/);
});
