"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

// ✅ Use API Gateway URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = (): string | null => {
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      return 'Phone number must be exactly 10 digits';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      // Redirect to home after successful registration
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join SNM Jewelry and start shopping</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="register-error">
            <svg className="register-error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Name Fields */}
          <div className="register-form-row">
            <div className="register-form-group">
              <label htmlFor="firstName" className="register-label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="register-input"
                placeholder="John"
              />
            </div>
            <div className="register-form-group">
              <label htmlFor="lastName" className="register-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="register-input"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div className="register-form-group">
            <label htmlFor="email" className="register-label">
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
              className="register-input"
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div className="register-form-group">
            <label htmlFor="phone" className="register-label">
              Phone Number <span className="register-label-optional">(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleChange}
              className="register-input"
              placeholder="1234567890"
            />
            <p className="register-input-helper">10 digits, no spaces or dashes</p>
          </div>

          {/* Password */}
          <div className="register-form-group">
            <label htmlFor="password" className="register-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="register-input"
              placeholder="••••••••"
            />
            <p className="register-input-helper">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="register-input"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            <span className="register-button-text">
              {loading ? (
                <span className="register-button-spinner" />
              ) : (
                'Create Account'
              )}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="register-divider">
          <span className="register-divider-text">Or continue with</span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => window.location.href = `${API_GATEWAY_URL}/api/auth/google`}
          className="register-google-button"
        >
          <svg className="register-google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="register-divider">
          <span className="register-divider-text">Already have an account?</span>
        </div>

        {/* Login Link */}
        <div className="register-login">
          <Link href="/login" className="register-login-link">
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Back to Home */}
      <div className="register-back">
        <Link href="/" className="register-back-link">
          <svg className="register-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
