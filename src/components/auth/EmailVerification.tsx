"use client";

import { useState, useRef, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

interface EmailVerificationProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function EmailVerification({ onSuccess, onClose }: EmailVerificationProps) {
  const { refreshUserProfile } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Send OTP
  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    setSending(true);

    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        setError('You must be logged in to verify your email');
        return;
      }

      await auth.sendEmailVerification(accessToken);
      setSuccess('Verification code sent to your email');
      setOtpSent(true);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setSending(false);
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

    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        setError('You must be logged in to verify your email');
        setLoading(false);
        return;
      }

      await auth.verifyEmail(accessToken, otpString);
      setSuccess('Email verified successfully!');

      // Refresh user profile to update isEmailVerified
      await refreshUserProfile();

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification">
      <div className="email-verification-header">
        <div className="email-verification-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="email-verification-title">Verify Your Email</h3>
        <p className="email-verification-subtitle">
          {otpSent
            ? 'Enter the 6-digit code we sent to your email'
            : 'Click the button below to receive a verification code'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="email-verification-error">
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="email-verification-success">
          <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {!otpSent ? (
        <button
          onClick={handleSendOtp}
          disabled={sending}
          className="email-verification-send-btn"
        >
          {sending ? (
            <span className="email-verification-spinner" />
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Verification Code
            </>
          )}
        </button>
      ) : (
        <form onSubmit={handleVerify} className="email-verification-form">
          <div className="email-verification-otp-container">
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
                className="email-verification-otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="email-verification-resend">
            {resendTimer > 0 ? (
              <span className="email-verification-timer">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="email-verification-resend-btn"
                disabled={sending}
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="email-verification-verify-btn"
          >
            {loading ? (
              <span className="email-verification-spinner" />
            ) : (
              'Verify Email'
            )}
          </button>
        </form>
      )}

      {onClose && (
        <button onClick={onClose} className="email-verification-close-btn">
          Cancel
        </button>
      )}
    </div>
  );
}
