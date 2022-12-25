module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'turbo',
  ],
  ignorePatterns: ['dist', 'node_modules', '.sanity'],
  env: {
    browser: true,
    node: true,
  },
  rules: {},
};
