import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchInvoices, fetchCustomers } from '../supabaseService';

export default function DashboardOverview({ darkMode = true }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load real data from Supabase
  useEffect(() => {
    fetchInvoices().then(data => setInvoices(data)).catch(e => console.error(e));
    fetchCustomers().then(data => setCustomers(data)).catch(e => console.error(e));
  }, []);

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
  };

  // Calculate real stats
  const totalInvoices = invoices.length;
  const monthlySales = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const outstanding = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue' || inv.status === 'sent')
    .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
  const unpaidCount = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft').length;
  const totalCustomers = customers.length;

  // Invoice status breakdown
  const getStatusData = (status) => {
    const filtered = invoices.filter(inv => inv.status === status);
    return {
      count: filtered.length,
      amount: filtered.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0),
    };
  };

  const invoiceStatuses = [
    { status: 'Draft', ...getStatusData('draft'), color: colors.textMuted },
    { status: 'Sent', ...getStatusData('sent'), color: colors.accent },
    { status: 'Paid', ...getStatusData('paid'), color: colors.green },
    { status: 'Overdue', ...getStatusData('overdue'), color: colors.orange },
    { status: 'Cancelled', ...getStatusData('cancelled'), color: colors.red },
  ];

  // Recent invoices (last 5)
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Recent customers (last 3)
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(amount || 0));
  
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  const quickActions = [
    { label: 'Generate New Invoice', icon: '+', to: '/dashboard/create', highlight: true },
    { label: 'Manage Customers', icon: '👥', to: '/dashboard/customers', highlight: false },
    { label: 'Manage Products', icon: '📦', to: '/dashboard/products', highlight: false },
    { label: 'View Analytics', icon: '📈', to: '/dashboard/analytics', highlight: false },
  ];

  const cardStyle = {
    background: colors.bgCard,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: colors.textMuted,
      sent: colors.accent,
      pending: colors.yellow,
      paid: colors.green,
      overdue: colors.orange,
      cancelled: colors.red,
    };
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        color: '#fff',
        background: statusColors[status] || colors.textMuted,
        textTransform: 'capitalize',
      }}>
        {status || 'Draft'}
      </span>
    );
  };

  return (
    <div style={{ padding: isMobile ? '20px' : '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
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
        marginBottom: '24px' 
      }}>
        {/* Total Invoices */}
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Invoices</span>
            <span style={{ fontSize: '14px', opacity: 0.6 }}>📄</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            {totalInvoices}
          </div>
          <div style={{ fontSize: '13px', color: colors.textMuted }}>No change from last month</div>
        </div>

        {/* Monthly Sales */}
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Sales</span>
            <span style={{ fontSize: '14px', opacity: 0.6 }}>💰</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            {formatCurrency(monthlySales)}
          </div>
          <div style={{ fontSize: '13px', color: colors.textMuted }}>No change from last month</div>
        </div>

        {/* Outstanding */}
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding</span>
            <span style={{ fontSize: '14px', opacity: 0.6 }}>⏰</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            {formatCurrency(outstanding)}
          </div>
          <div style={{ fontSize: '13px', color: colors.textMuted }}>{unpaidCount} unpaid invoices</div>
        </div>

        {/* Customers */}
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customers</span>
            <span style={{ fontSize: '14px', opacity: 0.6 }}>👥</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
            {totalCustomers}
          </div>
          <div style={{ fontSize: '13px', color: colors.green }}>+{totalCustomers} new this month</div>
        </div>
      </div>

      {/* Invoice Status & Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Invoice Status Overview */}
        <div style={{ ...cardStyle, padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '2px' }}>
            Invoice Status Overview
          </h2>
          <p style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px' }}>
            Current status of all invoices of current month.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invoiceStatuses.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.bgInput,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#ffffff',
                    background: item.color,
                  }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>
                    {item.count} invoice{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...cardStyle, padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '2px' }}>
            Quick Actions
          </h2>
          <p style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px' }}>
            Common tasks and shortcuts
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quickActions.map((action, i) => (
              <Link key={i} to={action.to} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '6px',
                border: action.highlight ? 'none' : `1px solid ${colors.border}`,
                background: action.highlight ? colors.green : colors.bgInput,
                color: action.highlight ? '#ffffff' : colors.text,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.15s',
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{ fontSize: '14px' }}>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices & Recent Customers */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', 
        gap: '12px'
      }}>
        {/* Recent Invoices */}
        <div style={{ ...cardStyle, padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '2px' }}>
            Recent Invoices
          </h2>
          <p style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px' }}>
            Your latest invoices
          </p>

          {recentInvoices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {recentInvoices.map((invoice, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/dashboard/invoices/${invoice.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    background: colors.bgInput,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>
                        {invoice.invoiceNumber}
                      </span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>
                      {invoice.customerName} • {formatTimeAgo(invoice.createdAt)}
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '24px 16px', 
              color: colors.textMuted, 
              fontSize: '12px',
              marginBottom: '12px',
            }}>
              No invoices yet. Create your first invoice to get started!
            </div>
          )}

          <Link to="/dashboard/invoices" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s',
          }}>
            View All Invoices →
          </Link>
        </div>

        {/* Recent Customers */}
        <div style={{ ...cardStyle, padding: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '2px' }}>
            Recent Customers
          </h2>
          <p style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px' }}>
            Newly added customers
          </p>

          {recentCustomers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {recentCustomers.map((customer, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.border}`,
                  background: colors.bgInput,
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '2px' }}>
                      {customer.name}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>
                      {customer.email || 'No email'}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: colors.textMuted }}>
                    {customer.invoiceCount || 0} invoice{(customer.invoiceCount || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '24px 16px', 
              color: colors.textMuted, 
              fontSize: '12px',
              marginBottom: '12px',
            }}>
              No customers yet. Add your first customer!
            </div>
          )}

          <Link to="/dashboard/customers" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s',
          }}>
            View All Customers →
          </Link>
        </div>
      </div>
    </div>
  );
}
