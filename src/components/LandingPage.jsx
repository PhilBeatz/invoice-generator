import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ── CSS Mockup: Mini Dashboard ──
const DashboardMockup = () => (
  <div style={{ background: '#0f1419', borderRadius: '12px', overflow: 'hidden', border: '1px solid #21262d', fontFamily: "'Inter', sans-serif", width: '100%' }}>
    {/* Top bar */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#161b22', borderBottom: '1px solid #21262d' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
      <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#8b949e' }}>dayonetools.app/dashboard</div>
    </div>
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
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
      {/* Main content */}
      <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '4px' }}>Dashboard</div>
        <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '14px' }}>Welcome back! Here's an overview of your business.</div>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'TOTAL INVOICES', val: '24', sub: '+3 from last month', icon: '📋' },
            { label: 'MONTHLY SALES', val: '$4,280', sub: '+12% from last month', icon: '💰' },
            { label: 'OUTSTANDING', val: '$1,150', sub: '3 unpaid invoices', icon: '⏳' },
            { label: 'CUSTOMERS', val: '12', sub: '+2 new this month', icon: '👥' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#161b22', borderRadius: '8px', padding: '10px', border: '1px solid #21262d' }}>
              <div style={{ fontSize: '9px', color: '#8b949e', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '2px' }}>{s.val}</div>
              <div style={{ fontSize: '9px', color: i === 1 ? '#10b981' : i === 3 ? '#10b981' : '#8b949e' }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Status overview + Quick actions */}
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
      </div>
    </div>
  </div>
);

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
      <div style={{ fontSize: '9px', color: '#8b949e', marginBottom: '4px', fontWeight: '500' }}>PUBLIC LINK</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ flex: 1, padding: '7px 10px', background: '#21262d', borderRadius: '6px', fontSize: '11px', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>dayonetools.app/s/inv-a7k9x</div>
        <div style={{ padding: '7px 10px', background: '#21262d', borderRadius: '6px', fontSize: '12px', color: '#8b949e', cursor: 'pointer' }}>📋</div>
      </div>
    </div>
    <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '8px', fontStyle: 'italic' }}>View limit enabled · 50 views remaining</div>
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
        padding: isMobile ? '32px 20px 0' : '48px 20px 0',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: isMobile ? '30px' : '42px',
          fontWeight: '700',
          color: colors.text,
          lineHeight: '1.2',
          marginBottom: '16px',
          maxWidth: '700px',
          letterSpacing: '-0.5px',
        }}>
          <span style={{ fontStyle: 'italic' }}>Easy-To-Use</span> Invoicing Platform That Scales With Your Business
        </h1>

        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          color: colors.textMuted,
          maxWidth: '580px',
          lineHeight: '1.6',
          marginBottom: '28px',
        }}>
          Day One is an invoicing platform built for small-medium businesses and freelancers to create professional invoices fast, manage clients, and get paid on time.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.accent} 100%)`, color: '#ffffff', fontSize: '15px', fontWeight: '600', textDecoration: 'none', borderRadius: '8px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)'; }}>
            Get Started <span style={{ fontSize: '16px' }}>›</span>
          </Link>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 4px', color: colors.accent, fontSize: '15px', fontWeight: '500', textDecoration: 'none', transition: 'gap 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.gap = '12px'; }}
            onMouseLeave={(e) => { e.currentTarget.style.gap = '8px'; }}>
            Talk to Us <span style={{ fontSize: '16px' }}>→</span>
          </Link>
        </div>

        {/* Dashboard mockup - wide, prominent, immediately visible */}
        <div style={{ width: '100%', maxWidth: '1100px', marginTop: '36px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, borderRadius: '12px 12px 0 0', overflow: 'hidden', boxShadow: '0 -4px 40px rgba(0,0,0,0.3)' }}>
            {isMobile ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '700px' }}><DashboardMockup /></div>
              </div>
            ) : (
              <DashboardMockup />
            )}
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <div style={{
        background: darkMode
          ? `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.08), transparent), ${colors.bg}`
          : `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.06), transparent), ${colors.bg}`,
        padding: isMobile ? '60px 16px 80px' : '100px 20px 120px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</div>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: colors.text, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              Smart invoicing in 3 simple steps
            </h2>
            <p style={{ fontSize: '16px', color: colors.textMuted, maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
              From creating your first invoice to getting paid faster. Each step is designed to save you time and give you complete control over your billing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {/* Step 1: Create */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent }}>1</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Create</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '20px' }}>
                Generate invoices with smart numbering, multi-currency support, multi-language options in 12 languages, and custom templates in one interface.
              </p>
              <CreateMockup />
            </div>

            {/* Step 2: Analyze */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent }}>2</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Analyze</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '20px' }}>
                Monitor invoice statuses with visual dashboards. Identify overdue payments and track cash flow instantly.
              </p>
              <AnalyzeMockup />
            </div>

            {/* Step 3: Share */}
            <div style={{
              background: darkMode ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              padding: '28px 24px',
              border: `1px solid ${darkMode ? '#21262d' : '#e5e7eb'}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: darkMode ? '#21262d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: colors.accent }}>3</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: 0 }}>Share</h3>
              </div>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '20px' }}>
                Send invoices with password protection, expiration dates, and view limits. Automated reminders ensure faster payments.
              </p>
              <ShareMockup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
