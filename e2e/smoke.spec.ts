import { expect, test } from '@playwright/test';

test.describe('Portfolio smoke test', () => {
  test('loads the homepage with a visible heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('the CV download link points to a downloadable pdf', async ({ page }) => {
    await page.goto('/');

    const cvLink = page.getByRole('link', { name: 'Download CV' });
    await expect(cvLink).toBeVisible();
    await expect(cvLink).toHaveAttribute('href', /\.pdf$/);
    await expect(cvLink).toHaveAttribute('download', /.+/);
  });

  test('the contact form fields are reachable by their labels', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });

  test('submitting the contact form shows a success message without a real network request', async ({ page }) => {
    let requestCount = 0;
    await page.route('https://api.web3forms.com/**', async (route) => {
      requestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Email sent' }),
      });
    });

    await page.goto('/');
    await page.getByLabel('Name').fill('Jane Doe');
    await page.getByLabel('Email').fill('jane@example.com');
    await page.getByLabel('Message').fill('Hello, this is a Playwright smoke test message.');
    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/thanks! your message has been sent/i)).toBeVisible();
    expect(requestCount).toBe(1);
  });
});
