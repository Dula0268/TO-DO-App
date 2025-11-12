"use client";
import React, { useState, useRef } from 'react';
import { AiOutlineExclamationCircle, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { createPortal } from 'react-dom';
// todoAPI import removed since we're using mock data for now

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, title: 'Learn Next.js', description: 'Study frontend framework', status: 'PENDING', createdAt: '2024-01-15' },
    { id: 2, title: 'Build Todo App', description: 'Complete university project', status: 'COMPLETED', createdAt: '2024-01-14' },
    { id: 3, title: 'Deploy Project', description: 'Deploy to production', status: 'PENDING', createdAt: '2024-01-16' }
  ]);

  // DELETE FUNCTIONALITY - YOUR MAIN TASK
  const [confirmState, setConfirmState] = useState({ visible: false, message: '' });
  const confirmResolve = useRef(null);

  const showConfirmToast = (message) => {
    return new Promise((resolve) => {
      confirmResolve.current = resolve;
      setConfirmState({ visible: true, message });
    });
  };

  const closeConfirm = (result) => {
    setConfirmState({ visible: false, message: '' });
    if (confirmResolve.current) {
      confirmResolve.current(result);
      confirmResolve.current = null;
    }
  };

  const handleDelete = async (todoId) => {
    // Confirmation popup (center of page)
    const confirmed = await showConfirmToast('Are you sure you want to delete this todo?');
    if (!confirmed) return;

    try {
      // MOCK SUCCESS - Remove this when backend is ready
      console.log('Mock delete called for todo:', todoId);
      
      // Update UI without refresh - FIXED: using functional update
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      
      // Success notification
      alert('✅ Todo deleted successfully!');
      
      // UNCOMMENT THIS WHEN BACKEND IS READY:
      // await todoAPI.deleteTodo(todoId);
      // setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      // alert('✅ Todo deleted successfully!');
      
    } catch (error) {
      alert('❌ Error deleting todo: ' + error.message);
    }
  };

  // Portal-mounted confirm modal so it always centers on the viewport
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const ConfirmModal = (confirmState.visible && portalTarget)
    ? createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={() => closeConfirm(false)} />
        <div className="relative bg-white rounded-lg p-5 shadow-lg w-full max-w-sm mx-4">
          <div className="flex items-start gap-3">
            <AiOutlineExclamationCircle className="text-2xl text-yellow-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-800">{confirmState.message}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => closeConfirm(false)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-100">Cancel <AiOutlineClose /></button>
                <button onClick={() => closeConfirm(true)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500 text-white">Delete <AiOutlineCheck /></button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      portalTarget
    )
    : null;

  // (Removed duplicate toast-based confirm - using portal modal implementation above)

  return (
    <>
      {ConfirmModal}
      <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">My Todo List</h1>
      
      {todos.length === 0 ? (
        <p className="text-center text-gray-500">No todos found. Add a new todo!</p>
      ) : (
        <div className="space-y-4">
          {todos.map(todo => (
            <div key={todo.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{todo.title}</h3>
                  <p className="text-gray-600 mt-1">{todo.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      todo.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {todo.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {todo.createdAt}
                    </span>
                  </div>
                </div>
                
                {/* DELETE BUTTON - YOUR TASK 6 */}
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  title="Delete todo"
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}