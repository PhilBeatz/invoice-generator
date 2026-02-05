import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage({ darkMode = true }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colors = darkMode ? {
    bg: '#1a1a2e',
    text: '#ffffff',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    accentLight: '#60a5fa',
    cardBg: 'rgba(59, 130, 246, 0.05)',
  } : {
    bg: '#f1f5f9',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#3b82f6',
    accentLight: '#2563eb',
    cardBg: 'rgba(59, 130, 246, 0.08)',
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 120px)', 
      background: darkMode 
        ? `radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.15), transparent), ${colors.bg}`
        : `radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.1), transparent), ${colors.bg}`,
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '40px 20px 60px' : '60px 20px 80px',
      textAlign: 'center',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Main Heading */}
      <h1 style={{
        fontSize: isMobile ? '36px' : '56px',
        fontWeight: '700',
        color: colors.text,
        lineHeight: '1.15',
        marginBottom: '24px',
        maxWidth: '800px',
        letterSpacing: '-1px',
      }}>
        <span style={{ fontStyle: 'italic' }}>Easy-To-Use</span> Invoicing Platform{' '}
        <br />
        That Scales With Your Business
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: isMobile ? '16px' : '18px',
        color: colors.textMuted,
        maxWidth: '650px',
        lineHeight: '1.7',
        marginBottom: '40px',
      }}>
        Day One is an invoicing platform built for small-medium businesses and freelancers to create professional invoices fast, manage clients, and get paid on time.
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {/* Get Started Button */}
        <Link
          to="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            background: `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.accent} 100%)`,
            color: darkMode ? '#0f1419' : '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
          }}
        >
          Get Started
          <span style={{ fontSize: '18px' }}>›</span>
        </Link>

        {/* Talk to Us Link */}
        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 24px',
            color: colors.accent,
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'gap 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.gap = '12px';
          }}
          onMouseLeave={(e) => {
            e.target.style.gap = '8px';
          }}
        >
          Talk to Us
          <span style={{ fontSize: '18px' }}>→</span>
        </Link>
      </div>
    </div>
  );
}
