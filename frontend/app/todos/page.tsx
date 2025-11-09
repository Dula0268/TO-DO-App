"use client";

import { useEffect, useMemo, useState } from "react";
import PrivateRoute from "@/app/components/PrivateRoute";
import { getTodos } from "@/app/lib/api";
import type { Todo, Priority } from "@/types/todo";
import TodoList from "@/app/components/TodoList";
import TodoForm from "@/app/components/TodoForm";
import TodoSkeleton from "@/components/TodoSkeleton";

// react-icons
import { GoDotFill } from "react-icons/go";
import { MdOutlineSearch, MdRefresh, MdWarningAmber } from "react-icons/md";
import { MdPendingActions } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL");
  const [completedFilter, setCompletedFilter] =
    useState<"ALL" | "COMPLETED" | "PENDING">("ALL");

  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const resp: any = await getTodos();
      const data = resp?.data ?? resp;
      setTodos(Array.isArray(data) ? data : []);
      setLastFetchedAt(new Date().toLocaleString());
    } catch (err: any) {
      console.error("Failed to fetch todos:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Your session expired or you are not logged in.");
      } else if (status === 403) {
        setError("Access denied (403). Check your CORS/auth settings.");
      } else if (err?.message === "Network Error" || (err?.request && !err?.response)) {
        setError("Network Error: could not reach the backend. Is http://localhost:8080 running?");
      } else {
        setError("Failed to load todos. Make sure the backend is running on http://localhost:8080");
      }
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false); // avoid spinner if not logged in
      return;
    }
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTodoAdded = () => {
    fetchTodos();
    setEditingTodo(null);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Apply filters
  const filteredTodos = todos.filter((todo) => {
    if (priorityFilter !== "ALL" && todo.priority !== priorityFilter) return false;
    if (completedFilter === "COMPLETED" && !todo.completed) return false;
    if (completedFilter === "PENDING" && todo.completed) return false;
    return true;
  });

  // helpers for adornments
  const PriorityAdornment = useMemo(() => {
    if (priorityFilter === "ALL") return null;
    const color =
      priorityFilter === "LOW"
        ? "text-green-500"
        : priorityFilter === "MEDIUM"
        ? "text-yellow-500"
        : "text-red-500";
    return <GoDotFill className={`text-lg ${color}`} aria-hidden />;
  }, [priorityFilter]);

  const StatusAdornment = useMemo(() => {
    if (completedFilter === "ALL") return null;
    return completedFilter === "PENDING" ? (
      <MdPendingActions className="text-lg text-gray-600" aria-hidden />
    ) : (
      <HiCheckCircle className="text-lg text-green-600" aria-hidden />
    );
  }, [completedFilter]);

  return (
    <PrivateRoute>
      {/* Navbar is global via app/layout.tsx — no need to render here */}
      <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="space-y-8">
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-4xl font-bold text-gray-800">My Todos</h1>
              {lastFetchedAt && (
                <span className="text-xs text-gray-500">Last updated: {lastFetchedAt}</span>
              )}
            </div>

            {/* Create / Edit */}
            <div className="pt-2">
              <TodoForm
                onTodoAdded={handleTodoAdded}
                editingTodo={editingTodo}
                onEditComplete={() => setEditingTodo(null)}
              />
            </div>

            {/* Error */}
            {error && !loading && (
              <div className="bg-yellow-100 text-yellow-900 p-4 rounded-lg border border-yellow-300">
                <p className="font-semibold flex items-center gap-2">
                  <MdWarningAmber className="text-xl" aria-hidden />
                  {error}
                </p>
                <button
                  onClick={fetchTodos}
                  className="mt-3 inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
                >
                  <MdRefresh className="text-lg" aria-hidden />
                  Refresh
                </button>
              </div>
            )}

            {/* Filters */}
            {!loading && todos.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MdOutlineSearch className="text-base" aria-hidden />
                  Filters
                </h3>

                <div className="flex flex-wrap gap-4">
                  {/* Priority */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Priority
                    </label>
                    <div className="relative">
                      {/* adornment */}
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        {PriorityAdornment}
                      </div>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as "ALL" | Priority)}
                        className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        {StatusAdornment}
                      </div>
                      <select
                        value={completedFilter}
                        onChange={(e) =>
                          setCompletedFilter(e.target.value as "ALL" | "COMPLETED" | "PENDING")
                        }
                        className="w-full pr-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  {(priorityFilter !== "ALL" || completedFilter !== "ALL") && (
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setPriorityFilter("ALL");
                          setCompletedFilter("ALL");
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">{filteredTodos.length}</span> of{" "}
                  <span className="font-semibold text-gray-700">{todos.length}</span> todos
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                <TodoSkeleton />
                <TodoSkeleton />
                <TodoSkeleton />
              </div>
            )}

            {/* List / Empty */}
            {!loading && (
              <>
                {filteredTodos.length > 0 ? (
                  <TodoList
                    todos={filteredTodos}
                    onTodoDeleted={handleTodoAdded}
                    onEditClick={handleEditClick}
                    loading={loading}
                  />
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow text-center text-gray-600">
                    No todos match your filter.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
