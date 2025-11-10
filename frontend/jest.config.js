const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs|cjs)$': ['babel-jest', { rootMode: 'upward' }],
  },
  // Allow transforming all node_modules (needed for ESM packages like msw)
  // This is the most reliable approach for Windows + Jest + ESM dependencies
  transformIgnorePatterns: [
    // Empty array means transform everything, including node_modules
  ],
};

module.exports = createJestConfig(customJestConfig);
