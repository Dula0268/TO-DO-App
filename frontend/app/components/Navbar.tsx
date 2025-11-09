'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaTasks } from 'react-icons/fa'; // app logo icon
import { FiLogIn, FiUserPlus, FiLogOut } from 'react-icons/fi'; // auth icons
import { BsPersonCircle } from 'react-icons/bs'; // user avatar

interface User {
  name?: string;
  email?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Transparent navbar for auth pages
  const onAuthPage = pathname === '/login' || pathname === '/register';
  const navClass = useMemo(
    () =>
      onAuthPage
        ? 'fixed inset-x-0 top-0 z-40 bg-gradient-to-r from-indigo-500/90 to-purple-600/90 backdrop-blur text-white'
        : 'sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg',
    [onAuthPage]
  );

  /** Read auth state */
  const readAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    const u = localStorage.getItem('user');
    setUser(u ? JSON.parse(u) : null);
  };

  /** Verify token if needed */
  const verifyIfNeeded = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (user && user.email) return;

    try {
      const API_URL =
        (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8080';

      const resp = await fetch(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return;

      const body = await resp.json();
      const subject: string | undefined = body?.subject;
      const nameFromServer: string | undefined = body?.name;

      if (subject) {
        const name = nameFromServer || subject.split('@')[0];
        const u = { name, email: subject };
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      }
    } catch (e) {
      console.debug('Navbar verify failed', e);
    }
  };

  // Mount logic + listeners
  useEffect(() => {
    readAuth();
    verifyIfNeeded();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        readAuth();
        verifyIfNeeded();
      }
    };

    const onFocusOrVisible = () => {
      readAuth();
      verifyIfNeeded();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    readAuth();
    verifyIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: null }));
    router.push('/login');
  };

  return (
    <>
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-2xl font-bold tracking-tight group"
              aria-label="Go to home"
            >
              <FaTasks className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
              <span className="drop-shadow-sm">Todo App</span>
            </button>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <BsPersonCircle className="text-white/90 text-lg" />
                    <span className="text-sm font-medium text-white/90">
                      {user?.name || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
                      ${onAuthPage
                        ? 'bg-white/20 hover:bg-white/30 text-white shadow-inner'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'}`}
                  >
                    <FiLogOut className="text-base" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition
                      ${onAuthPage
                        ? 'bg-white text-purple-600 hover:bg-gray-100 shadow'
                        : 'bg-white text-blue-600 hover:bg-gray-100 shadow-sm hover:shadow-md'}`}
                  >
                    <FiLogIn />
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition
                      ${onAuthPage
                        ? 'bg-white text-purple-600 hover:bg-gray-100 shadow'
                        : 'bg-white text-blue-600 hover:bg-gray-100 shadow-sm hover:shadow-md'}`}
                  >
                    <FiUserPlus />
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed transparent navbar */}
      {onAuthPage && <div className="h-16" />}
    </>
  );
}
