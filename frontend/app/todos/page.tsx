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
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await getTodos();
      setTodos(response.data || []);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      alert('Failed to load todos');
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

          <TodoForm
            onTodoAdded={handleTodoAdded}
            editingTodo={editingTodo}
            onEditComplete={() => setEditingTodo(null)}
          />

          <TodoList
            todos={todos}
            onTodoDeleted={handleTodoAdded}
            onEditClick={handleEditClick}
            loading={loading}
          />
        </div>
      </div>
    </PrivateRoute>
  );
}