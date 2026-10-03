import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['components/**/*.{ts,tsx}', 'hooks/**/*.ts', 'utils/**/*.ts', 'config/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', 'components/icons/**'],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
