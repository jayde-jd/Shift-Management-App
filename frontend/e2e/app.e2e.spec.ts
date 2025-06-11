import { test, expect } from '@playwright/test';

test.describe('Shift Management App E2E', () => {
  test('should display navbar and main sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toContainText('Shift Management System');
    await expect(page.locator('text=Preferred Timezone')).toBeVisible();
    await expect(page.locator('text=Shifts')).toBeVisible();
  });

  test('can add a worker (UI only)', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder="Add new worker"]');
    await input.fill('Test Worker');
    await page.getByRole('button', { name: /add/i }).click();
    // This only tests UI, not backend integration
    await expect(input).toHaveValue('');
  });
});
