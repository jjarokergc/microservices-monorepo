// packages/common/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2020',
  sourcemap: true,
  clean: true,
  dts: true,
  splitting: false,
  minify: false,
  treeshake: true,
});
