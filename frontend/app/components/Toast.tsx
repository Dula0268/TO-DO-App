"use client";

import type { Toast as ToastType } from '@/app/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  }[toast.type];

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[toast.type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80 animate-in slide-in-from-right-full duration-500`}>
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-lg font-bold"
      >
        ×
      </button>
    </div>
  );
}