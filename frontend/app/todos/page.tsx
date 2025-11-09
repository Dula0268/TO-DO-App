"use client";

import { useEffect, useMemo, useState } from "react";
import PrivateRoute from "@/app/components/PrivateRoute";
import { getTodos } from "@/app/lib/api";
import type { Todo, Priority } from "@/types/todo";
import TodoList from "@/app/components/TodoList";
import TodoForm from "@/app/components/TodoForm";
import TodoSkeleton from "@/components/TodoSkeleton";
import Footer from "@/app/components/Footer";

// react-icons
import { GoDotFill } from "react-icons/go";
import { MdOutlineSearch, MdRefresh, MdWarningAmber } from "react-icons/md";
import { MdPendingActions } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi";
import { TbChecklist } from "react-icons/tb";

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

  // adornments
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
      <div className="min-h-screen flex flex-col">
        <main className="relative flex-1 bg-purple-400 overflow-hidden py-12 px-4 flex items-center justify-center">
          {/* floating shapes */}
          <div className="absolute w-60 h-60 rounded-xl bg-purple-300 -top-5 -left-16 rotate-45 hidden md:block" />
          <div className="absolute w-48 h-48 rounded-xl bg-purple-300 -bottom-6 -right-10 rotate-12 hidden md:block" />
          <div className="absolute w-40 h-40 bg-purple-300 rounded-full top-0 right-12 hidden md:block" />
          <div className="absolute w-20 h-40 bg-purple-300 rounded-full bottom-20 left-10 rotate-45 hidden md:block" />

          {/* main content */}
          <div className="relative z-20 container mx-auto max-w-7xl w-full">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-xl">
                  <TbChecklist className="text-2xl" />
                </span>
                <span>My Todos</span>
              </h1>
              {lastFetchedAt && (
                <p className="mt-2 text-sm text-white/80">Last updated: {lastFetchedAt}</p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column - Todo Form */}
              <div className="lg:col-span-1 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl w-full">
                  <div className="px-8 md:px-10 py-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                      {editingTodo ? 'Edit Todo' : 'Create New Todo'}
                    </h2>
                    <TodoForm
                      onTodoAdded={handleTodoAdded}
                      editingTodo={editingTodo}
                      onEditComplete={() => setEditingTodo(null)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Filters and Todo List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Error */}
                {error && !loading && (
                  <div className="bg-yellow-50 text-yellow-900 p-6 rounded-2xl border border-yellow-200 shadow-xl">
                    <p className="font-semibold flex items-center gap-2">
                      <MdWarningAmber className="text-xl" aria-hidden />
                      {error}
                    </p>
                    <button
                      onClick={fetchTodos}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white shadow-md transition hover:bg-yellow-700 hover:shadow-lg"
                    >
                      <MdRefresh className="text-lg" aria-hidden />
                      Refresh
                    </button>
                  </div>
                )}

                {/* Filters Card */}
                {!loading && todos.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl">
                    <div className="px-8 md:px-10 py-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
                        <MdOutlineSearch className="text-2xl" aria-hidden />
                        Filters
                      </h3>

                      <div className="space-y-4">
                        {/* Priority */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Priority
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              {PriorityAdornment}
                            </div>
                            <select
                              value={priorityFilter}
                              onChange={(e) => setPriorityFilter(e.target.value as "ALL" | Priority)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 py-2.5 text-sm outline-none ring-purple-500 transition focus:ring-2"
                            >
                              <option value="ALL">All Priorities</option>
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                            </select>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 py-2.5 text-sm outline-none ring-purple-500 transition focus:ring-2"
                            >
                              <option value="ALL">All Status</option>
                              <option value="PENDING">Pending</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                        </div>

                        {/* Clear Filters Button */}
                        {(priorityFilter !== "ALL" || completedFilter !== "ALL") && (
                          <button
                            onClick={() => {
                              setPriorityFilter("ALL");
                              setCompletedFilter("ALL");
                            }}
                            className="w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300 hover:shadow"
                          >
                            Clear Filters
                          </button>
                        )}

                        {/* Results Count */}
                        <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                          Showing{" "}
                          <span className="font-bold text-gray-900">{filteredTodos.length}</span> of{" "}
                          <span className="font-bold text-gray-900">{todos.length}</span> todos
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Todo List Card */}
                <div className="bg-white rounded-2xl shadow-xl">
                  <div className="px-8 md:px-10 py-8">
                    <h3 className="mb-6 text-xl font-bold text-gray-800">
                      {loading ? 'Loading...' : 'My Todos'}
                    </h3>

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
                          <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-600 border border-gray-200">
                            {todos.length === 0 
                              ? 'No todos yet. Create your first todo!'
                              : 'No todos match your filter.'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}