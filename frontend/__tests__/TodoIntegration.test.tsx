import React, { useEffect, useState } from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '@/app/components/TodoForm';
import TodoList from '@/app/components/TodoList';
import * as api from '@/app/lib/api';

// Mock the API module
jest.mock('@/app/lib/api');

function TestApp() {
  const [todos, setTodos] = useState<any[]>([]);

  const fetchTodos = async () => {
    const data = await api.getTodos();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <TodoForm onTodoAdded={fetchTodos} onEditComplete={() => {}} />
      <TodoList todos={todos} onTodoDeleted={fetchTodos} onEditClick={() => {}} loading={false} />
    </div>
  );
}

test('adds a new todo and displays it in the list', async () => {
  // Mock API responses
  const mockGetTodos = api.getTodos as jest.Mock;
  const mockAddTodo = api.addTodo as jest.Mock;

  // Initial getTodos returns one existing todo
  mockGetTodos.mockResolvedValueOnce([
    { id: 1, title: 'Existing Todo', completed: false, priority: 'MEDIUM', description: '' }
  ]);

  render(<TestApp />);

  // existing todo from mock
  expect(await screen.findByText('Existing Todo')).toBeInTheDocument();

  // Mock addTodo to return the new todo
  mockAddTodo.mockResolvedValueOnce({
    id: 2,
    title: 'Buy Milk',
    completed: false,
    priority: 'MEDIUM',
    description: ''
  });

  // Mock subsequent getTodos to return both todos
  mockGetTodos.mockResolvedValueOnce([
    { id: 1, title: 'Existing Todo', completed: false, priority: 'MEDIUM', description: '' },
    { id: 2, title: 'Buy Milk', completed: false, priority: 'MEDIUM', description: '' },
  ]);

  const user = userEvent.setup();

  // fill title using placeholder text (label doesn't have 'for' attribute)
  await user.type(screen.getByPlaceholderText(/Enter todo title/i), 'Buy Milk');

  // click Add Todo button
  await user.click(screen.getByRole('button', { name: /Add Todo/i }));

  // verify new todo is displayed
  await waitFor(() => {
    expect(screen.getByText('Buy Milk')).toBeInTheDocument();
  });
});
