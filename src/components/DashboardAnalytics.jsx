import React, { useState, useEffect, useCallback } from 'react';
import { fetchInvoices, fetchCustomers } from '../supabaseService';

// ── Mini Sparkline SVG Component ──
function Sparkline({ data, color = '#10b981', width = 120, height = 40 }) {
  if (!data || data.length < 2) {
    // Flat line if no data
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

  // Area fill
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

// ── Mini Bar Chart SVG Component ──
function BarChart({ data, labels, colors: barColors, width = '100%', height = 200 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 4px' }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: barColors?.[i] || '#10b981' }}>
              {val > 0 ? val : ''}
            </span>
            <div style={{
              width: '100%',
              maxWidth: '40px',
              height: `${Math.max((val / max) * 100, 2)}%`,
              background: barColors?.[i] || '#10b981',
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

// ── Horizontal Progress Bar ──
function ProgressBar({ label, value, total, color, formatValue }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: '#e6edf3', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#8b949e' }}>{formatValue ? formatValue(value) : value} ({pct.toFixed(0)}%)</span>
      </div>
      <div style={{ height: '6px', background: '#21262d', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}


export default function DashboardAnalytics({ darkMode = true }) {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dateRange, setDateRange] = useState('30');
  const [isMobile, setIsMobile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const loadData = useCallback(() => {
    fetchInvoices().then(data => setInvoices(data)).catch(e => console.error('Error loading invoices:', e));
    fetchCustomers().then(data => setCustomers(data)).catch(e => console.error('Error loading customers:', e));
  }, []);

  useEffect(() => { loadData(); }, [loadData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

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

  // ── Date Filtering ──
  const now = new Date();
  const daysBack = parseInt(dateRange);
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const prevStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const filterByDate = (items, field = 'createdAt') =>
    items.filter(item => {
      const d = new Date(item[field] || item.issueDate || item.createdAt);
      return d >= startDate && d <= now;
    });

  const filterPrevPeriod = (items, field = 'createdAt') =>
    items.filter(item => {
      const d = new Date(item[field] || item.issueDate || item.createdAt);
      return d >= prevStartDate && d < startDate;
    });

  const currentInvoices = filterByDate(invoices);
  const prevInvoices = filterPrevPeriod(invoices);
  const currentCustomers = filterByDate(customers);
  const prevCustomers = filterPrevPeriod(customers);

  // ── KPI Calculations ──
  const totalInvoices = currentInvoices.length;
  const prevTotalInvoices = prevInvoices.length;

  const totalSales = currentInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0);
  const prevTotalSales = prevInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0);

  const activeCustomers = currentCustomers.length;
  const prevActiveCustomers = prevCustomers.length;

  const avgInvoiceValue = totalInvoices > 0
    ? currentInvoices.reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0) / totalInvoices
    : 0;
  const prevAvgValue = prevTotalInvoices > 0
    ? prevInvoices.reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0) / prevTotalInvoices
    : 0;

  const calcChange = (curr, prev) => {
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0) return 100;
    return ((curr - prev) / prev) * 100;
  };

  // ── Sparkline Data (daily aggregation) ──
  const getDailyData = (items, valueField = null) => {
    const buckets = {};
    const days = Math.min(daysBack, 30);
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    items.forEach(item => {
      const d = new Date(item.createdAt || item.issueDate).toISOString().slice(0, 10);
      if (buckets[d] !== undefined) {
        buckets[d] += valueField ? (parseFloat(item[valueField]) || 0) : 1;
      }
    });
    return Object.values(buckets);
  };

  const invoiceSparkline = getDailyData(currentInvoices);
  const salesSparkline = getDailyData(currentInvoices.filter(i => i.status === 'paid'), 'total');
  const customerSparkline = getDailyData(currentCustomers);
  const avgSparkline = (() => {
    const counts = getDailyData(currentInvoices);
    const totals = getDailyData(currentInvoices, 'total');
    return counts.map((c, i) => c > 0 ? totals[i] / c : 0);
  })();

  // ── Status Breakdown ──
  const statusCounts = {};
  const statusAmounts = {};
  currentInvoices.forEach(inv => {
    const s = inv.status || 'draft';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
    statusAmounts[s] = (statusAmounts[s] || 0) + (parseFloat(inv.total) || 0);
  });

  const statusConfig = [
    { key: 'paid', label: 'Paid', color: colors.green },
    { key: 'sent', label: 'Sent', color: colors.accent },
    { key: 'pending', label: 'Pending', color: colors.yellow },
    { key: 'overdue', label: 'Overdue', color: colors.orange },
    { key: 'draft', label: 'Draft', color: colors.textMuted },
    { key: 'cancelled', label: 'Cancelled', color: colors.red },
  ];

  // ── Monthly Revenue Trend (last 6 months) ──
  const monthlyRevenue = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months.map(m => {
      const total = invoices
        .filter(inv => {
          const d = new Date(inv.createdAt || inv.issueDate);
          return d.getMonth() === m.month && d.getFullYear() === m.year && inv.status === 'paid';
        })
        .reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0);
      return { ...m, total };
    });
  })();

  // ── Monthly Invoice Count Trend ──
  const monthlyInvoiceCount = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months.map(m => {
      const count = invoices.filter(inv => {
        const d = new Date(inv.createdAt || inv.issueDate);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).length;
      return { ...m, count };
    });
  })();

  // ── Top Customers ──
  const topCustomers = (() => {
    const map = {};
    currentInvoices.forEach(inv => {
      const name = inv.customerName || 'Unknown';
      if (!map[name]) map[name] = { name, count: 0, total: 0 };
      map[name].count++;
      map[name].total += parseFloat(inv.total) || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  })();

  // ── Collection Rate ──
  const totalBilled = currentInvoices.reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0);
  const collectionRate = totalBilled > 0 ? (totalSales / totalBilled) * 100 : 0;
  const overdueAmount = currentInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((s, inv) => s + (parseFloat(inv.total) || 0), 0);

  const formatCurrency = (v) => `$${parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPct = (v) => {
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(1)}%`;
  };

  const cardStyle = {
    background: colors.bgCard,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  };

  const selectStyle = {
    padding: '8px 32px 8px 12px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    color: colors.text,
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
  };

  // ── Stat Card Component ──
  const StatCard = ({ title, value, change, subtitle, sparkData, sparkColor, icon }) => {
    const isPositive = change >= 0;
    const changeColor = change === 0 ? colors.textMuted : isPositive ? colors.green : colors.red;
    return (
      <div style={{ ...cardStyle, padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: isMobile ? 'auto' : '140px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: colors.textMuted }}>{title}</span>
          <span style={{ fontSize: '16px', opacity: 0.5 }}>{icon}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: colors.text, marginBottom: '4px', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', color: changeColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{change === 0 ? '—' : formatPct(change)}</span>
              <span style={{ color: colors.textMuted }}>{subtitle}</span>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Sparkline data={sparkData} color={sparkColor || colors.green} width={isMobile ? 80 : 120} height={36} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>Track your business performance and insights</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={selectStyle}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
          <button
            onClick={handleRefresh}
            title="Refresh data"
            style={{
              padding: '8px 10px',
              background: colors.bgInput,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          change={calcChange(totalInvoices, prevTotalInvoices)}
          subtitle="from last period"
          sparkData={invoiceSparkline}
          sparkColor={colors.green}
          icon="📊"
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          change={calcChange(totalSales, prevTotalSales)}
          subtitle="from last period"
          sparkData={salesSparkline}
          sparkColor={colors.green}
          icon="$"
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers}
          change={calcChange(activeCustomers, prevActiveCustomers)}
          subtitle={`${activeCustomers === 1 ? '1 new' : activeCustomers + ' new'} this period`}
          sparkData={customerSparkline}
          sparkColor={colors.green}
          icon="👥"
        />
        <StatCard
          title="Avg Invoice Value"
          value={formatCurrency(avgInvoiceValue)}
          change={calcChange(avgInvoiceValue, prevAvgValue)}
          subtitle="per invoice"
          sparkData={avgSparkline}
          sparkColor={colors.green}
          icon="📈"
        />
      </div>

      {/* ── Revenue Trend + Invoice Count ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Monthly Revenue */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0 }}>Revenue Trend</h3>
              <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>Last 6 months (paid invoices)</p>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: colors.green }}>{formatCurrency(monthlyRevenue.reduce((s, m) => s + m.total, 0))}</span>
          </div>
          <BarChart
            data={monthlyRevenue.map(m => m.total)}
            labels={monthlyRevenue.map(m => m.label)}
            colors={monthlyRevenue.map(() => colors.green)}
            height={180}
          />
        </div>

        {/* Monthly Invoice Count */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0 }}>Invoice Volume</h3>
              <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>Last 6 months (all invoices)</p>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: colors.accent }}>{monthlyInvoiceCount.reduce((s, m) => s + m.count, 0)}</span>
          </div>
          <BarChart
            data={monthlyInvoiceCount.map(m => m.count)}
            labels={monthlyInvoiceCount.map(m => m.label)}
            colors={monthlyInvoiceCount.map(() => colors.accent)}
            height={180}
          />
        </div>
      </div>

      {/* ── Status Breakdown + Collection + Top Customers ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Invoice Status Distribution */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 16px' }}>Status Distribution</h3>
          {statusConfig.map(({ key, label, color }) => {
            const count = statusCounts[key] || 0;
            if (count === 0 && key !== 'paid' && key !== 'draft') return null;
            return (
              <ProgressBar
                key={key}
                label={label}
                value={count}
                total={totalInvoices || 1}
                color={color}
              />
            );
          })}
          {totalInvoices === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: colors.textMuted, fontSize: '13px' }}>
              No invoices in this period
            </div>
          )}
        </div>

        {/* Collection & Revenue */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 16px' }}>Collection Overview</h3>

          {/* Collection Rate */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>Collection Rate</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: collectionRate >= 70 ? colors.green : collectionRate >= 40 ? colors.yellow : colors.red }}>{collectionRate.toFixed(0)}%</span>
            </div>
            <div style={{ height: '8px', background: colors.bgInput, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${collectionRate}%`, background: collectionRate >= 70 ? colors.green : collectionRate >= 40 ? colors.yellow : colors.red, borderRadius: '4px', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Total Billed', value: formatCurrency(totalBilled), color: colors.text },
              { label: 'Collected', value: formatCurrency(totalSales), color: colors.green },
              { label: 'Outstanding', value: formatCurrency(totalBilled - totalSales - overdueAmount), color: colors.yellow },
              { label: 'Overdue', value: formatCurrency(overdueAmount), color: colors.red },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>{row.label}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 16px' }}>Top Customers</h3>
          {topCustomers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCustomers.map((cust, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '6px', background: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: `${colors.accent}20`, color: colors.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', flexShrink: 0,
                    }}>
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cust.name}</div>
                      <div style={{ fontSize: '11px', color: colors.textMuted }}>{cust.count} invoice{cust.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors.green, flexShrink: 0, marginLeft: '8px' }}>{formatCurrency(cust.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: colors.textMuted, fontSize: '13px' }}>
              No customer data in this period
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue by Status ── */}
      <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 16px' }}>Revenue by Status</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          {statusConfig.map(({ key, label, color }) => {
            const count = statusCounts[key] || 0;
            const amount = statusAmounts[key] || 0;
            return (
              <div key={key} style={{
                padding: '14px',
                borderRadius: '8px',
                background: colors.bgInput,
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>{label}</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text, marginBottom: '2px' }}>{formatCurrency(amount)}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>{count} invoice{count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
