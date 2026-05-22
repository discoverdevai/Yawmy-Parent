// Flat config preset shared by all workspaces.
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const tailwind = require('eslint-plugin-tailwindcss');
const i18next = require('eslint-plugin-i18next');
const nms = require('eslint-plugin-nms');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      tailwindcss: tailwind,
      i18next,
      nms,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',
      'i18next/no-literal-string': [
        'warn',
        { markupOnly: true, ignoreAttribute: ['testID', 'accessibilityLabel'] },
      ],
      'nms/no-physical-direction': 'error',
    },
  },
  {
    ignores: ['**/node_modules/**', '**/.expo/**', '**/dist/**', '**/.turbo/**'],
  },
];
