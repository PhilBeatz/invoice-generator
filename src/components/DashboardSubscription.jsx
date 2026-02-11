import React, { useState, useEffect } from 'react';
import { PLAN_LIMITS } from './planLimits';

export default function DashboardSubscription({ darkMode = true }) {
  var [isMobile, setIsMobile] = useState(false);
  var [currentPlan, setCurrentPlan] = useState('free');
  var [usage, setUsage] = useState({ invoices: 0, customers: 0, products: 0, categories: 0, paymentMethods: 0, employees: 0, emailsSent: 0 });
  var [trialEnd, setTrialEnd] = useState(null);

  useEffect(function() {
    var ck = function() { setIsMobile(window.innerWidth <= 768); }; ck();
    window.addEventListener('resize', ck); return function() { window.removeEventListener('resize', ck); };
  }, []);

  useEffect(function() {
    // Load subscription from localStorage (will be replaced by Supabase)
    try {
      var sub = JSON.parse(localStorage.getItem('dayonetools_subscription') || '{}');
      if (sub.plan) setCurrentPlan(sub.plan);
      if (sub.trialEnd) setTrialEnd(sub.trialEnd);
    } catch(e) {}

    // Calculate usage from localStorage
    try {
      var inv = JSON.parse(localStorage.getItem('dayonetools_invoices') || '[]');
      var cust = JSON.parse(localStorage.getItem('dayonetools_customers') || '[]');
      var prod = JSON.parse(localStorage.getItem('dayonetools_products') || '[]');
      var cats = JSON.parse(localStorage.getItem('dayonetools_categories') || '[]');
      var pm = JSON.parse(localStorage.getItem('dayonetools_payment_methods') || '[]');
      var emp = JSON.parse(localStorage.getItem('dayonetools_employees') || '[]');
      // Count invoices this month
      var now = new Date();
      var monthInv = inv.filter(function(i) { var d = new Date(i.createdAt || i.issueDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
      setUsage({ invoices: monthInv.length, customers: cust.length, products: prod.length, categories: cats.length, paymentMethods: pm.length, employees: emp.length, emailsSent: 0 });
    } catch(e) {}
  }, []);

  var limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;
  var C = { bg: '#0d1117', bgCard: '#161b22', text: '#e6edf3', tm: '#8b949e', bdr: '#30363d', grn: '#10b981', acc: '#3b82f6', red: '#ef4444', yel: '#f59e0b' };

  var planColors = { free: C.tm, solo: C.acc, pro: C.grn };
  var planLabels = { free: 'Free', solo: 'Solo', pro: 'Pro' };

  var isTrialing = trialEnd && new Date(trialEnd) > new Date();
  var trialDaysLeft = isTrialing ? Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  var usageMeters = [
    { label: 'Invoices (this month)', used: usage.invoices, limit: limits.invoicesPerMonth, icon: '\uD83D\uDCC4' },
    { label: 'Customers', used: usage.customers, limit: limits.customers, icon: '\uD83D\uDC65' },
    { label: 'Products', used: usage.products, limit: limits.products, icon: '\uD83D\uDCE6' },
    { label: 'Categories', used: usage.categories, limit: limits.categories, icon: '\uD83C\uDFF7' },
    { label: 'Payment Methods', used: usage.paymentMethods, limit: limits.paymentMethods, icon: '\uD83D\uDCB3' },
    { label: 'Email Invoicing (this month)', used: usage.emailsSent, limit: limits.emailsPerMonth, icon: '\u2709' },
  ];

  if (limits.employees > 0) {
    usageMeters.push({ label: 'Employees', used: usage.employees, limit: limits.employees, icon: '\uD83D\uDC64' });
  }

  return React.createElement('div', { style: { padding: isMobile ? '16px' : '24px', fontFamily: "'Inter',sans-serif" } },
    // Header
    React.createElement('div', { style: { marginBottom: '24px' } },
      React.createElement('h1', { style: { fontSize: '22px', fontWeight: '700', color: C.text, margin: 0 } }, 'Subscription'),
      React.createElement('p', { style: { fontSize: '14px', color: C.tm, marginTop: '4px' } }, 'Manage your plan and usage')
    ),

    // Current plan card
    React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px', marginBottom: '20px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '16px' } },
        React.createElement('div', null,
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' } },
            React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', color: C.text, margin: 0 } }, planLabels[currentPlan] + ' Plan'),
            React.createElement('span', { style: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#fff', background: planColors[currentPlan] } }, currentPlan === 'free' ? 'FREE' : 'ACTIVE')
          ),
          isTrialing && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: C.yel + '15', border: '1px solid ' + C.yel + '40', borderRadius: '6px', marginTop: '8px' } },
            React.createElement('span', { style: { fontSize: '13px' } }, '\u23F3'),
            React.createElement('span', { style: { fontSize: '13px', color: C.yel, fontWeight: '600' } }, trialDaysLeft + ' days left in trial')
          ),
          currentPlan !== 'free' && React.createElement('p', { style: { fontSize: '13px', color: C.tm, marginTop: '6px' } }, 'Next billing date: ' + (trialEnd ? new Date(new Date(trialEnd).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'))
        ),
        React.createElement('div', { style: { display: 'flex', gap: '8px' } },
          currentPlan !== 'pro' && React.createElement('button', {
            onClick: function() { window.location.hash = '#/dashboard/pricing'; },
            style: { padding: '9px 16px', background: C.grn, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
          }, '\u2191 Upgrade'),
          currentPlan !== 'free' && React.createElement('button', {
            onClick: function() { /* Will open Stripe Customer Portal */ },
            style: { padding: '9px 16px', background: 'transparent', border: '1px solid ' + C.bdr, borderRadius: '6px', color: C.text, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }
          }, 'Manage Billing')
        )
      )
    ),

    // Usage meters
    React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px', marginBottom: '20px' } },
      React.createElement('h3', { style: { fontSize: '15px', fontWeight: '600', color: C.text, margin: '0 0 16px' } }, '\uD83D\uDCCA Usage'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' } },
        usageMeters.map(function(m, i) {
          var pct = m.limit === 0 ? 0 : Math.min(100, Math.round((m.used / m.limit) * 100));
          var barColor = pct >= 90 ? C.red : pct >= 70 ? C.yel : C.grn;
          var limitLabel = m.limit === 999999 ? 'Unlimited' : m.limit;
          return React.createElement('div', { key: i, style: { padding: '12px', background: '#0d1117', borderRadius: '8px', border: '1px solid ' + C.bdr } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
              React.createElement('span', { style: { fontSize: '12px', fontWeight: '600', color: C.text } }, m.icon + ' ' + m.label),
              React.createElement('span', { style: { fontSize: '12px', fontWeight: '700', color: pct >= 90 ? C.red : C.tm } }, m.used + ' / ' + limitLabel)
            ),
            React.createElement('div', { style: { width: '100%', height: '6px', background: C.bdr, borderRadius: '3px', overflow: 'hidden' } },
              React.createElement('div', { style: { width: pct + '%', height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.3s' } })
            ),
            pct >= 90 && React.createElement('div', { style: { fontSize: '11px', color: C.red, marginTop: '4px', fontWeight: '500' } }, '\u26A0 Approaching limit' + (pct >= 100 ? ' \u2014 upgrade to continue' : ''))
          );
        })
      )
    ),

    // Plan comparison quick view
    React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px' } },
      React.createElement('h3', { style: { fontSize: '15px', fontWeight: '600', color: C.text, margin: '0 0 16px' } }, '\uD83D\uDCCB Plan Limits'),
      React.createElement('div', { style: { overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { borderBottom: '1px solid ' + C.bdr } },
              React.createElement('th', { style: { padding: '8px 12px', textAlign: 'left', color: C.tm, fontWeight: '600' } }, 'Resource'),
              ['free', 'solo', 'pro'].map(function(p) {
                var isCur = p === currentPlan;
                return React.createElement('th', { key: p, style: { padding: '8px 12px', textAlign: 'center', color: isCur ? planColors[p] : C.tm, fontWeight: '700' } }, planLabels[p] + (isCur ? ' \u2713' : ''));
              })
            )
          ),
          React.createElement('tbody', null,
            [
              { label: 'Invoices/month', key: 'invoicesPerMonth' },
              { label: 'Customers', key: 'customers' },
              { label: 'Products', key: 'products' },
              { label: 'Email invoicing/month', key: 'emailsPerMonth' },
              { label: 'Categories', key: 'categories' },
              { label: 'Payment methods', key: 'paymentMethods' },
              { label: 'Employees', key: 'employees' },
            ].map(function(row, i) {
              return React.createElement('tr', { key: i, style: { borderBottom: '1px solid ' + C.bdr } },
                React.createElement('td', { style: { padding: '8px 12px', color: C.text } }, row.label),
                ['free', 'solo', 'pro'].map(function(p) {
                  var val = PLAN_LIMITS[p][row.key];
                  var display = val === 0 ? '\u2015' : val >= 999999 ? 'Unlimited' : val.toLocaleString();
                  return React.createElement('td', { key: p, style: { padding: '8px 12px', textAlign: 'center', color: val === 0 ? C.tm + '40' : C.text, fontWeight: '500' } }, display);
                })
              );
            })
          )
        )
      )
    )
  );
}
