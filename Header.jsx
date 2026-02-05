import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ darkMode = true, user = null, supabase = null }) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProductsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserMenuOpen(false);
  };

  const colors = darkMode ? {
    bg: '#111111',
    text: '#ffffff',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    border: '#2d2d2d',
    dropdownBg: '#1a1a1a',
  } : {
    bg: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#3b82f6',
    border: '#e5e7eb',
    dropdownBg: '#ffffff',
  };

  return (
    <div style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
    <header style={{
      padding: '0 40px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Logo / Brand */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.text,
          fontFamily: "'Inter', sans-serif",
        }}>
          Day One
        </span>
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Products Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProductsOpen(!productsOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 0',
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = colors.text}
            onMouseLeave={(e) => e.target.style.color = productsOpen ? colors.text : colors.textMuted}
          >
            Product
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: productsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {productsOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              background: colors.dropdownBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '8px 0',
              minWidth: '200px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            }}>
              <Link
                to="/invoicegenerator"
                onClick={() => setProductsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: colors.textMuted,
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2d2d2d';
                  e.target.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = colors.textMuted;
                }}
              >
                <span style={{ fontSize: '16px' }}>📄</span>
                Invoice Generator
              </Link>
              {/* Add more products here later */}
            </div>
          )}
        </div>

        {/* Contact Link */}
        <Link
          to="/contact"
          style={{
            color: colors.textMuted,
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = colors.text}
          onMouseLeave={(e) => e.target.style.color = colors.textMuted}
        >
          Contact
        </Link>
      </nav>

      {/* Right Side - Auth Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            {/* Dashboard Button - only when logged in */}
            <Link
              to="/dashboard"
              style={{
                padding: '8px 18px',
                background: 'transparent',
                color: colors.accent,
                borderRadius: '6px',
                border: `1.5px solid ${colors.accent}`,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.accent; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.accent; }}
            >
              Dashboard <span style={{ fontSize: '14px' }}>↗</span>
            </Link>

            {/* User Avatar / Menu */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: colors.accent,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {user.email?.charAt(0).toUpperCase() || '?'}
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  background: colors.dropdownBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '8px 0',
                  minWidth: '200px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text, fontFamily: "'Inter', sans-serif" }}>
                      {user.user_metadata?.full_name || 'User'}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>
                      {user.email}
                    </div>
                  </div>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      color: colors.textMuted,
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = colors.text}
                    onMouseLeave={(e) => e.target.style.color = colors.textMuted}
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    🚪 Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Login / Sign Up - when not logged in */}
            <Link
              to="/login"
              style={{
                color: location.pathname === '/login' ? colors.accent : colors.textMuted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: location.pathname === '/login' ? '600' : '500',
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = location.pathname === '/login' ? colors.accent : colors.text}
              onMouseLeave={(e) => e.target.style.color = location.pathname === '/login' ? colors.accent : colors.textMuted}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={{
                padding: '8px 18px',
                background: location.pathname === '/signup' ? colors.accent : 'transparent',
                color: location.pathname === '/signup' ? '#ffffff' : colors.accent,
                borderRadius: '6px',
                border: `1.5px solid ${colors.accent}`,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.accent; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = location.pathname === '/signup' ? colors.accent : 'transparent'; 
                e.currentTarget.style.color = location.pathname === '/signup' ? '#ffffff' : colors.accent; 
              }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
    </div>
  );
}
