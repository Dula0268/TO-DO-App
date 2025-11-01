import axios, { AxiosError } from "axios";

/** ---- Types ---- */
export interface TodoPayload {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface Todo extends TodoPayload {
  id: number;
  completed: boolean;
}

/** ---- Config ---- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 5000;

/** ---- Axios instance ---- */
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials: true, // ONLY if you switch to cookie-based auth
});

/** Utility: safely set Authorization header for Axios v1 */
function setAuthHeader(headers: any, token: string) {
  if (!headers) {
    return { Authorization: `Bearer ${token}` };
  }
  // Axios v1 uses AxiosHeaders with .set()
  if (typeof headers.set === "function") {
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }
  // Fallback to plain object
  return { ...headers, Authorization: `Bearer ${token}` };
}

/** ---- Interceptors ---- */
// Attach JWT if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = setAuthHeader(config.headers, token);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401s globally (avoid loops on /api/auth/*)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = (error.config?.url || "").toString();

    if (status === 401 && !url.startsWith("/api/auth/")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Use a soft redirect to preserve SPA nav
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

/** ---- Auth ---- */
export async function login(email: string, password: string): Promise<any> {
  const { data } = await api.post('/api/auth/login', { email, password });
  // backend returns { accessToken } while some clients may expect { token }
  const token = data?.accessToken ?? data?.token;
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('token', token);
  }
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.assign("/login");
  }
}

/** ---- Todos API (return JSON, not AxiosResponse) ---- */
export async function getTodos(): Promise<Todo[]> {
  const { data } = await api.get<Todo[]>("/api/todos");
  return data;
}

export async function addTodo(title: string, description = ""): Promise<Todo> {
  const payload: TodoPayload = { title, description, completed: false };
  const { data } = await api.post<Todo>("/api/todos", payload);
  return data;
}

export async function updateTodo(id: number, todo: Partial<TodoPayload>): Promise<Todo> {
  const { data } = await api.put<Todo>(`/api/todos/${id}`, todo);
  return data;
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const { data } = await api.put<Todo>(`/api/todos/${id}`, { completed });
  return data;
}

export async function deleteTodo(id: number): Promise<void> {
  await api.delete(`/api/todos/${id}`);
}

export default api;
