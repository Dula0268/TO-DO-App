import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ✅ FIX: Define proper types
interface TodoPayload {
  title: string;
  description?: string;
  completed?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const login = (email: string, password: string) => {
  return api.post('/api/auth/login', { email, password });
};

export const register = (name: string, email: string, password: string) => {
  return api.post('/api/auth/register', { name, email, password });
};

export const getTodos = () => {
  return api.get('/api/todos');
};

export const addTodo = (title: string, description: string = '') => {
  return api.post('/api/todos', { title, description, completed: false });
};

// ✅ FIX: Use proper type instead of 'any'
export const updateTodo = (id: number, todo: Partial<TodoPayload>) => {
  return api.put(`/api/todos/${id}`, todo);
};

export const deleteTodo = (id: number) => {
  return api.delete(`/api/todos/${id}`);
};

export const toggleTodo = (id: number, completed: boolean) => {
  return api.put(`/api/todos/${id}`, { completed });
};

export default api;