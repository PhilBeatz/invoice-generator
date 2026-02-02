import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ darkMode = true }) {
  const [productsOpen, setProductsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
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
      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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

      {/* Right side - placeholder for future Dashboard button */}
      <div style={{ width: '100px' }}></div>
    </header>
  );
}
