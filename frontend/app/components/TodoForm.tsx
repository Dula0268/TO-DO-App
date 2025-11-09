"use client";

import { useState, useEffect } from "react";
import { addTodo, updateTodo } from "@/app/lib/api";
import toast from "react-hot-toast";
import type { Todo } from "@/types/todo";

// icons
import { GoDotFill } from "react-icons/go";
import { CgSpinner } from "react-icons/cg";
import FormError from "./FormError";  // ✅ same-folder import

interface TodoFormProps {
  onTodoAdded: () => void;
  editingTodo?: Todo | null;
  onEditComplete: () => void;
}

function priorityColor(p: "LOW" | "MEDIUM" | "HIGH") {
  switch (p) {
    case "LOW":
      return "text-green-500";
    case "MEDIUM":
      return "text-yellow-500";
    case "HIGH":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export default function TodoForm({
  onTodoAdded,
  editingTodo,
  onEditComplete,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [loading, setLoading] = useState(false);

  // ✅ field-specific error UNDER the input with fade animation
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setPriority(editingTodo.priority || "MEDIUM");
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
    }
    setFieldError("");
  }, [editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setLoading(true);

    // ✅ Field Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldError("Title is required");
      toast.error("Please provide a title for the todo");
      setLoading(false);
      return;
    }
    if (trimmedTitle.length < 3) {
      setFieldError("Title must be at least 3 characters");
      toast.error("Title must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      if (editingTodo?.id) {
        await updateTodo(editingTodo.id, { title, description, priority });
        onEditComplete();
        toast.success("Todo updated");
      } else {
        await addTodo(title, description, priority);
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        toast.success("Todo added");
      }
      onTodoAdded();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save todo";
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">
        {editingTodo?.id ? "Edit Todo" : "Create New Todo"}
      </h2>

      {/* ✅ Title */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Title <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:border-blue-500"
        />

        {/* ✅ field-specific error with smooth fade */}
        <FormError message={fieldError} />
      </div>

      {/* ✅ Description (no validation needed) */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter todo description..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* ✅ Priority */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Priority <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <GoDotFill className={`text-xl ${priorityColor(priority)}`} />
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* ✅ Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg 
                     transition disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading && <CgSpinner className="animate-spin h-5 w-5" />}
          {editingTodo?.id ? "Update Todo" : "Add Todo"}
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
