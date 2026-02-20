// Root configuration for Vite and Vitest
// Shared across all packages and apps in the monorepo.
// Each service invokes this function to merge the base config with its own

// Place '.env.test' in the root of the monorepo
// for shared test environment variables

// Ensures TS knows about the .test property
/// <reference types="vitest" />

import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load environment variables:
  // - When Vitest runs, mode defaults to 'test'
  // - Third arg '' = load ALL vars (no VITE_ prefix required)
  // - This works for both dev/build (mode='development'/'production') and test  (mode='test')
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Respect tsconfig paths aliases. Auto-resolves @/ from tsconfig paths
    plugins: [tsconfigPaths()],

    // Shared server settings (useful for all)
    server: {
      port: 5173,
      strictPort: true,
    },

    // shared test settings (Vitest inherits these)
    test: {
      env, // Make loaded env vars available inside tests as process.env.*
      globals: true, // enable global test APIs like describe, it, expect
      environment: 'node', // default for backend services
      // silent: 'passed-only', // only log failed tests (optional) other: True
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
      },
    },
  };
});
