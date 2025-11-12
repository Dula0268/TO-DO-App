"use client";

import { useState, useRef } from 'react';
import { deleteTodo, toggleTodo } from '@/app/lib/api';
import type { Todo, Priority } from '@/types/todo';
import { GoDotFill } from "react-icons/go";
import { MdViewList, MdOutlineStackedBarChart } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import toast from "react-hot-toast";
import { AiOutlineExclamationCircle, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { createPortal } from 'react-dom';

interface TodoListProps {
  todos: Todo[];
  onTodoDeleted: () => void;
  onEditClick: (todo: Todo) => void;
  loading: boolean;
}

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    LOW:    { bg: 'bg-linear-to-r from-green-100 to-green-50',  text: 'text-green-800',  border: 'border-green-300',  dot: 'text-green-500' },
    MEDIUM: { bg: 'bg-linear-to-r from-yellow-100 to-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'text-yellow-500' },
    HIGH:   { bg: 'bg-linear-to-r from-red-100 to-red-50',    text: 'text-red-800',    border: 'border-red-300',    dot: 'text-red-500' },
  };
  const style = colors[priority] || colors.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${style.bg} ${style.text} ${style.border}`}>
      <GoDotFill className={`${style.dot} text-sm animate-pulse`} aria-hidden />
      <span>{priority}</span>
    </span>
  );
};

const groupTodosByPriority = (todos: Todo[]) => {
  const grouped = { HIGH: [] as Todo[], MEDIUM: [] as Todo[], LOW: [] as Todo[] };
  todos.forEach(todo => {
    const p = todo.priority || 'MEDIUM';
    grouped[p].push(todo);
  });
  return grouped;
};

export default function TodoList({ todos, onTodoDeleted, onEditClick, loading }: TodoListProps) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');

  const [confirmState, setConfirmState] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const confirmResolve = useRef<((value: boolean) => void) | null>(null);

  const showConfirmToast = (message: string) => {
    return new Promise<boolean>((resolve) => {
      confirmResolve.current = resolve;
      setConfirmState({ visible: true, message });
    });
  };

  const closeConfirm = (result: boolean) => {
    setConfirmState({ visible: false, message: '' });
    if (confirmResolve.current) {
      confirmResolve.current(result);
      confirmResolve.current = null;
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmToast('🗑 Are you sure you want to delete this todo?');
    if (!confirmed) return;
    setDeleting(id);
    try {
      await deleteTodo(id);
      onTodoDeleted();
      toast.success(' Todo deleted successfully!');
    } catch {
      toast.error('❌ Failed to delete todo');
    } finally {
      setDeleting(null);
    }
  };

  // Portal-mounted confirm modal so it always centers on the viewport
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const ConfirmModal = (confirmState.visible && portalTarget)
    ? createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={() => closeConfirm(false)} />
        <div className="relative bg-white rounded-xl p-6 shadow-lg w-full max-w-md mx-4">
          <div className="flex items-start gap-4">
            <AiOutlineExclamationCircle className="text-3xl text-yellow-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-800">{confirmState.message}</p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => closeConfirm(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-sm font-medium"
                >
                  <AiOutlineClose />
                  Cancel
                </button>
                <button
                  onClick={() => closeConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 text-white text-sm font-bold"
                >
                  <AiOutlineCheck />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      portalTarget
    )
    : null;

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed);
      onTodoDeleted();
    } catch {
      toast.error('❌ Failed to update todo');
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <CgSpinner className="mx-auto h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow ring-1 ring-gray-200">
        <p>No todos yet. Create one to get started!</p>
      </div>
    );
  }

  const groupedTodos = groupTodosByPriority(todos);
  const priorityOrder: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];

  const cardColor = (priority: Priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-gradient-to-br from-red-50 to-white hover:from-red-100 hover:to-red-50 ring-red-200 border-l-4 border-red-400';
      case 'MEDIUM': return 'bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100 hover:to-yellow-50 ring-yellow-200 border-l-4 border-yellow-400';
      case 'LOW': return 'bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-green-50 ring-green-200 border-l-4 border-green-400';
      default: return 'bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 ring-gray-200 border-l-4 border-gray-400';
    }
  };

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div className={`flex items-start gap-4 rounded-xl p-5 shadow-md ring-1 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${cardColor(todo.priority)}`}>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={`text-lg font-bold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </h3>
          {viewMode === 'flat' && <PriorityBadge priority={todo.priority} />}
        </div>
        {todo.description && (
          <p className={`text-sm leading-relaxed ${todo.completed ? 'text-gray-400 italic' : 'text-gray-600'}`}>
            {todo.description}
          </p>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        <button onClick={() => onEditClick(todo)} className="group rounded-lg bg-linear-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          ✏ Edit
        </button>
        <button onClick={() => handleDelete(todo.id)} disabled={deleting === todo.id} className="group rounded-lg bg-linear-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50">
          {deleting === todo.id ? '⏳' : '🗑 Delete'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {ConfirmModal}
      <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b-2 border-linear-to-r from-purple-200 to-pink-200">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">My Todos</h2>
          <p className="text-sm text-gray-500 mt-1">
            You have <span className="font-bold text-purple-600">{todos.length}</span> {todos.length === 1 ? 'todo' : 'todos'}
          </p>
        </div>
        <button onClick={() => setViewMode(viewMode === 'flat' ? 'grouped' : 'flat')} className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 via-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
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
        <div className="space-y-8">
          {priorityOrder.map(priority => {
            const todosInGroup = groupedTodos[priority];
            if (!todosInGroup.length) return null;
            return (
              <div key={priority} className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 pb-4">
                  <PriorityBadge priority={priority} />
                  <h3 className="text-xl font-extrabold text-gray-800">{priority} Priority</h3>
                  <span className="ml-auto text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{todosInGroup.length} {todosInGroup.length === 1 ? 'todo' : 'todos'}</span>
                </div>
                <div className="space-y-4">{todosInGroup.map(todo => <TodoItem key={todo.id} todo={todo} />)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}</div>
      )}
      </div>
    </>
  );
}
