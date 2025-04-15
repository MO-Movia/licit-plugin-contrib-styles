const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    strict: false,
  }),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      'sonarjs/updated-loop-counter': 'warn',
      'sonarjs/cognitive-complexity': 'warn',
    },
  },
];
