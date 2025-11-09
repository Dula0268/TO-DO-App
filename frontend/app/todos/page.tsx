"use client";

import TodoSkeleton from "@/components/TodoSkeleton";

import { useEffect, useState } from 'react';
import PrivateRoute from '@/app/components/PrivateRoute';
import Navbar from '@/app/components/Navbar';
import { getTodos } from '@/app/lib/api';
import type { Todo, Priority } from '@/types/todo';
import TodoList from '@/app/components/TodoList';
import TodoForm from '@/app/components/TodoForm';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  
  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Priority>('ALL');
  const [completedFilter, setCompletedFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      // getTodos() returns an Axios response object. Extract .data
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

  // Filter todos based on selected filters
  const filteredTodos = todos.filter((todo) => {
    // Priority filter
    if (priorityFilter !== 'ALL' && todo.priority !== priorityFilter) {
      return false;
    }
    
    // Completed filter
    if (completedFilter === 'COMPLETED' && !todo.completed) {
      return false;
    }
    if (completedFilter === 'PENDING' && todo.completed) {
      return false;
    }
    
    return true;
  });

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
              <p className="font-semibold">⚠ {error}</p>
              <button
                onClick={fetchTodos}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
              >
                {loading ? 'Fetching...' : 'Refresh'}
              </button>
            </div>
          )}

          {error && <div className="mb-4 text-red-600">{error}</div>}

          {/* Filter Controls */}
          {!loading && todos.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filters</h3>
              <div className="flex flex-wrap gap-4">
                {/* Priority Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | Priority)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="HIGH">🔴 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">🟢 Low</option>
                  </select>
                </div>

                {/* Completed Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={completedFilter}
                    onChange={(e) => setCompletedFilter(e.target.value as 'ALL' | 'COMPLETED' | 'PENDING')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">⏳ Pending</option>
                    <option value="COMPLETED">✅ Completed</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {(priorityFilter !== 'ALL' || completedFilter !== 'ALL') && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setPriorityFilter('ALL');
                        setCompletedFilter('ALL');
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Results Summary */}
              <div className="mt-3 text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filteredTodos.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{todos.length}</span> todos
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
            <TodoSkeleton />
            <TodoSkeleton />
            <TodoSkeleton />
            </div>
      )}


          {!loading && (
            <TodoList
              todos={filteredTodos}
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