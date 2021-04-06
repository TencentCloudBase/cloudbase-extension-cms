module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    browser: true,
    node: true,
  },
  globals: {
    WX_MP: true,
    SERVER_MODE: true,
    REACT_APP_ENV: true,
  },
  rules: {
    complexity: 'off',
    'max-params': ['error', 4],
    'prefer-promise-reject-errors': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
  },
}
