import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest.config.ts does not enable `test.globals`, so React Testing Library's
// built-in auto-cleanup (which only hooks a global `afterEach`) never registers.
// Do it explicitly here so every test file gets a fresh DOM between tests
// without having to import and call `cleanup()` itself.
afterEach(() => {
  cleanup();
});
