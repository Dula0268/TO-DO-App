"use client";

import { useEffect, useState } from 'react';
import PrivateRoute from '@/app/components/PrivateRoute';
import Navbar from '@/app/components/Navbar';
import { getTodos } from '@/app/lib/api';
import type { Todo } from '@/types/todo';
import TodoList from '@/app/components/TodoList';
import TodoForm from '@/app/components/TodoForm';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      // `getTodos()` returns an Axios response object. Extract `.data`
      const resp: any = await getTodos();
  const data = resp?.data ?? resp;
  setTodos(Array.isArray(data) ? data : []);
  setLastFetchedAt(new Date().toLocaleString());
    } catch (err: any) {
      console.error('Failed to fetch todos:', err);
      const status = err?.response?.status;
      if (status === 401) {
        setError('Your session expired or you are not logged in.');
      } else if (status === 403) {
        setError('Access denied (403). Check your CORS/auth settings.');
      } else {
        // Provide a clearer hint for network-level failures
        if (err?.message === 'Network Error' || (err?.request && !err?.response)) {
          setError('Network Error: could not reach the backend. Is http://localhost:8080 running?');
        } else {
          setError('Failed to load todos. Make sure the backend is running on http://localhost:8080');
        }
      }
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false); // avoid spinner if not logged in
      return;
    }
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTodoAdded = () => {
    fetchTodos();
    setEditingTodo(null);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PrivateRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Todos</h1>

          <TodoForm
            onTodoAdded={handleTodoAdded}
            editingTodo={editingTodo}
            onEditComplete={() => setEditingTodo(null)}
          />

          {error && !loading && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6 border border-yellow-300">
              <p className="font-semibold">⚠️ {error}</p>
              <button
                onClick={fetchTodos}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
              >
                {loading ? 'Fetching...' : 'Refresh'}
              </button>
            </div>
          )}

          {error && <div className="mb-4 text-red-600">{error}</div>}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading todos...</p>
            </div>
          )}

          {!loading && (
            <TodoList
              todos={todos}
              onTodoDeleted={handleTodoAdded}
              onEditClick={handleEditClick}
              loading={loading}
            />
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
