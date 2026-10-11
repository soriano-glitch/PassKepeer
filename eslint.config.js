// Flat config placeholder: install eslint-config-expo for full rules.
// Phase 1 enforces no-explicit-any and fail-closed storage via review.
const config = [
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;
