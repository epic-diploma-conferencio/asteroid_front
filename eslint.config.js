import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tanstackQuery.configs['flat/recommended'],
  prettierRecommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-implicit-coercion': 'warn',
      curly: ['error', 'all'],
      'no-fallthrough': 'error',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': 'warn',
      'eol-last': ['error', 'always'],
      'object-shorthand': ['warn', 'always'],
      'prefer-template': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'prefer-arrow-callback': 'warn',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-duplicate-props': 'error',
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'import/extensions': [
        'error',
        'ignorePackages',
        { ts: 'never', tsx: 'never', js: 'never', jsx: 'never' },
      ],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'warn',
    },
  },

  {
    files: ['vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: './tsconfig.node.json',
      },
    },
  },

  {
    files: ['src/app/main.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },

  {
    ignores: [
      'dist',
      'build',
      'coverage',
      'playwright-report',
      'test-results',
      'node_modules',
      'public/mockServiceWorker.js',
    ],
  },
];
