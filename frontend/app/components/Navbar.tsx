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
        ? 'fixed inset-x-0 top-0 z-40 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 backdrop-blur-sm text-white shadow-2xl border-b border-white/20'
        : 'sticky top-0 z-40 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-2xl border-b border-white/10',
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 text-2xl font-bold tracking-tight group transition-all duration-300 hover:scale-105"
              aria-label="Go to home"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/30 group-hover:bg-white/30 transition-all shadow-lg">
                  <FaTasks className="text-white text-2xl drop-shadow-lg" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
                Todo App
              </span>
            </button>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-300/50 rounded-full blur-sm"></div>
                      <BsPersonCircle className="relative text-white text-xl drop-shadow-lg" />
                    </div>
                    <span className="text-sm font-semibold text-white drop-shadow-md">
                      {user?.name || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 bg-white/20 hover:bg-white/30 text-white shadow-lg hover:shadow-xl border border-white/30 hover:scale-105 backdrop-blur-sm"
                  >
                    <FiLogOut className="text-lg" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FiLogIn className="text-lg" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 bg-white/20 hover:bg-white/30 text-white shadow-lg hover:shadow-xl border border-white/30 backdrop-blur-sm hover:scale-105"
                  >
                    <FiUserPlus className="text-lg" />
                    <span>Register</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed transparent navbar */}
      {onAuthPage && <div className="h-20" />}
    </>
  );
}
