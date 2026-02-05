import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SignUp({ darkMode = true }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleTooltip, setGoogleTooltip] = useState(false);

  const colors = darkMode ? {
    bg: '#1a1a2e',
    cardBg: '#1f2937',
    inputBg: '#374151',
    inputBorder: '#4b5563',
    inputFocus: '#3b82f6',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    error: '#ef4444',
    green: '#10b981',
    divider: '#374151',
  } : {
    bg: '#f1f5f9',
    cardBg: '#ffffff',
    inputBg: '#f8fafc',
    inputBorder: '#d1d5db',
    inputFocus: '#3b82f6',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#3b82f6',
    error: '#ef4444',
    green: '#10b981',
    divider: '#e5e7eb',
  };

  const passwordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', colors.error, '#f59e0b', colors.accent, colors.green];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Try logging in instead.');
        } else {
          setError(authError.message);
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setGoogleTooltip(true);
    setTimeout(() => setGoogleTooltip(false), 3000);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 12px 12px 44px',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: colors.text,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '6px',
    fontFamily: "'Inter', sans-serif",
  };

  // Success state - email verification required
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
        <div style={{
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `${colors.green}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
          }}>
            ✉️
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '12px' }}>
            Check your email
          </h1>
          <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '8px' }}>
            We've sent a verification link to:
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: colors.accent, marginBottom: '24px' }}>
            {email}
          </p>
          <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '32px' }}>
            Click the link in the email to verify your account, then come back to log in.
          </p>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: colors.accent,
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '700',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Go to Login
          </Link>

          <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '24px' }}>
            Didn't receive the email? Check your spam folder.
          </p>
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
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.text,
          marginBottom: '8px',
        }}>
          Create an account
        </h1>
        <p style={{
          fontSize: '15px',
          color: colors.textMuted,
          marginBottom: '32px',
        }}>
          Get started with Day One Tools
        </p>

        {/* Google Button */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <button
            onClick={handleGoogleSignUp}
            style={{
              width: '100%',
              padding: '12px',
              background: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text,
              fontFamily: "'Inter', sans-serif",
              transition: 'border-color 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          {googleTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              padding: '8px 16px',
              background: colors.accent,
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}>
              Coming soon! Use email sign up for now.
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ flex: 1, height: '1px', background: colors.divider }} />
          <span style={{ fontSize: '13px', color: colors.textMuted }}>Or</span>
          <div style={{ flex: 1, height: '1px', background: colors.divider }} />
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp}>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px' }}>👤</span>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = colors.inputFocus}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px' }}>✉️</span>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = colors.inputFocus}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = colors.inputFocus}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textMuted,
                  fontSize: '14px',
                  padding: '4px',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '2px',
                    background: strength >= level ? strengthColors[strength] : colors.divider,
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: strengthColors[strength], fontWeight: '500' }}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '15px' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== password ? colors.error : colors.inputBorder,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.inputFocus}
                onBlur={(e) => e.target.style.borderColor = confirmPassword && confirmPassword !== password ? colors.error : colors.inputBorder}
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <span style={{ fontSize: '12px', color: colors.error, marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: `${colors.error}15`,
              border: `1px solid ${colors.error}40`,
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: colors.error,
            }}>
              {error}
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: colors.accent,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: colors.textMuted,
          marginTop: '24px',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: '600' }}>
            Log in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p style={{
        fontSize: '12px',
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: '60px',
        lineHeight: '1.6',
        maxWidth: '400px',
      }}>
        By continuing, you agree to Day One's{' '}
        <Link to="/terms" style={{ color: colors.textMuted, textDecoration: 'underline' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" style={{ color: colors.textMuted, textDecoration: 'underline' }}>Privacy Policy</Link>
        , and to receive periodic emails with updates.
      </p>
    </div>
  );
}
