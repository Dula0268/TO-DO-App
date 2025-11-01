"use client";

import { useState, useEffect } from 'react';
import { addTodo, updateTodo } from '@/app/lib/api';
import type { Todo } from '@/types/todo';

interface TodoFormProps {
  onTodoAdded: () => void;
  editingTodo?: Todo | null;
  onEditComplete: () => void;
}

export default function TodoForm({
  onTodoAdded,
  editingTodo,
  onEditComplete,
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ FIX: Update form when editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingTodo?.id) {
        await updateTodo(editingTodo.id, { title, description });
        onEditComplete();
      } else {
        await addTodo(title, description);
        setTitle('');
        setDescription('');
      }
      onTodoAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">
        {editingTodo?.id ? 'Edit Todo' : 'Create New Todo'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title..."
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : editingTodo?.id ? 'Update Todo' : 'Add Todo'}
        </button>
        {editingTodo?.id && (
          <button
            type="button"
            onClick={onEditComplete}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}