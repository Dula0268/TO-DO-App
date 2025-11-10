require('@testing-library/jest-dom');
require('whatwg-fetch');

// Node sometimes lacks TextEncoder/TextDecoder globals
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// Mock fetch API for tests instead of using MSW (avoids ESM issues)
global.fetch = jest.fn();

beforeEach(() => {
  // Reset fetch mock before each test
  global.fetch.mockClear();
});