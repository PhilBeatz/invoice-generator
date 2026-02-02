import React from 'react';

export default function Footer({ darkMode, setDarkMode }) {
  const colors = darkMode ? {
    bg: '#111111',
    border: '#2d2d2d',
    text: '#9ca3af',
    accent: '#10b981',
  } : {
    bg: '#f8fafc',
    border: '#e2e8f0',
    text: '#64748b',
    accent: '#10b981',
  };

  return (
    <footer style={{
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Copyright */}
      <div style={{ 
        fontSize: '13px', 
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>©</span> {new Date().getFullYear()} Day One, All rights reserved
      </div>

      {/* Right Side - Status & Theme Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px' 
      }}>
        {/* Status Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '13px',
          color: colors.text
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            background: colors.accent, 
            borderRadius: '50%',
            boxShadow: `0 0 8px ${colors.accent}`
          }}></span>
          All services are online
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            background: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#f3f4f6' : '#1f2937',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s',
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </footer>
  );
}
