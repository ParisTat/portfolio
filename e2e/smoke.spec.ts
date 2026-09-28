import { expect, test } from '@playwright/test';

test.describe('Portfolio smoke test', () => {
  test('loads the homepage with a visible heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('loads without console errors or CSP violations', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.addInitScript(() => {
      const violations: string[] = [];
      (window as unknown as { __cspViolations: string[] }).__cspViolations = violations;
      document.addEventListener('securitypolicyviolation', (event) => {
        violations.push(`${event.violatedDirective} ${event.blockedURI}`);
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cspViolations = await page.evaluate(
      () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
    );
    expect(cspViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  // Guards the Tailwind v4 cascade-layer trap: unlayered CSS in index.css silently overrides utilities.
  test('keeps the header fixed and out of the page flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toHaveCSS('position', 'fixed');
    const heroTop = await page.locator('#hero').evaluate((el) => el.getBoundingClientRect().top);
    expect(heroTop).toBe(0);
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
