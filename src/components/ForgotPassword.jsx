import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPassword({ darkMode = true }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const colors = darkMode ? {
    bg: '#1a1a2e',
    inputBg: '#374151',
    inputBorder: '#4b5563',
    inputFocus: '#3b82f6',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    error: '#ef4444',
    green: '#10b981',
  } : {
    bg: '#f1f5f9',
    inputBg: '#f8fafc',
    inputBorder: '#d1d5db',
    inputFocus: '#3b82f6',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#3b82f6',
    error: '#ef4444',
    green: '#10b981',
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://dayonetools.app/login',
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 120px)',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: `${colors.green}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '28px',
          }}>✉️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '12px' }}>Check your email</h1>
          <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '8px' }}>
            We've sent a password reset link to:
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: colors.accent, marginBottom: '32px' }}>{email}</p>
          <Link to="/login" style={{
            display: 'inline-block', padding: '14px 32px', background: colors.accent,
            color: '#ffffff', borderRadius: '8px', textDecoration: 'none',
            fontSize: '15px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: colors.text, marginBottom: '8px' }}>
          Forgot password?
        </h1>
        <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '32px' }}>
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px' }}>✉️</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 12px 12px 44px', background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`, borderRadius: '8px', fontSize: '14px',
                  color: colors.text, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = colors.inputFocus}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: `${colors.error}15`, border: `1px solid ${colors.error}40`,
              borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: colors.error,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: colors.accent, color: '#ffffff',
            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'wait' : 'pointer', fontFamily: "'Inter', sans-serif",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: colors.textMuted, marginTop: '24px' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
