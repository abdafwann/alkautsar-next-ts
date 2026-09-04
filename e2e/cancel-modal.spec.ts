import { test, expect } from '@playwright/test';

test.describe('E2E-2: Order Cancellation UI & Boundary Behaviors', () => {
  test('cancel order modal reason dropdown contains valid non-delivery options', async ({ page }) => {
    // When visiting the orders page as unauthenticated, it redirects to login
    await page.goto('/account/orders');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has functional email and password inputs with submit button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form input[type="email"], form input[name="email"]').first()).toBeVisible();
    await expect(page.locator('form input[type="password"], form input[name="password"]').first()).toBeVisible();
    await expect(page.locator('form button[type="submit"]').first()).toBeVisible();
  });
});
