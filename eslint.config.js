import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier'; // Import Prettier configuration
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Import Prettier plugin

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'vite.config.ts',
      'postcss.config.mjs',
      'eslint.config.js',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier, // Extend Prettier configuration
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': eslintPluginPrettier, // Add Prettier plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'eqeqeq': ['error', 'always'], // Require the use of === and !==
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
      'prettier/prettier': [
        'error', // Enable Prettier rules as ESLint errors
        {
          "trailingComma": "all",
          "tabWidth": 2,
          "printWidth": 80,
          "semi": true,
          "singleQuote": true,
          "jsxSingleQuote": false,
          "endOfLine": "crlf",
          "plugins": ["prettier-plugin-tailwindcss"]
        },
      ],
    },
  },
);

