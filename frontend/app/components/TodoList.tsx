"use client";

import { useState } from 'react';
import { deleteTodo, toggleTodo } from '@/app/lib/api';
import type { Todo } from '@/types/todo';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ToastContainer from './ToastContainer'; // ADD THIS IMPORT
import { useToast } from '@/app/hooks/useToast'; // ADD THIS IMPORT

interface TodoListProps {
  todos: Todo[];
  onTodoDeleted: () => void;
  onEditClick: (todo: Todo) => void;
  loading: boolean;
}

export default function TodoList({
  todos,
  onTodoDeleted,
  onEditClick,
  loading,
}: TodoListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<{id: number, title: string} | null>(null);
  const { toasts, addToast, removeToast } = useToast(); // ADD THIS

  // UPDATED DELETE HANDLER WITH TOASTS
  const handleDeleteClick = (todo: Todo) => {
    setTodoToDelete({ id: todo.id, title: todo.title });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!todoToDelete) return;

    setDeleting(todoToDelete.id);
    setShowDeleteModal(false);
    
    try {
      await deleteTodo(todoToDelete.id);
      onTodoDeleted();
      addToast(`Todo "${todoToDelete.title}" deleted successfully!`, 'success'); // ADD TOAST
    } catch (err) {
      addToast('Failed to delete todo', 'error'); // ADD TOAST
    } finally {
      setDeleting(null);
      setTodoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTodoToDelete(null);
  };

  // UPDATED TOGGLE HANDLER WITH TOASTS
  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed);
      onTodoDeleted();
      addToast(`Todo "${todo.title}" ${!todo.completed ? 'completed' : 'marked as pending'}!`, 'success');
    } catch (err) {
      addToast('Failed to update todo', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600">
        <p>No todos yet. Create one to get started! 🎉</p>
      </div>
    );
  }

  return (
    <>
      {/* ADD THE MODAL */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        todoTitle={todoToDelete?.title || ''}
      />

      {/* ADD TOAST CONTAINER */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-start gap-3"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo)}
              className="mt-1 w-5 h-5 text-blue-600 rounded"
            />

            <div className="flex-1">
              <h3
                className={`font-semibold text-lg ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className={todo.completed ? 'text-gray-300' : 'text-gray-600'}>
                  {todo.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEditClick(todo)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(todo)}
                disabled={deleting === todo.id}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition disabled:opacity-50"
              >
                {deleting === todo.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}