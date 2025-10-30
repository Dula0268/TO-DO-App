'use client';

import { useState, useEffect } from 'react';
import PrivateRoute from '@/app/components/PrivateRoute';
import Navbar from '@/app/components/Navbar';
import TodoForm from '@/app/components/TodoForm';
import TodoList from '@/app/components/TodoList';
import { getTodos } from '@/app/lib/api';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true); // ✅ FIX: Initialize to true
  const [error, setError] = useState(''); // ✅ FIX: Add error state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(''); // ✅ FIX: Clear error when fetching
      const response = await getTodos();
      setTodos(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch todos:', err);
      const errorMsg =
        err.response?.data?.message ||
        'Failed to load todos. Make sure backend is running.';
      setError(errorMsg);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleTodoAdded = () => {
    fetchTodos();
    setEditingTodo(null);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PrivateRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Todos</h1>

          {/* ✅ FIX: Add error display */}
          {error && !loading && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6 border border-yellow-300">
              <p className="font-semibold">⚠️ {error}</p>
              <p className="text-sm mt-2">
                Backend may not be running. Make sure to start your Spring Boot
                server on http://localhost:8080
              </p>
              <button
                onClick={fetchTodos}
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
              >
                Retry
              </button>
            </div>
          )}

          <TodoForm
            onTodoAdded={handleTodoAdded}
            editingTodo={editingTodo}
            onEditComplete={() => setEditingTodo(null)}
          />

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading todos...</p>
            </div>
          )}

          {!loading && (
            <TodoList
              todos={todos}
              onTodoDeleted={handleTodoAdded}
              onEditClick={handleEditClick}
              loading={false}
            />
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}