"use client";

import { useEffect, useState } from 'react';
import PrivateRoute from '@/app/components/PrivateRoute';
import Navbar from '@/app/components/Navbar';
import { getTodos } from '@/app/lib/api';

interface Todo {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTodos();
      const data = res?.data;
      if (Array.isArray(data)) setTodos(data);
      else setTodos([]);
      setLastFetchedAt(new Date().toLocaleString());
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch todos');
      setTodos(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PrivateRoute>
      <Navbar />
      <main className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Todos</h1>
            <div>
              <button
                onClick={fetchTodos}
                disabled={loading}
                className={`px-3 py-1 rounded bg-blue-600 text-white ${
                  loading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Fetching...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 text-red-600">{error}</div>}

          {todos && todos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todos.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.completed ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : todos && todos.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No todos found.</div>
          ) : (
            <div className="text-center text-gray-500 py-6">No fetch result yet</div>
          )}

          {lastFetchedAt && <p className="text-sm text-gray-400 mt-4">Last fetched: {lastFetchedAt}</p>}
        </div>
      </main>
    </PrivateRoute>
  );
}