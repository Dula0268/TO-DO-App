'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  name?: string;
  email?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // If no explicit `user` object is stored, consider the user authenticated
    // when a JWT is present in localStorage under `token`.
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Listen for cross-tab auth changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue);
        if (!e.newValue) {
          setUser(null);
        }
      }
      if (e.key === 'user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // If we're authenticated but don't have a user object, try to fetch the
  // subject (email) from the backend verify endpoint and populate `user`.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated || user || !token) return;

    // lightweight fetch with Authorization header
    (async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8080';
        const resp = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return; // verification failed
        const body = await resp.json();
        const subject = body?.subject;
        const nameFromServer = body?.name;
        if (subject) {
          const name = nameFromServer || subject.split('@')[0];
          const u = { name, email: subject };
          localStorage.setItem('user', JSON.stringify(u));
          setUser(u);
        }
      } catch (e) {
        // silent: don't break the navbar if verify fails
        // add a console.debug to aid local troubleshooting
        // eslint-disable-next-line no-console
        console.debug('Navbar verify failed', e);
      }
    })();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">📝 Todo App</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Welcome, {user?.name || 'User'}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}