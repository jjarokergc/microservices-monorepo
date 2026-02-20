// eslint.config.mjs
import config from '@example-org/eslint-config';

// import eslint from '@eslint/js';
// import tseslint from 'typescript-eslint';
// import prettier from 'eslint-plugin-prettier';
// import prettierConfig from 'eslint-config-prettier';

// export default tseslint.config(
//   eslint.configs.recommended,
//   ...tseslint.configs.recommended,
//   prettierConfig, // turns off formatting rules
//   {
//     plugins: {
//       prettier,
//     },
//     rules: {
//       'prettier/prettier': 'error', // ← makes Prettier violations ESLint errors
//       // add your own rules here
//       '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//       '@typescript-eslint/explicit-function-return-type': 'off',
//       // ...
//     },
//   }
// );
export default [
  ...config,
  // optional repo-wide overrides or additional ignores
];
