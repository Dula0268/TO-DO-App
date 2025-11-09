"use client";

import { useState, useEffect } from 'react';
import { addTodo, updateTodo } from '@/app/lib/api';
import toast from 'react-hot-toast';
import type { Todo } from '@/types/todo';

// icons
import { GoDotFill } from "react-icons/go";
import { CgSpinner } from "react-icons/cg";
import { MdEditNote, MdAddCircleOutline } from "react-icons/md";

/** color helper */
function priorityColor(p: 'LOW' | 'MEDIUM' | 'HIGH') {
  switch (p) {
    case 'LOW': return 'text-green-500';
    case 'MEDIUM': return 'text-yellow-500';
    case 'HIGH': return 'text-red-500';
    default: return 'text-gray-400';
  }
}

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

  // sync form with editing state
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
      const msg = err?.response?.data?.message || 'Failed to save todo';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(editingTodo?.id);

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-white p-6 shadow ring-1 ring-gray-200">
      {/* heading w/ shade */}
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
          {isEditing ? <MdEditNote /> : <MdAddCircleOutline />}
        </span>
        <span className="drop-shadow-sm">{isEditing ? 'Edit Todo' : 'Create New Todo'}</span>
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block font-semibold text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title..."
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none ring-blue-500 transition focus:ring-2"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none ring-blue-500 transition focus:ring-2"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold text-gray-700">
          Priority <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <GoDotFill className={`text-xl ${priorityColor(priority)}`} aria-hidden />
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 py-2 outline-none ring-blue-500 transition focus:ring-2"
            aria-label="Priority"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <CgSpinner className="h-5 w-5 animate-spin" aria-hidden />}
          {isEditing ? 'Update Todo' : 'Add Todo'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onEditComplete}
            className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 shadow-sm transition hover:bg-gray-300 hover:shadow"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
