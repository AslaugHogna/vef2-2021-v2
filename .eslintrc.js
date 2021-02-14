module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  rules: {
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': ['error', {packageDir: './'}],
    'no-console': ['error', {allow: ['info', 'warn', 'error'] }],
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  
};
