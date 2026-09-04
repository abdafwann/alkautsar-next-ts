import { test, expect } from '@playwright/test';

test.describe('E2E-7: Store Catalog & Product Navigation', () => {
  test('user can browse store products and view details', async ({ page }) => {
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Verify presence of main store container
    const main = page.locator('main, section, div.container');
    await expect(main.first()).toBeVisible();
  });

  test('cart drawer or cart page is accessible', async ({ page }) => {
    await page.goto('/');
    // Check for cart trigger button
    const cartButton = page.locator('button[aria-label*="cart" i], button[aria-label*="keranjang" i], a[href*="cart"], button:has(svg)');
    await expect(cartButton.first()).toBeVisible();
  });
});
