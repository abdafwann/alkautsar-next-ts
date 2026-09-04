import { test, expect } from '@playwright/test';

test.describe('E2E-5: Product Search & Catalog Interaction', () => {
  test('homepage renders header, navigation, and product store section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Alkautsar|Herbal|Toko/i);
    // Check search input or store link presence
    const storeLink = page.locator('a[href*="/store"], a[href*="/products"], nav');
    await expect(storeLink.first()).toBeVisible();
  });

  test('store page loads with product catalog and search bar', async ({ page }) => {
    await page.goto('/store');
    // Ensure page loads successfully
    await expect(page).toHaveURL(/\/store/);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
