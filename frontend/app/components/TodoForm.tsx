"use client";

import { useState, useEffect } from 'react';
import { addTodo, updateTodo } from '@/app/lib/api';
import toast from 'react-hot-toast';
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
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ FIX: Update form when editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setPriority(editingTodo.priority || 'MEDIUM');
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    }
  }, [editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      toast.error('Please provide a title for the todo');
      setLoading(false);
      return;
    }
    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters');
      toast.error('Title must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      if (editingTodo?.id) {
        await updateTodo(editingTodo.id, { title, description, priority });
        onEditComplete();
        toast.success('Todo updated');
      } else {
        await addTodo(title, description, priority);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        toast.success('Todo added');
      }
      onTodoAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save todo');
      toast.error(err.response?.data?.message || 'Failed to save todo');
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

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Priority <span className="text-red-500">*</span>
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="LOW">🟢 Low</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="HIGH">🔴 High</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 text-center"
        >
          {loading ? 'Saving...' : editingTodo?.id ? 'Update Todo' : 'Add Todo'}
        </button>
        {editingTodo?.id && (
          <button
            type="button"
            onClick={onEditComplete}
            className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}