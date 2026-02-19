// apps/auth-service/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  target: 'es2020',
  sourcemap: true,
  clean: true,
  dts: false,
  splitting: false,
  minify: true,
  treeshake: true,

  // Inline source of @example-org/common (no external .js exists)
  // Bundles common's TS source directly into auth-service's output
  noExternal: ['@example-org/common'],

  // Common's build emits JS files to dist, so we can treat it as an external dependency
  //   external: ['@example-org/common'],

  // Helps esbuild resolve workspace symlinks + tsconfig paths
  esbuildOptions(options) {
    options.tsconfig = './tsconfig.json';
  },
});
