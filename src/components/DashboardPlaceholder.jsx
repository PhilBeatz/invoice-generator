import React from 'react';

export default function DashboardPlaceholder({ darkMode = true, title = 'Coming Soon', icon = '🚧', description = '' }) {
  const colors = darkMode ? {
    bg: '#1a1a2e',
    bgCard: '#1f2937',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#374151',
    accent: '#3b82f6',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
  };

  return (
    <div style={{ padding: '32px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: colors.bgCard,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        padding: '80px 40px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '40px auto',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, marginBottom: '12px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '24px' }}>
          {description || 'This feature is under development and will be available soon. Stay tuned!'}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: `${colors.accent}20`,
          color: colors.accent,
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          Coming in Phase 2
        </div>
      </div>
    </div>
  );
}
