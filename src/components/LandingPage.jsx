import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ── CSS Mockup: Mini Dashboard ──
const DashboardMockup = ({ isMobile }) => {
  if (isMobile) {
    // Simplified mobile mockup — no sidebar, just the main content area
    return (
      <div style={{ background: '#0f1419', borderRadius: '12px', overflow: 'hidden', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif", width: '100%' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#161b22', borderBottom: '1px solid #21262d' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#8b949e' }}>dayonetools.app/dashboard</div>
        </div>
        {/* Main content only */}
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', marginBottom: '3px' }}>Dashboard</div>
          <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '10px' }}>Welcome back! Here's an overview.</div>
          {/* Stat cards — 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            {[
              { label: 'INVOICES', val: '24', sub: '+3 this month' },
              { label: 'SALES', val: '$4,280', sub: '+12%' },
              { label: 'OUTSTANDING', val: '$1,150', sub: '3 unpaid' },
              { label: 'CUSTOMERS', val: '12', sub: '+2 new' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#161b22', borderRadius: '6px', padding: '8px', border: '1px solid #21262d' }}>
                <div style={{ fontSize: '8px', color: '#8b949e', fontWeight: '600', letterSpacing: '0.4px', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', marginBottom: '1px' }}>{s.val}</div>
                <div style={{ fontSize: '8px', color: i === 1 || i === 3 ? '#10b981' : '#8b949e' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Status overview */}
          <div style={{ background: '#161b22', borderRadius: '6px', padding: '10px', border: '1px solid #21262d', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px' }}>Invoice Status</div>
            {[
              { label: 'Paid', count: '14', color: '#10b981', amt: '$8,750' },
              { label: 'Sent', count: '5', color: '#3b82f6', amt: '$2,430' },
              { label: 'Overdue', count: '2', color: '#ef4444', amt: '$1,150' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? '1px solid #21262d' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: '600', color: '#fff', background: r.color }}>{r.label}</span>
                  <span style={{ fontSize: '9px', color: '#8b949e' }}>{r.count}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#e6edf3', fontWeight: '500' }}>{r.amt}</span>
              </div>
            ))}
          </div>
          {/* CTA */}
          <div style={{ padding: '7px 10px', background: '#10b981', borderRadius: '5px', fontSize: '11px', color: '#fff', fontWeight: '600', textAlign: 'center' }}>+ Generate New Invoice</div>
        </div>
      </div>
    );
  }

  // Desktop mockup (unchanged)
  return (
    <div style={{ background: '#0f1419', borderRadius: '12px', overflow: 'hidden', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif", width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#161b22', borderBottom: '1px solid #21262d' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
        <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#8b949e' }}>dayonetools.app/dashboard</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '160px', background: '#0d1117', borderRight: '1px solid #21262d', padding: '14px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>GENERAL</div>
          <div style={{ padding: '7px 10px', background: '#10b981', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>📊 Dashboard</div>
          <div style={{ padding: '7px 10px', fontSize: '12px', color: '#8b949e', marginBottom: '2px' }}>📈 Analytics</div>
          <div style={{ padding: '7px 10px', fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>🔒 Vault</div>
          <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>INVOICE</div>
          <div style={{ padding: '7px 10px', fontSize: '12px', color: '#e6edf3', marginBottom: '2px' }}>➕ Create</div>
          <div style={{ padding: '7px 10px', fontSize: '12px', color: '#e6edf3', marginBottom: '2px' }}>📄 Invoices</div>
          <div style={{ padding: '7px 10px', fontSize: '12px', color: '#e6edf3' }}>👥 Customers</div>
        </div>
        <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '4px' }}>Dashboard</div>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '14px' }}>Welcome back! Here's an overview of your business.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
            {[
              { label: 'TOTAL INVOICES', val: '24', sub: '+3 from last month' },
              { label: 'MONTHLY SALES', val: '$4,280', sub: '+12% from last month' },
              { label: 'OUTSTANDING', val: '$1,150', sub: '3 unpaid invoices' },
              { label: 'CUSTOMERS', val: '12', sub: '+2 new this month' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#161b22', borderRadius: '8px', padding: '10px', border: '1px solid #21262d' }}>
                <div style={{ fontSize: '9px', color: '#8b949e', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '2px' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: i === 1 || i === 3 ? '#10b981' : '#8b949e' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
            <div style={{ background: '#161b22', borderRadius: '8px', padding: '12px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#e6edf3', marginBottom: '10px' }}>Invoice Status Overview</div>
              {[
                { label: 'Draft', count: '3', color: '#8b949e', amt: '$0.00' },
                { label: 'Sent', count: '5', color: '#3b82f6', amt: '$2,430.00' },
                { label: 'Paid', count: '14', color: '#10b981', amt: '$8,750.00' },
                { label: 'Overdue', count: '2', color: '#ef4444', amt: '$1,150.00' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? '1px solid #21262d' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', color: '#fff', background: r.color }}>{r.label}</span>
                    <span style={{ fontSize: '11px', color: '#8b949e' }}>{r.count} invoices</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#e6edf3', fontWeight: '500' }}>{r.amt}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#161b22', borderRadius: '8px', padding: '12px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#e6edf3', marginBottom: '10px' }}>Quick Actions</div>
              <div style={{ padding: '8px 12px', background: '#10b981', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: '600', marginBottom: '6px', textAlign: 'center' }}>+ Generate New Invoice</div>
              {['👥 Manage Customers', '📦 Manage Products', '📈 View Analytics'].map((a, i) => (
                <div key={i} style={{ padding: '7px 12px', background: '#21262d', borderRadius: '6px', fontSize: '11px', color: '#e6edf3', marginBottom: '4px' }}>{a}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div style={{ background: '#161b22', borderRadius: '8px', padding: '12px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#e6edf3', marginBottom: '2px' }}>Recent Invoices</div>
              <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '10px' }}>Your latest invoices</div>
              {[
                { num: 'INV-001', status: 'Paid', statusColor: '#10b981', amount: '$2,400.00', date: '2 days ago' },
                { num: 'INV-002', status: 'Sent', statusColor: '#3b82f6', amount: '$800.00', date: 'Today' },
                { num: 'INV-003', status: 'Draft', statusColor: '#8b949e', amount: '$1,550.00', date: 'Today' },
              ].map((inv, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid #21262d' : 'none' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#e6edf3', fontWeight: '500' }}>{inv.num}</span>
                      <span style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: '600', color: '#fff', background: inv.statusColor }}>{inv.status}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px' }}>• {inv.date}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#e6edf3', fontWeight: '500' }}>{inv.amount}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px', padding: '6px', textAlign: 'center', border: '1px solid #21262d', borderRadius: '6px', fontSize: '11px', color: '#8b949e' }}>View All Invoices →</div>
            </div>
            <div style={{ background: '#161b22', borderRadius: '8px', padding: '12px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#e6edf3', marginBottom: '2px' }}>Recent Customers</div>
              <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '10px' }}>Newly added customers</div>
              {[
                { name: 'Acme Corp Inc.', email: 'billing@acme.com', count: '3 invoices' },
                { name: 'Greenfield Design', email: 'ap@greenfield.co', count: '1 invoice' },
                { name: 'Summit Analytics', email: 'pay@summit.io', count: '2 invoices' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid #21262d' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#e6edf3', fontWeight: '500' }}>{c.name}</div>
                    <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '1px' }}>{c.email}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#8b949e' }}>{c.count}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px', padding: '6px', textAlign: 'center', border: '1px solid #21262d', borderRadius: '6px', fontSize: '11px', color: '#8b949e' }}>View All Customers →</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── CSS Mockup: Invoice Creator Card ──
const CreateMockup = () => (
  <div style={{ background: '#161b22', borderRadius: '10px', padding: '16px', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#e6edf3', letterSpacing: '0.5px' }}>NEW INVOICE</span>
      <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500' }}>#INV-2026-024</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
      <div>
        <div style={{ fontSize: '9px', color: '#8b949e', marginBottom: '3px', fontWeight: '500' }}>BILL TO</div>
        <div style={{ padding: '7px 10px', background: '#21262d', borderRadius: '6px', fontSize: '11px', color: '#e6edf3' }}>Acme Corp Inc.</div>
      </div>
      <div>
        <div style={{ fontSize: '9px', color: '#8b949e', marginBottom: '3px', fontWeight: '500' }}>DUE DATE</div>
        <div style={{ padding: '7px 10px', background: '#21262d', borderRadius: '6px', fontSize: '11px', color: '#e6edf3' }}>Feb 28, 2026</div>
      </div>
    </div>
    <div style={{ padding: '7px 10px', background: '#21262d', borderRadius: '6px', fontSize: '11px', color: '#e6edf3', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
      <span>INVOICE SUMMARY</span><span style={{ color: '#8b949e' }}>▾</span>
    </div>
    <div style={{ padding: '7px 10px', background: '#0d1117', borderRadius: '6px', fontSize: '11px', color: '#8b949e', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Website Redesign</span><span style={{ color: '#e6edf3' }}>$2,400</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SEO Optimization</span><span style={{ color: '#e6edf3' }}>$800</span></div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #21262d' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#8b949e', letterSpacing: '0.5px' }}>TOTAL AMOUNT</span>
      <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>$3,200</span>
    </div>
  </div>
);

// ── CSS Mockup: Status Overview Card ──
const AnalyzeMockup = () => (
  <div style={{ background: '#161b22', borderRadius: '10px', padding: '16px', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#e6edf3', letterSpacing: '0.5px' }}>STATUS OVERVIEW</span>
      <span style={{ fontSize: '10px', color: '#8b949e' }}>Last 30 Days</span>
    </div>
    {[
      { label: 'Paid', pct: 52, color: '#10b981' },
      { label: 'Sent', pct: 20, color: '#3b82f6' },
      { label: 'Pending', pct: 15, color: '#f59e0b' },
      { label: 'Overdue', pct: 8, color: '#ef4444' },
      { label: 'Draft', pct: 5, color: '#8b949e' },
    ].map((r, i) => (
      <div key={i} style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#e6edf3' }}>{r.label}</span>
          <span style={{ fontSize: '11px', color: '#8b949e' }}>{r.pct}%</span>
        </div>
        <div style={{ height: '5px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: '4px' }} />
        </div>
      </div>
    ))}
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #21262d', marginTop: '4px' }}>
      <span style={{ fontSize: '11px', color: '#8b949e' }}>Total Invoices</span>
      <span style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3' }}>115</span>
    </div>
  </div>
);

// ── CSS Mockup: Share Settings Card ──
const ShareMockup = () => (
  <div style={{ background: '#161b22', borderRadius: '10px', padding: '16px', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#e6edf3', letterSpacing: '0.5px' }}>SHARE SETTINGS</span>
      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>✓ ACTIVE</span>
    </div>
    {[
      { icon: '🔒', label: 'Password Protection' },
      { icon: '📅', label: 'Expiration Date' },
      { icon: '👁', label: 'View Limit', on: true },
    ].map((r, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 2 ? '1px solid #21262d' : 'none' }}>
        <span style={{ fontSize: '12px', color: '#e6edf3' }}>{r.icon} {r.label}</span>
        <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: r.on ? '#3b82f6' : '#21262d', position: 'relative', border: `1px solid ${r.on ? '#3b82f6' : '#30363d'}` }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '1px', left: r.on ? '17px' : '1px', transition: 'left 0.2s' }} />
        </div>
      </div>
    ))}
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#8b949e', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '6px' }}>PUBLIC LINK</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#0d1117', borderRadius: '6px', border: '1px solid #21262d' }}>
        <span style={{ flex: 1, fontSize: '11px', color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>dayonetools.app/s/inv-a7k9x</span>
        <span style={{ fontSize: '12px', cursor: 'pointer' }}>📋</span>
      </div>
      <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '6px' }}>View limit enabled · 50 views remaining</div>
    </div>
  </div>
);


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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ===== HERO SECTION ===== */}
      <div style={{ 
        background: darkMode 
          ? `radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.15), transparent), ${colors.bg}`
          : `radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.1), transparent), ${colors.bg}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '24px 16px 0' : '48px 20px 0',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: isMobile ? '26px' : '42px',
          fontWeight: '700',
          color: colors.text,
          lineHeight: '1.2',
          marginBottom: '14px',
          maxWidth: '700px',
          letterSpacing: '-0.5px',
          padding: isMobile ? '0 4px' : 0,
        }}>
          <span style={{ fontStyle: 'italic' }}>Easy-To-Use</span> Invoicing Platform That Scales With Your Business
        </h1>

        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          color: colors.textMuted,
          maxWidth: '580px',
          lineHeight: '1.6',
          marginBottom: '24px',
          padding: isMobile ? '0 8px' : 0,
        }}>
          Day One is an invoicing platform built for small-medium businesses and freelancers to create professional invoices fast, manage clients, and get paid on time.
        </p>

        {/* CTA Buttons — stack vertically on mobile */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? '10px' : '20px',
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '320px' : 'none',
          marginBottom: '0',
        }}>
          <Link to="/signup" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isMobile ? '13px 24px' : '14px 28px',
            background: `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.accent} 100%)`,
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
          }}>
            Get Started <span style={{ fontSize: '16px' }}>›</span>
          </Link>
          <Link to="/invoicegenerator" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isMobile ? '13px 24px' : '14px 28px',
            background: 'transparent',
            color: colors.accent,
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '8px',
            border: `1.5px solid ${colors.accent}`,
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
          }}>
            Try Free Invoice Generator
          </Link>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 4px',
            color: colors.accent,
            fontSize: '15px',
            fontWeight: '500',
            textDecoration: 'none',
          }}>
            Talk to Us <span style={{ fontSize: '16px' }}>→</span>
          </Link>
        </div>

        {/* Dashboard mockup */}
        <div style={{ width: '100%', maxWidth: '1100px', marginTop: isMobile ? '28px' : '36px', padding: isMobile ? '0' : '0 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.3)', marginBottom: isMobile ? '32px' : '60px' }}>
            <DashboardMockup isMobile={isMobile} />
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <div style={{
        background: darkMode
          ? `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.08), transparent), ${colors.bg}`
          : `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.06), transparent), ${colors.bg}`,
        padding: isMobile ? '48px 16px 60px' : '100px 20px 120px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '60px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</div>
            <h2 style={{ fontSize: isMobile ? '24px' : '40px', fontWeight: '700', color: colors.text, marginBottom: '14px', letterSpacing: '-0.5px', padding: isMobile ? '0 8px' : 0 }}>
              Smart invoicing in 3 simple steps
            </h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: colors.textMuted, maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', padding: isMobile ? '0 8px' : 0 }}>
              From creating your first invoice to getting paid faster. Each step is designed to save you time and give you complete control over your billing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '16px' : '24px',
          }}>
            {/* Step 1: Create */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent, flexShrink: 0 }}>1</div>
                <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Create</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '16px' }}>
                Generate invoices with smart numbering, multi-currency support, multi-language options in 12 languages, and custom templates in one interface.
              </p>
              <CreateMockup />
            </div>

            {/* Step 2: Analyze */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent, flexShrink: 0 }}>2</div>
                <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Analyze</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '16px' }}>
                Monitor invoice statuses with visual dashboards. Identify overdue payments and track cash flow instantly.
              </p>
              <AnalyzeMockup />
            </div>

            {/* Step 3: Share */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent, flexShrink: 0 }}>3</div>
                <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Share</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '16px' }}>
                Send invoices with password protection, expiration dates, and view limits. Automated reminders ensure faster payments.
              </p>
              <ShareMockup />
            </div>
          </div>
        </div>
      </div>

      {/* ===== INDUSTRIES SECTION ===== */}
      <div style={{
        padding: isMobile ? '60px 16px' : '80px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: darkMode ? '#10b98120' : '#10b98115',
            color: '#10b981', fontSize: '12px', fontWeight: '600',
            marginBottom: '16px', letterSpacing: '0.5px',
          }}>
            🏢 Built For Your Industry
          </div>
          <h2 style={{
            fontSize: isMobile ? '26px' : '36px', fontWeight: '800',
            color: colors.text, margin: '0 0 12px', lineHeight: '1.2',
          }}>
            Invoice Software Tailored to Your Business
          </h2>
          <p style={{
            fontSize: '15px', color: colors.textMuted, maxWidth: '600px',
            margin: '0 auto', lineHeight: '1.6',
          }}>
            Every industry has unique invoicing needs. Day One provides specialized features
            and templates designed for how you work.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {[
            { title: 'Construction & Trades', desc: 'Job costing, progress billing, and material tracking', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', link: '/industries/construction' },
            { title: 'Legal Services', desc: 'Billable hours, retainer management, and trust accounting', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop', link: '/industries/legal' },
            { title: 'Freelancers & Creatives', desc: 'Project-based billing, licensing fees, and usage rights', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop', link: null },
            { title: 'IT & Software', desc: 'Recurring billing, SaaS subscriptions, and project invoicing', img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop', link: null },
            { title: 'Business Consulting', desc: 'Consulting fees, milestone billing, and expense tracking', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop', link: null },
            { title: 'Creative Services', desc: 'Project-based billing, licensing fees, and usage rights', img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop', link: null },
          ].map((industry, i) => {
            const CardWrapper = industry.link ? Link : 'div';
            const wrapperProps = industry.link ? { to: industry.link, style: { textDecoration: 'none', color: 'inherit' } } : {};
            return (
            <CardWrapper key={i} {...wrapperProps}>
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
              overflow: 'hidden',
              cursor: industry.link ? 'pointer' : 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { if (industry.link) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                height: '160px',
                backgroundImage: `url(${industry.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)',
                }} />
                <h3 style={{
                  fontSize: '16px', fontWeight: '700', color: '#ffffff',
                  margin: 0, position: 'relative', zIndex: 1,
                }}>
                  {industry.title}
                </h3>
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{
                  fontSize: '13px', color: colors.textMuted,
                  margin: '0 0 12px', lineHeight: '1.5',
                }}>
                  {industry.desc}
                </p>
                {industry.link ? (
                  <span style={{
                    fontSize: '13px', fontWeight: '600', color: '#10b981',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    Learn more →
                  </span>
                ) : (
                  <span style={{
                    fontSize: '13px', fontWeight: '600', color: '#10b981',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    cursor: 'default', opacity: 0.6,
                  }}>
                    Coming soon
                  </span>
                )}
              </div>
            </div>
            </CardWrapper>
            );})}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button style={{
            padding: '12px 28px',
            background: 'transparent',
            border: `1.5px solid ${darkMode ? '#30363d' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: colors.text,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            View All Industries →
          </button>
        </div>
      </div>
    </div>
  );
}
