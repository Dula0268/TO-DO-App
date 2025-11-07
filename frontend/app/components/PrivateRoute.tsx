'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as { exp?: number; [key: string]: any };
  } catch (e) {
    return null;
  }
}

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          router.replace('/login');
          return;
        }

        // Quick client-side expiry check
        const payload = parseJwt(token);
        if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }

        // Server-side validation: call /api/auth/verify with explicit header
        await api.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mounted) setIsAuthenticated(true);
      } catch (e) {
        // any error -> remove token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        router.replace('/login');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}