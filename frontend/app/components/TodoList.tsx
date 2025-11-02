"use client";

import { useState } from 'react';
import { deleteTodo, toggleTodo } from '@/app/lib/api';
import type { Todo, Priority } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onTodoDeleted: () => void;
  onEditClick: (todo: Todo) => void;
  loading: boolean;
}

// Helper function to render priority badge with colored labels
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    LOW: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      emoji: '🟢'
    },
    MEDIUM: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      emoji: '🟡'
    },
    HIGH: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      emoji: '🔴'
    }
  };

  const style = styles[priority] || styles.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      <span>{style.emoji}</span>
      <span>{priority}</span>
    </span>
  );
};

// Helper function to group todos by priority
const groupTodosByPriority = (todos: Todo[]) => {
  const grouped = {
    HIGH: [] as Todo[],
    MEDIUM: [] as Todo[],
    LOW: [] as Todo[]
  };

  todos.forEach(todo => {
    const priority = todo.priority || 'MEDIUM';
    grouped[priority].push(todo);
  });

  return grouped;
};

export default function TodoList({
  todos,
  onTodoDeleted,
  onEditClick,
  loading,
}: TodoListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;

    setDeleting(id);
    try {
      await deleteTodo(id);
      onTodoDeleted();
    } catch (err) {
      alert('Failed to delete todo');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed);
      onTodoDeleted();
    } catch (err) {
      alert('Failed to update todo');
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

  const groupedTodos = groupTodosByPriority(todos);
  const priorityOrder: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];

  // Component to render a single todo item
  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex items-start gap-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => handleToggle(todo)}
        className="mt-1 w-5 h-5 text-blue-600 rounded"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={`font-semibold text-lg ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {todo.title}
          </h3>
          {viewMode === 'flat' && <PriorityBadge priority={todo.priority} />}
        </div>
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
          onClick={() => handleDelete(todo.id)}
          disabled={deleting === todo.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition disabled:opacity-50"
        >
          {deleting === todo.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Toggle button for view mode */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          My Todos ({todos.length})
        </h2>
        <button
          onClick={() => setViewMode(viewMode === 'flat' ? 'grouped' : 'flat')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>{viewMode === 'flat' ? '📊' : '📋'}</span>
          <span>{viewMode === 'flat' ? 'Group by Priority' : 'Show All'}</span>
        </button>
      </div>

      {viewMode === 'grouped' ? (
        // Grouped view
        <div className="space-y-6">
          {priorityOrder.map(priority => {
            const todosInGroup = groupedTodos[priority];
            if (todosInGroup.length === 0) return null;

            return (
              <div key={priority}>
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-gray-200">
                  <PriorityBadge priority={priority} />
                  <h3 className="text-lg font-semibold text-gray-700">
                    {priority} Priority
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    ({todosInGroup.length} {todosInGroup.length === 1 ? 'todo' : 'todos'})
                  </span>
                </div>

                {/* Todos in this group */}
                <div className="space-y-3 pl-2">
                  {todosInGroup.map(todo => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat view
        <div className="space-y-3">
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}