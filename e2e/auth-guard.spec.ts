import { test, expect } from '@playwright/test';

test.describe('E2E-6: Auth Guard & Protected Route Access Control', () => {
  test('unauthenticated visitor accessing /account is redirected to login page', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visitor accessing /account/orders is redirected to login page', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visitor accessing /admin is redirected to admin login page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('unauthenticated visitor accessing /admin/products is redirected to admin login', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
