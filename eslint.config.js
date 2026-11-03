import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['*.config.js', 'src/**/*.test.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/domain/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react-dom*',
            'three',
            '@react-three/*',
            'echarts*',
            '**/app/**',
            '**/ui/**',
            '**/features/**',
            '**/infrastructure/**',
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{js,jsx}', 'src/features/scene/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/app/**', '**/infrastructure/data/**', '**/infrastructure/repositories/**'],
        },
      ],
    },
  },
  {
    files: ['src/app/hooks/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['**/ui/**', '**/features/**', '**/infrastructure/**'] },
      ],
    },
  },
];
