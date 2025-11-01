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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {t.completed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : todos && todos.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No todos yet</h3>
              <p className="mt-2 text-sm text-gray-600">Get started by creating your first todo item.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={fetchTodos}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-12 w-12 mx-auto rounded-full bg-gray-200"></div>
                <div className="mt-4 h-4 w-24 mx-auto rounded bg-gray-200"></div>
                <div className="mt-2 h-3 w-48 mx-auto rounded bg-gray-200"></div>
              </div>
            </div>
          )}

          {lastFetchedAt && <p className="text-sm text-gray-400 mt-4">Last fetched: {lastFetchedAt}</p>}
        </div>
      </main>
    </PrivateRoute>
  );
}