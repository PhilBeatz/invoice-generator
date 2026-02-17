import React, { useState, useEffect, useCallback } from 'react';
import { fetchProposals } from '../supabaseService';

// ── Mini Sparkline SVG ──
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
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Chart ──
function BarChart({ data, labels, colors: barColors, height = 200 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 4px' }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: barColors?.[i] || '#10b981' }}>
              {val > 0 ? val : ''}
            </span>
            <div style={{
              width: '100%', maxWidth: '40px',
              height: `${Math.max((val / max) * 100, 2)}%`,
              background: barColors?.[i] || '#10b981',
              borderRadius: '4px 4px 0 0', minHeight: '4px',
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

// ── Horizontal Bar ──
function HorizontalBar({ label, value, total, color, suffix = '' }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#8b949e' }}>{suffix}{typeof value === 'number' && !suffix ? value : value} ({pct.toFixed(0)}%)</span>
      </div>
      <div style={{ height: '6px', background: '#21262d', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

// ── Donut Chart ──
function DonutChart({ segments, size = 160 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', fontSize: '13px' }}>No data</div>;
  const radius = (size - 20) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = pct * circumference;
        const dashOffset = -offset;
        offset += dashLen;
        return (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={seg.color}
            strokeWidth="18" strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset} transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={radius - 16} fill="#161b22" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e6edf3" fontSize="20" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#8b949e" fontSize="11">Total</text>
    </svg>
  );
}

export default function ProposalAnalytics({ darkMode = true }) {
  const [proposals, setProposals] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(() => {
    fetchProposals().then(data => setProposals(data)).catch(e => console.error('Error loading proposals:', e));
  }, []);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  const colors = darkMode ? {
    bg: '#0d1117', bgCard: '#161b22', bgInput: '#21262d', text: '#e6edf3',
    textMuted: '#8b949e', border: '#30363d', accent: '#3b82f6', green: '#10b981',
    yellow: '#f59e0b', red: '#ef4444', orange: '#f97316', purple: '#8b5cf6',
  } : {
    bg: '#f1f5f9', bgCard: '#ffffff', bgInput: '#f8fafc', text: '#1f2937',
    textMuted: '#6b7280', border: '#e5e7eb', accent: '#3b82f6', green: '#10b981',
    yellow: '#f59e0b', red: '#ef4444', orange: '#f97316', purple: '#8b5cf6',
  };

  // Filter by date range
  const filteredProposals = proposals.filter(p => {
    if (dateRange === 'all') return true;
    if (!p.dateSubmitted) return false;
    const d = new Date(p.dateSubmitted + 'T00:00:00');
    const now = new Date();
    const daysAgo = (now - d) / (1000 * 60 * 60 * 24);
    return daysAgo <= parseInt(dateRange);
  });

  const fp = filteredProposals;

  // ── Key Metrics ──
  const totalValue = fp.reduce((s, p) => s + (p.proposalAmount || 0), 0);
  const soldProposals = fp.filter(p => p.status === 'Sold');
  const soldValue = soldProposals.reduce((s, p) => s + (p.proposalAmount || 0), 0);
  const deadProposals = fp.filter(p => p.status === 'Dead');
  const deadValue = deadProposals.reduce((s, p) => s + (p.proposalAmount || 0), 0);
  const activeProposals = fp.filter(p => !['Dead', 'Sold'].includes(p.status));
  const activeValue = activeProposals.reduce((s, p) => s + (p.proposalAmount || 0), 0);
  const winRate = fp.length > 0 ? ((soldProposals.length / fp.length) * 100) : 0;
  const avgDealSize = soldProposals.length > 0 ? soldValue / soldProposals.length : 0;
  const avgProposalSize = fp.length > 0 ? totalValue / fp.length : 0;

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  // ── Status Breakdown ──
  const statusCounts = {};
  const statusValues = {};
  fp.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    statusValues[p.status] = (statusValues[p.status] || 0) + (p.proposalAmount || 0);
  });

  const statusColorMap = {
    'Client Review': colors.yellow, 'Sold': colors.green, 'Dead': colors.red,
    'Pending': colors.orange, 'Submitted': colors.accent, 'Negotiation': colors.purple,
  };

  const donutSegments = Object.entries(statusCounts).map(([status, count]) => ({
    label: status, value: count, color: statusColorMap[status] || colors.textMuted,
  }));

  // ── Monthly Trends (last 6 months) ──
  const monthLabels = [];
  const monthSubmitted = [];
  const monthSold = [];
  const monthValues = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    monthLabels.push(label);
    const monthProposals = proposals.filter(p => p.dateSubmitted && p.dateSubmitted.startsWith(key));
    monthSubmitted.push(monthProposals.length);
    monthSold.push(monthProposals.filter(p => p.status === 'Sold').length);
    monthValues.push(monthProposals.reduce((s, p) => s + (p.proposalAmount || 0), 0));
  }

  // ── Top Customers by Value ──
  const customerValues = {};
  const customerCounts = {};
  fp.forEach(p => {
    if (p.customer) {
      customerValues[p.customer] = (customerValues[p.customer] || 0) + (p.proposalAmount || 0);
      customerCounts[p.customer] = (customerCounts[p.customer] || 0) + 1;
    }
  });
  const topCustomers = Object.entries(customerValues).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCustomerVal = topCustomers.length > 0 ? topCustomers[0][1] : 1;

  // ── Top Services ──
  const serviceCounts = {};
  const serviceValues = {};
  fp.forEach(p => {
    if (p.service) {
      serviceCounts[p.service] = (serviceCounts[p.service] || 0) + 1;
      serviceValues[p.service] = (serviceValues[p.service] || 0) + (p.proposalAmount || 0);
    }
  });
  const topServices = Object.entries(serviceValues).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxServiceVal = topServices.length > 0 ? topServices[0][1] : 1;

  // ── State Breakdown ──
  const stateCounts = {};
  const stateValues = {};
  fp.forEach(p => {
    if (p.state) {
      stateCounts[p.state] = (stateCounts[p.state] || 0) + 1;
      stateValues[p.state] = (stateValues[p.state] || 0) + (p.proposalAmount || 0);
    }
  });
  const topStates = Object.entries(stateValues).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxStateVal = topStates.length > 0 ? topStates[0][1] : 1;

  // ── Assigned To Performance ──
  const assigneeCounts = {};
  const assigneeSold = {};
  const assigneeValues = {};
  fp.forEach(p => {
    const name = p.assignedTo || 'Unassigned';
    assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
    if (p.status === 'Sold') {
      assigneeSold[name] = (assigneeSold[name] || 0) + 1;
      assigneeValues[name] = (assigneeValues[name] || 0) + (p.proposalAmount || 0);
    }
  });

  const cardStyle = {
    background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '20px',
  };

  const statCards = [
    { label: 'Total Proposals', value: fp.length, icon: '📋', color: colors.accent, sparkData: monthSubmitted },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: '🎯', color: colors.green, sparkData: monthSold },
    { label: 'Total Pipeline', value: fmt(totalValue), icon: '💰', color: colors.yellow, sparkData: monthValues },
    { label: 'Revenue Won', value: fmt(soldValue), icon: '✅', color: colors.green },
    { label: 'Active Pipeline', value: fmt(activeValue), icon: '🔄', color: colors.orange },
    { label: 'Avg Deal Size', value: fmt(avgDealSize), icon: '📊', color: colors.purple },
  ];

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif", color: colors.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0 }}>Proposal Analytics</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>Insights into your proposal pipeline and performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{
            padding: '8px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`,
            borderRadius: '6px', color: colors.text, fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>
          <button onClick={() => setRefreshKey(k => k + 1)} style={{
            padding: '8px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`,
            borderRadius: '6px', color: colors.text, fontSize: '13px', cursor: 'pointer',
          }}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              </div>
              {stat.sparkData && <Sparkline data={stat.sparkData} color={stat.color} width={80} height={32} />}
            </div>
          </div>
        ))}
      </div>

      {/* Row: Status Donut + Monthly Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
        {/* Status Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>📊 Status Breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <DonutChart segments={donutSegments} size={140} />
            <div style={{ flex: 1 }}>
              {donutSegments.map((seg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', flex: 1 }}>{seg.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textMuted }}>{seg.value}</span>
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>{fmt(statusValues[seg.label] || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Submissions */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>📈 Monthly Submissions (Last 6 Months)</div>
          <BarChart data={monthSubmitted} labels={monthLabels}
            colors={monthSubmitted.map(() => colors.accent)} height={180} />
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
            <span>Total Submitted: <strong style={{ color: colors.text }}>{monthSubmitted.reduce((a, b) => a + b, 0)}</strong></span>
            <span>Total Won: <strong style={{ color: colors.green }}>{monthSold.reduce((a, b) => a + b, 0)}</strong></span>
          </div>
        </div>
      </div>

      {/* Row: Top Customers + Top Services */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Top Customers */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>👤 Top Customers by Value</div>
          {topCustomers.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data yet</div>
          ) : topCustomers.map(([name, val], i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{name}</span>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{fmt(val)} ({customerCounts[name]} proposals)</span>
              </div>
              <div style={{ height: '6px', background: colors.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(val / maxCustomerVal) * 100}%`, background: colors.accent, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top Services */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>🔧 Top Services by Value</div>
          {topServices.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data yet</div>
          ) : topServices.map(([name, val], i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{name}</span>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>{fmt(val)} ({serviceCounts[name]})</span>
              </div>
              <div style={{ height: '6px', background: colors.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(val / maxServiceVal) * 100}%`, background: colors.green, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row: States + Team Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Geographic Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>📍 Proposals by State</div>
          {topStates.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data yet</div>
          ) : topStates.map(([state, val], i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{state}</span>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{fmt(val)} ({stateCounts[state]})</span>
              </div>
              <div style={{ height: '5px', background: colors.bgInput, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(val / maxStateVal) * 100}%`, background: colors.orange, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Team Performance */}
        <div style={cardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>👥 Team Performance</div>
          {Object.keys(assigneeCounts).length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1]).map(([name, count], i) => {
                const sold = assigneeSold[name] || 0;
                const wr = count > 0 ? ((sold / count) * 100).toFixed(0) : 0;
                const revenue = assigneeValues[name] || 0;
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 60px 90px',
                    padding: '10px 12px', background: colors.bgInput, borderRadius: '6px',
                    alignItems: 'center', fontSize: '13px',
                  }}>
                    <div style={{ fontWeight: '500' }}>{name}</div>
                    <div style={{ textAlign: 'center', color: colors.textMuted }}>{count} sent</div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: `${colors.green}20`, color: colors.green }}>{wr}% win</span>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: '600', color: colors.green }}>{fmt(revenue)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Value Funnel */}
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>🔻 Pipeline Funnel</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Pipeline', value: totalValue, count: fp.length, color: colors.accent },
            { label: 'Active / In Review', value: activeValue, count: activeProposals.length, color: colors.yellow },
            { label: 'Won / Sold', value: soldValue, count: soldProposals.length, color: colors.green },
            { label: 'Lost / Dead', value: deadValue, count: deadProposals.length, color: colors.red },
          ].map((stage, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '16px', background: colors.bgInput, borderRadius: '8px', borderTop: `3px solid ${stage.color}` }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: stage.color }}>{fmt(stage.value)}</div>
              <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>{stage.label}</div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>{stage.count} proposals</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
