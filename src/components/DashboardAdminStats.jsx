import React, { useState, useEffect, useCallback } from 'react';

// ── Sparkline SVG ──
function Sparkline({ data, color = '#10b981', width = 120, height = 40 }) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={color} strokeWidth="2" strokeOpacity="0.4" />
      </svg>
    );
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 4;
  const chartH = height - padding * 2;
  const step = (width - padding * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = padding + i * step;
    const y = padding + chartH - ((v - min) / range) * chartH;
    return `${x},${y}`;
  }).join(' ');
  const firstX = padding;
  const lastX = padding + (data.length - 1) * step;
  const areaPath = `M${firstX},${height} L${points.split(' ').map(p => p).join(' L')} L${lastX},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-admin-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-admin-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Chart SVG ──
function BarChart({ data, labels, colors: barColors, height = 200 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 4px' }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: barColors?.[i] || '#3b82f6' }}>
              {val > 0 ? val : ''}
            </span>
            <div style={{
              width: '100%',
              maxWidth: '40px',
              height: `${Math.max((val / max) * 100, 2)}%`,
              background: barColors?.[i] || '#3b82f6',
              borderRadius: '4px 4px 0 0',
              minHeight: '4px',
              transition: 'height 0.3s ease',
            }} />
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: '4px', padding: '6px 4px 0' }}>
          {labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardAdminStats({ darkMode = true }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState('daily'); // 'daily' | 'monthly'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage
      var authKeys = Object.keys(localStorage).filter(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
      if (authKeys.length === 0) throw new Error('Not authenticated');
      var session = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
      var accessToken = session.access_token;
      if (!accessToken) throw new Error('No access token');

      const response = await fetch(
        'https://yeligmxxckhcfubrmuzx.supabase.co/functions/v1/admin-stats',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
          },
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch admin stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

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
    purple: '#a855f7',
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
    purple: '#a855f7',
  };

  const cardStyle = {
    background: colors.bgCard,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    padding: '20px',
  };

  const statCardStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: colors.textMuted, fontFamily: "'Inter',sans-serif", fontSize: '14px' }}>
        Loading admin stats...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ fontSize: '16px', color: colors.red, marginBottom: '12px' }}>Failed to load admin stats</div>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>{error}</div>
        <button onClick={loadStats} style={{
          background: colors.accent, color: '#fff', border: 'none', borderRadius: '6px',
          padding: '8px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
        }}>Retry</button>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare chart data
  const dailyKeys = Object.keys(stats.dailySignups).sort();
  const dailyValues = dailyKeys.map(k => stats.dailySignups[k]);
  const dailyLabels = dailyKeys.map(k => k.slice(5)); // MM-DD

  const monthlyKeys = Object.keys(stats.monthlySignups).sort();
  const monthlyValues = monthlyKeys.map(k => stats.monthlySignups[k]);
  const monthlyLabels = monthlyKeys.map(k => {
    const [y, m] = k.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(m) - 1] + ' ' + y.slice(2);
  });

  // Plan distribution
  const planLabels = ['Trial', 'Trial Expired', 'Solo', 'Pro', 'No Plan'];
  const planKeys = ['trial', 'trial_expired', 'solo', 'pro', 'none'];
  const planValues = planKeys.map(k => stats.planCounts[k] || 0);
  const planColors = [colors.yellow, colors.orange, colors.accent, colors.purple, colors.textMuted];

  // Today's signups
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySignups = stats.dailySignups[todayKey] || 0;

  // This week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekSignups = dailyKeys
    .filter(k => new Date(k) >= sevenDaysAgo)
    .reduce((s, k) => s + stats.dailySignups[k], 0);

  // This month
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const monthSignups = stats.monthlySignups[thisMonthKey] || 0;

  // Conversion rate (trial → paid)
  const paidCount = (stats.planCounts.solo || 0) + (stats.planCounts.pro || 0);
  const conversionRate = stats.totalUsers > 0 ? ((paidCount / stats.totalUsers) * 100).toFixed(1) : '0.0';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const planBadge = (plan) => {
    const badgeColors = {
      trial: { bg: colors.yellow + '22', text: colors.yellow },
      trial_expired: { bg: colors.orange + '22', text: colors.orange },
      solo: { bg: colors.accent + '22', text: colors.accent },
      pro: { bg: colors.purple + '22', text: colors.purple },
      none: { bg: colors.textMuted + '22', text: colors.textMuted },
    };
    const c = badgeColors[plan] || badgeColors.none;
    return (
      <span style={{
        display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
        fontWeight: '600', background: c.bg, color: c.text, textTransform: 'capitalize',
      }}>
        {plan === 'trial_expired' ? 'Expired' : plan}
      </span>
    );
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '28px', fontFamily: "'Inter', sans-serif", maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: colors.text, margin: 0 }}>Admin Stats</h1>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>Signup and subscription metrics</p>
        </div>
        <button onClick={loadStats} style={{
          background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`,
          borderRadius: '6px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
          fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>Total Users</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: colors.text }}>{stats.totalUsers}</span>
            <Sparkline data={dailyValues.slice(-14)} color={colors.accent} />
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>Today</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: colors.green }}>{todaySignups}</span>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>{weekSignups} this week</span>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>This Month</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: colors.yellow }}>{monthSignups}</span>
            <Sparkline data={monthlyValues} color={colors.yellow} />
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>Conversion Rate</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: colors.purple }}>{conversionRate}%</span>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>{paidCount} paid</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Signups Over Time */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>Signups Over Time</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['daily', 'monthly'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  background: view === v ? colors.accent : colors.bgInput,
                  color: view === v ? '#fff' : colors.textMuted,
                  border: `1px solid ${view === v ? colors.accent : colors.border}`,
                  borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif", textTransform: 'capitalize',
                }}>{v}</button>
              ))}
            </div>
          </div>
          {view === 'daily' ? (
            <BarChart data={dailyValues} labels={dailyLabels} colors={dailyValues.map(() => colors.accent)} height={180} />
          ) : (
            <BarChart data={monthlyValues} labels={monthlyLabels} colors={monthlyValues.map(() => colors.accent)} height={180} />
          )}
        </div>

        {/* Plan Distribution */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '16px' }}>Plan Distribution</div>
          {planLabels.map((label, i) => {
            const val = planValues[i];
            const pct = stats.totalUsers > 0 ? ((val / stats.totalUsers) * 100).toFixed(0) : 0;
            return (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>{val} ({pct}%)</span>
                </div>
                <div style={{ height: '6px', background: colors.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: planColors[i], borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Signups Table */}
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '16px' }}>
          Recent Signups
          <span style={{ fontSize: '12px', fontWeight: '400', color: colors.textMuted, marginLeft: '8px' }}>
            Last 50
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: colors.textMuted, fontWeight: '500', fontSize: '12px' }}>User</th>
                {!isMobile && <th style={{ textAlign: 'left', padding: '8px 12px', color: colors.textMuted, fontWeight: '500', fontSize: '12px' }}>Email</th>}
                <th style={{ textAlign: 'left', padding: '8px 12px', color: colors.textMuted, fontWeight: '500', fontSize: '12px' }}>Signed Up</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: colors.textMuted, fontWeight: '500', fontSize: '12px' }}>Plan</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '10px 12px', color: colors.text }}>
                    {u.name || u.email.split('@')[0]}
                  </td>
                  {!isMobile && (
                    <td style={{ padding: '10px 12px', color: colors.textMuted }}>{u.email}</td>
                  )}
                  <td style={{ padding: '10px 12px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                    {formatDate(u.signedUp)}{!isMobile && (' ' + formatTime(u.signedUp))}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{planBadge(u.plan)}</td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={isMobile ? 3 : 4} style={{ padding: '20px', textAlign: 'center', color: colors.textMuted }}>
                    No signups yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
