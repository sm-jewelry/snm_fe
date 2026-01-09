import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface UserInfo {
  sub: string;
  email?: string;
  role?: string;
}

/**
 * Hook to protect admin routes
 * Checks if user is authenticated and has admin role
 * Redirects to appropriate page if not authorized
 */
export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          console.warn('No access token found');
          router.push('/profile');
          return;
        }

        const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
        const res = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await res.json();

        if (!res.ok || !response.success) {
          console.warn('Invalid token or authentication failed');
          router.push('/profile');
          return;
        }

        const userData = response.data;

        // Check if user has admin role
        if (userData.role !== 'admin') {
          console.warn('Access denied: Admin role required');
          alert('Access denied: This page is only accessible to administrators');
          router.push('/');
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Error checking admin access:', err);
        router.push('/profile');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  return { loading, user };
};
