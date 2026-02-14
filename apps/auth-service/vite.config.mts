// Vite configuration for the 'auth-service'' package
// Base config is a function to be invoked

/// <reference types="vitest" />

import { defineConfig, mergeConfig } from 'vite';
import baseConfig from '@example-org/vite-config'; // This is a function

// Define config as a function. Vitest calls it with { mode, command, ... }
export default defineConfig((configEnv) => {
  // Call the base function with the same env to get the resolved base object
  const resolvedBase = baseConfig(configEnv);

  return mergeConfig(resolvedBase, {
    test: {
      ...resolvedBase.test,
    },
  });
});
