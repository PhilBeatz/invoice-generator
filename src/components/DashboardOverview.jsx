import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardOverview({ darkMode = true }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colors = darkMode ? {
    bg: '#1a1a2e',
    bgCard: '#1f2937',
    bgCardHover: '#263345',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#374151',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgCardHover: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
  };

  const statCards = [
    { label: 'Total Invoices', value: '0', sub: 'No change from last month', icon: '📄' },
    { label: 'Monthly Sales', value: '$0.00', sub: 'No change from last month', icon: '💰' },
    { label: 'Outstanding', value: '$0.00', sub: '0 unpaid invoices', icon: '⏰' },
    { label: 'Customers', value: '0', sub: '+0 new this month', icon: '👥' },
  ];

  const invoiceStatuses = [
    { status: 'Draft', count: 0, amount: '$0.00', color: colors.accent },
    { status: 'Sent', count: 0, amount: '$0.00', color: colors.yellow },
    { status: 'Paid', count: 0, amount: '$0.00', color: colors.green },
    { status: 'Overdue', count: 0, amount: '$0.00', color: colors.orange },
    { status: 'Cancelled', count: 0, amount: '$0.00', color: colors.red },
  ];

  const quickActions = [
    { label: 'Generate New Invoice', icon: '＋', to: '/dashboard/create', highlight: true },
    { label: 'Manage Customers', icon: '👥', to: '/dashboard/customers', highlight: false },
    { label: 'Manage Products', icon: '📦', to: '/dashboard/products', highlight: false },
    { label: 'View Analytics', icon: '📈', to: '/dashboard/analytics', highlight: false },
  ];

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: colors.text, marginBottom: '6px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: colors.textMuted }}>
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
        gap: '16px', 
        marginBottom: '28px' 
      }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: colors.bgCard,
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: colors.textMuted }}>{card.label}</div>
              <span style={{ fontSize: '16px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Invoice Status & Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', 
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Invoice Status Overview */}
        <div style={{
          background: colors.bgCard,
          borderRadius: '12px',
          padding: isMobile ? '20px' : '24px',
          border: `1px solid ${colors.border}`,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            Invoice Status Overview
          </h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
            Current status of all invoices of current month.
          </p>

          {invoiceStatuses.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              marginBottom: i < invoiceStatuses.length - 1 ? '8px' : '0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: item.color,
                }}>
                  {item.status}
                </span>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>
                  {item.count} invoices
                </span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                {item.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: colors.bgCard,
          borderRadius: '12px',
          padding: isMobile ? '20px' : '24px',
          border: `1px solid ${colors.border}`,
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            Quick Actions
          </h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
            Common tasks and shortcuts
          </p>

          {quickActions.map((action, i) => (
            <Link key={i} to={action.to} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 16px',
              borderRadius: '8px',
              border: action.highlight ? 'none' : `1px solid ${colors.border}`,
              background: action.highlight ? colors.accent : 'transparent',
              color: action.highlight ? '#ffffff' : colors.text,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: i < quickActions.length - 1 ? '8px' : '0',
              transition: 'background 0.15s',
              fontFamily: "'Inter', sans-serif",
            }}>
              <span style={{ fontSize: '16px' }}>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div style={{
        background: colors.bgCard,
        borderRadius: '12px',
        padding: isMobile ? '20px' : '24px',
        border: `1px solid ${colors.border}`,
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
          Recent Invoices
        </h2>
        <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
          Your latest invoices
        </p>

        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: colors.textMuted, 
          fontSize: '14px' 
        }}>
          No invoices yet. Create your first invoice to get started!
        </div>

        <Link to="/dashboard/invoices" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '14px',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          color: colors.text,
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: "'Inter', sans-serif",
          transition: 'background 0.15s',
        }}>
          View All Invoices →
        </Link>
      </div>
    </div>
  );
}
