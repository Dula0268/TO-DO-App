# Frontend Integration Testing

## Overview

This project uses **Jest** + **React Testing Library** for frontend integration testing.

## Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - DOM testing utilities  
- **@testing-library/user-event** - Realistic user interactions
- **@testing-library/jest-dom** - Custom DOM matchers
- **Babel** - Transforms TypeScript and JSX for tests

## Setup Files

- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Global test setup (loads jest-dom, polyfills)
- `babel.config.js` - Babel config for transforming test files
- `__tests__/` - Integration test files

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Writing Tests

### Example Integration Test

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '@/app/lib/api';

// Mock the API module
jest.mock('@/app/lib/api');

test('user can add a new todo', async () => {
  // Setup mocks
  const mockGetTodos = api.getTodos as jest.Mock;
  mockGetTodos.mockResolvedValue([
    { id: 1, title: 'Existing Todo', completed: false }
  ]);

  // Render component
  render(<TodoApp />);

  // Interact with UI
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText(/title/i), 'New Task');
  await user.click(screen.getByRole('button', { name: /add/i }));

  // Assert outcome
  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
```



1. **Mock API calls** - Use `jest.mock('@/app/lib/api')` to mock API module
2. **Use semantic queries** - Prefer `getByRole`, `getByPlaceholderText` over `getByTestId`
3. **User-centric assertions** - Test what users see and do, not implementation details
4. **Async handling** - Use `waitFor()` for async state updates
5. **Setup user events** - Always call `userEvent.setup()` at the start of tests

## Troubleshooting

### Tests fail with "Cannot find module"
- Ensure dependencies are installed: `npm install`
- Clear Jest cache: `npx jest --clearCache`

### Tests timeout
- Check for unresolved promises or timers
- Run with `--detectOpenHandles` to find async leaks

### DOM queries fail
- Use `screen.debug()` to inspect rendered DOM
- Check if elements are rendered conditionally or asynchronously



```yaml
- name: Run frontend tests
  working-directory: ./frontend
  run: |
    npm ci
    npm test
```

## Resources

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
