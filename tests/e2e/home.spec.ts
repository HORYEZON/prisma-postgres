import { test, expect } from "@playwright/test";

// test("homepage has title", async ({ page }) => {
//   await page.goto("/");
//   await expect(page).toHaveTitle(/Next/);
// });

test.describe('Homepage', () => {

  test('should load the homepage and have correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Next|My App/i)
  })

  test('should have main heading with correct text', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Welcome|Next/i)
  })

  test('should have navbar link to About page', async ({ page }) => {
    await page.goto('/')
    const aboutLink = page.getByRole('link', { name: /About/i })
    await expect(aboutLink).toBeVisible()
  })

  test('should navigate to About page when clicking link', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /About/i }).click()
    await expect(page).toHaveURL(/about/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/About/i)
  })

})
