module.exports = {
  parserOptions: {
    'sourceType': 'module',
    'allowImportExportEverywhere': false,
    'codeFrame': true,
    'ecmaFeatures': {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'react/jsx-sort-props': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'consistent-return': 'error',
    'no-debugger': 'error',
    'no-invalid-regexp': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    // The following rule was being reported as misconfigured.  After correcting
    // that, it was reported as not existing at all.
    // "no-unused-expression": [true, "allow-fast-null-checks"],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'all',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
      },
    ],
    'no-var': 'error',
    'prefer-const': 'error',
    quotes: [2, 'single', {
      'avoidEscape': true
    }],
    semi: [2, 'always'],
    strict: 0,
  },
  globals: {
    'Document': true,
    'Event': false,
    'Element': false,
    'HTMLElement': false,
    'HTMLDivElement': false,
    'MouseEvent': false,
    'cancelAnimationFrame': false,
    'document': false,
    'requestAnimationFrame': false,
    'window': false,
    'CSSStyleDeclaration': false,
  },
  overrides: [{
    // enable jest globals in test files
    files: '*.test.js',
    plugins: ['jest'],
    env: {
      'jest/globals': true,
    },
  }, ]
}


/*export const parser = '@typescript-eslint/parser';
export const parserOptions = {
  'sourceType': 'module',
  'allowImportExportEverywhere': false,
  'codeFrame': true,
  'ecmaFeatures': {
      jsx: true,
    },
  };
  export const plugins = ['@typescript-eslint', 'react'];
  'extends' = [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ];
  export const rules= {
    'react/jsx-sort-props': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'consistent-return': 'error',
    'no-debugger': 'error',
    'no-invalid-regexp': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    // The following rule was being reported as misconfigured.  After correcting
    // that, it was reported as not existing at all.
    // "no-unused-expression": [true, "allow-fast-null-checks"],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'vars': 'all',
        'args': 'all',
        'ignoreRestSiblings': false,
        ' argsIgnorePattern': '^_',
      },
    ],
    'no-var': 'error',
    'prefer-const': 'error',
    quotes: [2, 'single', { 'avoidEscape': true }],
    semi: [2, 'always'],
    strict: 0,
  };
  export const globals = {
    'Document': true,
    'Event': false,
    'Element': false,
    'HTMLElement': false,
    'HTMLDivElement': false,
    'MouseEvent': false,
    'cancelAnimationFrame': false,
    'document': false,
    'requestAnimationFrame': false,
    'window': false,
    'CSSStyleDeclaration': false,
  };
  export const overrides = [
    {
      // enable jest globals in test files
      files: '*.test.ts',
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
  ];*/
