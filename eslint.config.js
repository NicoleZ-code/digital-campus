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
    rules: {
      ...js.configs.recommended.rules,
      // if / for / while 必须使用花括号，禁止单行省略写法
      curly: ['error', 'all'],
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      ...reactHooks.configs.recommended.rules,
      // 模块边界空行：import 块之后、函数定义前后必须有空行
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: 'function' },
      ],
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
