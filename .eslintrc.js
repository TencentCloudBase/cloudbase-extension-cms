module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    // Your environments (which contains several predefined global variables)
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
  },
  globals: {
    REACT_APP_ENV: true,
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
  },
  rules: {
    complexity: 'off',
    'max-params': ['error', 4],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    'prefer-promise-reject-errors': 'off',
  },
}
