"use client";

import { useState } from 'react';
import { deleteTodo, toggleTodo } from '@/app/lib/api';
import type { Todo, Priority } from '@/types/todo';
import { GoDotFill } from "react-icons/go";
import { MdViewList, MdOutlineStackedBarChart } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";

interface TodoListProps {
  todos: Todo[];
  onTodoDeleted: () => void;
  onEditClick: (todo: Todo) => void;
  loading: boolean;
}

// 🎨 priority badge
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    LOW: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      dot: 'text-green-500',
    },
    MEDIUM: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      dot: 'text-yellow-500',
    },
    HIGH: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      dot: 'text-red-500',
    },
  };
  const style = colors[priority] || colors.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      <GoDotFill className={`${style.dot} text-sm`} aria-hidden />
      <span>{priority}</span>
    </span>
  );
};

// group helper
const groupTodosByPriority = (todos: Todo[]) => {
  const grouped = { HIGH: [] as Todo[], MEDIUM: [] as Todo[], LOW: [] as Todo[] };
  todos.forEach(todo => {
    const p = todo.priority || 'MEDIUM';
    grouped[p].push(todo);
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
    } catch {
      alert('Failed to delete todo');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed);
      onTodoDeleted();
    } catch {
      alert('Failed to update todo');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <CgSpinner className="animate-spin w-10 h-10 text-blue-600 mx-auto" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600">
        <p>No todos yet. Create one to get started!</p>
      </div>
    );
  }

  const groupedTodos = groupTodosByPriority(todos);
  const priorityOrder: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];

  // 🧩 each card gets a soft color tint
  const cardColor = (priority: Priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 hover:bg-red-100';
      case 'MEDIUM':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'LOW':
        return 'bg-green-50 hover:bg-green-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  // Todo item
  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div
      className={`${cardColor(
        todo.priority
      )} p-4 rounded-lg shadow-sm hover:shadow-md transition flex items-start gap-3`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => handleToggle(todo)}
        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
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
          <p
            className={`text-sm ${
              todo.completed ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {todo.description}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEditClick(todo)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded transition"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(todo.id)}
          disabled={deleting === todo.id}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition disabled:opacity-50"
        >
          {deleting === todo.id ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header + toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          My Todos ({todos.length})
        </h2>
        <button
          onClick={() => setViewMode(viewMode === 'flat' ? 'grouped' : 'flat')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          {viewMode === 'flat' ? (
            <>
              <MdOutlineStackedBarChart className="text-xl" />
              <span>Group by Priority</span>
            </>
          ) : (
            <>
              <MdViewList className="text-xl" />
              <span>Show All</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'grouped' ? (
        <div className="space-y-6">
          {priorityOrder.map(priority => {
            const todosInGroup = groupedTodos[priority];
            if (todosInGroup.length === 0) return null;

            return (
              <div key={priority}>
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                  <PriorityBadge priority={priority} />
                  <h3 className="text-lg font-semibold text-gray-700">
                    {priority} Priority
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    ({todosInGroup.length}{' '}
                    {todosInGroup.length === 1 ? 'todo' : 'todos'})
                  </span>
                </div>

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
        <div className="space-y-3">
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
