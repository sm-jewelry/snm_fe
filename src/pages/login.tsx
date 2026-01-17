"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

// ✅ Use API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Redirect to intended page or home
      const returnUrl = (router.query.returnUrl as string) || '/';
      router.push(returnUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your SNM Jewelry account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <svg className="login-error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              placeholder="••••••••"
            />
          </div>

          <div className="login-options">
            <div className="login-checkbox-wrapper">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="login-checkbox"
              />
              <label htmlFor="remember-me" className="login-checkbox-label">
                Remember me
              </label>
            </div>

            <Link href="/forgot-password" className="login-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <span className="login-button-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider-text">Or continue with</span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => window.location.href = `${API_GATEWAY_URL}/api/auth/google`}
          className="login-google-button"
        >
          <svg className="login-google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider-text">New to SNM Jewelry?</span>
        </div>

        {/* Register Link */}
        <div className="login-register">
          <Link href="/register" className="login-register-link">
            Create an account
          </Link>
        </div>
      </div>

      {/* Back to Home */}
      <div className="login-back">
        <Link href="/" className="login-back-link">
          <svg className="login-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
