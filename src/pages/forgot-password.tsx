"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../lib/auth';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.forgotPassword(email);
      setSuccess('OTP sent to your email address');
      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));

    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  // Handle OTP keydown for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await auth.verifyResetOtp(email, otpString);
      setResetToken(response.data.resetToken);
      setSuccess('OTP verified successfully');
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await auth.resetPassword(email, resetToken, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      await auth.forgotPassword(email);
      setSuccess('New OTP sent to your email');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Progress Steps */}
        <div className="forgot-password-steps">
          <div className={`step ${step === 'email' ? 'active' : ''} ${step !== 'email' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Email</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'otp' ? 'active' : ''} ${step === 'password' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Verify</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'password' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Reset</span>
          </div>
        </div>

        {/* Header */}
        <div className="forgot-password-header">
          {step === 'email' && (
            <>
              <div className="forgot-password-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="forgot-password-title">Forgot Password?</h2>
              <p className="forgot-password-subtitle">
                Enter your email address and we'll send you a verification code
              </p>
            </>
          )}
          {step === 'otp' && (
            <>
              <div className="forgot-password-icon otp">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="forgot-password-title">Enter OTP</h2>
              <p className="forgot-password-subtitle">
                We've sent a 6-digit code to<br />
                <strong>{email}</strong>
              </p>
            </>
          )}
          {step === 'password' && (
            <>
              <div className="forgot-password-icon success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="forgot-password-title">Set New Password</h2>
              <p className="forgot-password-subtitle">
                Create a strong password for your account
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="forgot-password-error">
            <svg className="forgot-password-error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="forgot-password-success">
            <svg className="forgot-password-success-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="forgot-password-form">
            <div className="forgot-password-form-group">
              <label htmlFor="email" className="forgot-password-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="forgot-password-input"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forgot-password-button"
            >
              {loading ? (
                <span className="forgot-password-button-spinner" />
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="forgot-password-form">
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-resend">
              {resendTimer > 0 ? (
                <span className="otp-resend-timer">
                  Resend OTP in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="otp-resend-button"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="forgot-password-button"
            >
              {loading ? (
                <span className="forgot-password-button-spinner" />
              ) : (
                'Verify OTP'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                setError('');
                setSuccess('');
              }}
              className="forgot-password-back-button"
            >
              Change Email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="forgot-password-form">
            <div className="forgot-password-form-group">
              <label htmlFor="newPassword" className="forgot-password-label">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="forgot-password-input"
                placeholder="••••••••"
              />
              <div className="password-requirements">
                <span className={newPassword.length >= 8 ? 'valid' : ''}>
                  8+ characters
                </span>
                <span className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                  Uppercase
                </span>
                <span className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                  Lowercase
                </span>
                <span className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                  Number
                </span>
              </div>
            </div>

            <div className="forgot-password-form-group">
              <label htmlFor="confirmPassword" className="forgot-password-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="forgot-password-input"
                placeholder="••••••••"
              />
              {confirmPassword && (
                <div className={`password-match ${newPassword === confirmPassword ? 'valid' : 'invalid'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forgot-password-button"
            >
              {loading ? (
                <span className="forgot-password-button-spinner" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="forgot-password-login">
          <Link href="/login" className="forgot-password-login-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>

      {/* Back to Home */}
      <div className="forgot-password-home">
        <Link href="/" className="forgot-password-home-link">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
