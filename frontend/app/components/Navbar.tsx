'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  name?: string;
  email?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <span className="text-3xl">📝</span>
            <span className="text-xl font-bold hidden sm:inline">Todo App</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium"
            >
              🏠 Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/todos"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium"
              >
                ✅ Todos
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm bg-white/10 px-3 py-2 rounded-lg">
                  👤 {user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium shadow-md"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition font-medium shadow-md"
                >
                  🔑 Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg transition font-medium shadow-md"
                >
                  📝 Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-white/20">
            {/* Mobile Navigation Links */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg hover:bg-white/10 transition font-medium"
            >
              🏠 Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/todos"
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg hover:bg-white/10 transition font-medium"
              >
                ✅ Todos
              </Link>
            )}

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 bg-white/10 rounded-lg">
                  <span className="text-sm">👤 {user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition font-medium"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    router.push('/login');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition font-medium"
                >
                  🔑 Login
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    router.push('/register');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 transition font-medium"
                >
                  📝 Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}