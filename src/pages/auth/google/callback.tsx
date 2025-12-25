"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../lib/auth';

export default function GoogleCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL query parameters
        const { accessToken, refreshToken } = router.query;

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setError('Missing authentication tokens');
          return;
        }

        // Store tokens
        auth.setTokens(accessToken as string, refreshToken as string);

        // Fetch user data
        const response = await auth.getMe(accessToken as string);
        auth.setUser(response.data);

        setStatus('success');

        // Redirect to home after a short delay with full page reload
        // This ensures AuthContext re-initializes with the new tokens
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err: any) {
        console.error('Google callback error:', err);
        setStatus('error');
        setError(err.message || 'Authentication failed');

        // Redirect to login after error with full page reload
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ffd700',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '0.5rem'
            }}>
              Completing Sign In
            </h2>
            <p style={{
              color: '#666',
              fontSize: '0.95rem'
            }}>
              Please wait while we authenticate your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4CAF50',
              marginBottom: '0.5rem'
            }}>
              Success!
            </h2>
            <p style={{
              color: '#666',
              fontSize: '0.95rem'
            }}>
              Redirecting you to the home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f44336, #d32f2f)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f44336',
              marginBottom: '0.5rem'
            }}>
              Authentication Failed
            </h2>
            <p style={{
              color: '#666',
              fontSize: '0.95rem',
              marginBottom: '0.5rem'
            }}>
              {error}
            </p>
            <p style={{
              color: '#999',
              fontSize: '0.85rem'
            }}>
              Redirecting to login...
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
