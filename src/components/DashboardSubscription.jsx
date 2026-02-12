import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAN_LIMITS, fetchAndCachePlan, getCurrentPlan, getTrialDaysLeft } from './planLimits';

// Owner email - always shows Pro
var OWNER_EMAIL = 'phildouthard@gmail.com';

function checkIsOwner() {
  try {
    var authKeys = Object.keys(localStorage).filter(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
    if (authKeys.length === 0) return false;
    var session = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
    return session.user && session.user.email === OWNER_EMAIL;
  } catch(e) { return false; }
}

export default function DashboardSubscription({ darkMode = true }) {
  var navigate = useNavigate();
  var [isMobile, setIsMobile] = useState(false);
  var isOwner = checkIsOwner();
  var [currentPlan, setCurrentPlan] = useState(isOwner ? 'pro' : getCurrentPlan());
  var [subData, setSubData] = useState(isOwner ? { plan: 'pro', status: 'active' } : {});
  var [usage, setUsage] = useState({ invoices: 0, customers: 0, products: 0, categories: 0, paymentMethods: 0, employees: 0, emailsSent: 0 });
  var [showCancelModal, setShowCancelModal] = useState(false);
  var [cancelReason, setCancelReason] = useState('');

  useEffect(function() {
    var ck = function() { setIsMobile(window.innerWidth <= 768); }; ck();
    window.addEventListener('resize', ck); return function() { window.removeEventListener('resize', ck); };
  }, []);

  useEffect(function() {
    if (isOwner) {
      setCurrentPlan('pro');
      setSubData({ plan: 'pro', status: 'active' });
    } else {
      fetchAndCachePlan().then(function(plan) {
        setCurrentPlan(plan || 'none');
        try {
          var sub = JSON.parse(localStorage.getItem('dayonetools_subscription') || '{}');
          setSubData(sub);
        } catch(e) {}
      });
    }
    try {
      var inv = JSON.parse(localStorage.getItem('dayonetools_invoices') || '[]');
      var cust = JSON.parse(localStorage.getItem('dayonetools_customers') || '[]');
      var prod = JSON.parse(localStorage.getItem('dayonetools_products') || '[]');
      var cats = JSON.parse(localStorage.getItem('dayonetools_categories') || '[]');
      var pm = JSON.parse(localStorage.getItem('dayonetools_payment_methods') || '[]');
      var emp = JSON.parse(localStorage.getItem('dayonetools_employees') || '[]');
      var now = new Date();
      var monthInv = inv.filter(function(i) { var d = new Date(i.createdAt || i.issueDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
      setUsage({ invoices: monthInv.length, customers: cust.length, products: prod.length, categories: cats.length, paymentMethods: pm.length, employees: emp.length, emailsSent: 0 });
    } catch(e) {}
  }, []);

  var C = { bg: '#0d1117', bgCard: '#161b22', text: '#e6edf3', tm: '#8b949e', bdr: '#30363d', grn: '#10b981', acc: '#3b82f6', red: '#ef4444', yel: '#f59e0b' };

  var isTrialing = currentPlan === 'trial';
  var isExpired = currentPlan === 'trial_expired';
  var isPaid = currentPlan === 'solo' || currentPlan === 'pro';
  var trialDaysLeft = getTrialDaysLeft();
  var trialEnd = subData.trial_end;
  var periodEnd = subData.current_period_end;

  // Display plan name
  var displayPlan = 'Trial';
  if (currentPlan === 'none' || currentPlan === 'trial_expired') displayPlan = 'Expired';
  else if (currentPlan === 'solo') displayPlan = 'Solo';
  else if (currentPlan === 'pro') displayPlan = 'Pro';
  else if (currentPlan === 'trial') displayPlan = 'Trial';

  // Display period label
  var periodLabel = 'Trial Period';
  if (currentPlan === 'solo') periodLabel = '$8.99/month';
  else if (currentPlan === 'pro') periodLabel = '$14.99/month';

  // Status badge
  var statusBadge = { label: 'Active', color: C.grn };
  if (isTrialing) statusBadge = { label: 'Trial', color: C.yel };
  if (isExpired) statusBadge = { label: 'Expired', color: C.red };
  if (subData.status === 'past_due') statusBadge = { label: 'Past Due', color: C.red };
  if (subData.status === 'canceled') statusBadge = { label: 'Canceled', color: C.tm };

  // Next billing date
  var nextBillingDate = 'N/A';
  if (isTrialing && trialEnd) {
    nextBillingDate = new Date(trialEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } else if (isPaid && periodEnd) {
    nextBillingDate = new Date(periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Effective limits
  var effectivePlan = isTrialing ? 'trial' : currentPlan;
  var limits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.none;

  var usageMeters = [
    { label: 'Invoices', sub: 'Monthly invoices created', used: usage.invoices, limit: limits.invoicesPerMonth, icon: '\uD83D\uDCC4' },
    { label: 'Customers', sub: 'Customer records', used: usage.customers, limit: limits.customers, icon: '\uD83D\uDC65' },
    { label: 'Products', sub: 'Items in product catalog', used: usage.products, limit: limits.products, icon: '\uD83D\uDCE6' },
    { label: 'Categories', sub: 'Product category count', used: usage.categories, limit: limits.categories, icon: '\uD83C\uDFF7' },
    { label: 'Payment Methods', sub: 'Active payment methods', used: usage.paymentMethods, limit: limits.paymentMethods, icon: '\uD83D\uDCB3' },
    { label: 'Email Invoicing', sub: 'Monthly emails sent', used: usage.emailsSent, limit: limits.emailsPerMonth, icon: '\u2709\uFE0F' },
  ];
  if (limits.employees > 0) {
    usageMeters.push({ label: 'Employees', sub: 'Organization members', used: usage.employees, limit: limits.employees, icon: '\uD83D\uDC64' });
  }

  // Status tag helper
  var getUsageStatus = function(pct) {
    if (pct >= 100) return { label: 'Exceeded', color: C.red, bg: C.red + '20' };
    if (pct >= 80) return { label: 'High', color: C.yel, bg: C.yel + '20' };
    return { label: 'Good', color: C.grn, bg: C.grn + '20' };
  };

  return React.createElement('div', { style: { padding: isMobile ? '16px' : '24px', fontFamily: "'Inter',sans-serif" } },
    // Page Header
    React.createElement('div', { style: { marginBottom: '24px' } },
      React.createElement('h1', { style: { fontSize: '22px', fontWeight: '700', color: C.grn, margin: 0 } }, 'Subscription'),
      React.createElement('p', { style: { fontSize: '14px', color: C.tm, marginTop: '4px' } }, 'Manage your subscription plan and track usage metrics')
    ),

    // === TOP ROW: Current Plan + Management ===
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '16px', marginBottom: '20px' } },

      // Current Plan Card
      React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px' } },
        // Header row: Current Plan label + badges
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement('span', { style: { color: C.grn, fontSize: '18px' } }, '\u2713'),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: '15px', fontWeight: '700', color: C.text } }, 'Current Plan'),
              React.createElement('div', { style: { fontSize: '12px', color: C.tm } }, 'Next billing - ' + nextBillingDate)
            )
          ),
          React.createElement('div', { style: { display: 'flex', gap: '6px' } },
            isTrialing && React.createElement('span', { style: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: C.tm + '30', color: C.text } }, 'Trial'),
            React.createElement('span', { style: { padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: statusBadge.color + '20', color: statusBadge.color } }, '\u2713 ' + statusBadge.label)
          )
        ),
        // Plan name + price box
        React.createElement('div', { style: { background: C.bg, borderRadius: '8px', border: '1px solid ' + C.bdr, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '28px', fontWeight: '800', color: C.grn } }, displayPlan),
            React.createElement('div', { style: { fontSize: '13px', color: C.tm, marginTop: '2px' } }, periodLabel)
          ),
          React.createElement('div', { style: { fontSize: '32px' } }, '\uD83D\uDCCB')
        ),
        // Trial countdown
        isTrialing && React.createElement('div', { style: { background: C.yel + '10', border: '1px solid ' + C.yel + '30', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } },
          React.createElement('span', { style: { fontSize: '14px' } }, '\u23F3'),
          React.createElement('span', { style: { fontSize: '13px', color: C.yel, fontWeight: '600' } }, trialDaysLeft + ' day' + (trialDaysLeft !== 1 ? 's' : '') + ' remaining in your free trial'),
          React.createElement('span', { style: { fontSize: '11px', color: C.tm, marginLeft: 'auto' } }, 'Ends ' + (trialEnd ? new Date(trialEnd).toLocaleDateString() : ''))
        ),
        // Expired banner
        isExpired && React.createElement('div', { style: { background: C.red + '10', border: '1px solid ' + C.red + '30', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } },
          React.createElement('span', { style: { fontSize: '14px' } }, '\u26A0\uFE0F'),
          React.createElement('span', { style: { fontSize: '13px', color: C.red, fontWeight: '600' } }, 'Your trial has expired. Subscribe to regain access.')
        ),
        // Change Plan button
        React.createElement('button', {
          onClick: function() { navigate('/dashboard/pricing'); },
          style: { width: '100%', padding: '12px', background: C.grn, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }
        }, isPaid ? 'Change Plan' : 'Upgrade Now')
      ),

      // Management Card
      React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px', display: 'flex', flexDirection: 'column' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' } },
          React.createElement('span', { style: { fontSize: '16px' } }, '\u2699\uFE0F'),
          React.createElement('h3', { style: { fontSize: '15px', fontWeight: '700', color: C.text, margin: 0 } }, 'Management')
        ),
        // Billing Portal button
        React.createElement('button', {
          onClick: function() { /* Will open Stripe Customer Portal */ },
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 14px', background: C.bg, border: '1px solid ' + C.bdr, borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.15s' }
        },
          React.createElement('div', { style: { textAlign: 'left' } },
            React.createElement('div', { style: { fontSize: '13px', fontWeight: '600', color: C.text } }, '\uD83D\uDCCB Billing Portal'),
            React.createElement('div', { style: { fontSize: '11px', color: C.tm, marginTop: '2px' } }, 'Invoices & payment methods')
          ),
          React.createElement('span', { style: { color: C.tm, fontSize: '14px' } }, '\u2197')
        ),
        // Spacer
        React.createElement('div', { style: { flex: 1 } }),
        // Cancel Subscription button
        (isPaid || isTrialing) && React.createElement('button', {
          onClick: function() { setShowCancelModal(true); },
          style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', background: 'transparent', border: '1px solid ' + C.red + '40', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }
        },
          React.createElement('span', { style: { fontSize: '12px' } }, '\u26A0\uFE0F'),
          React.createElement('span', { style: { fontSize: '13px', fontWeight: '600', color: C.red } }, 'Cancel Subscription')
        )
      )
    ),

    // === USAGE METRICS ===
    React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px', marginBottom: '20px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } },
        React.createElement('span', { style: { fontSize: '16px' } }, '\uD83D\uDCCA'),
        React.createElement('h3', { style: { fontSize: '15px', fontWeight: '700', color: C.text, margin: 0 } }, 'Usage Metrics')
      ),
      React.createElement('p', { style: { fontSize: '12px', color: C.tm, margin: '0 0 16px' } }, 'Current month usage for your ' + (isTrialing ? 'TRIAL' : displayPlan.toUpperCase()) + ' plan.'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' } },
        usageMeters.map(function(m, i) {
          var pct = m.limit === 0 ? 0 : Math.min(100, Math.round((m.used / m.limit) * 100));
          var barColor = pct >= 90 ? C.red : pct >= 70 ? C.yel : C.grn;
          var limitLabel = m.limit >= 999999 ? 'Unlimited' : m.limit;
          var status = getUsageStatus(pct);
          return React.createElement('div', { key: i, style: { padding: '16px', background: C.bg, borderRadius: '8px', border: '1px solid ' + C.bdr } },
            // Header
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', fontWeight: '600', color: C.tm } }, m.icon + ' ' + m.label),
                React.createElement('div', { style: { fontSize: '11px', color: C.tm + '80', marginTop: '1px' } }, m.sub)
              ),
              React.createElement('span', { style: { padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: status.bg, color: status.color } }, status.label)
            ),
            // Count
            React.createElement('div', { style: { fontSize: '16px', fontWeight: '700', color: C.text, marginBottom: '8px' } },
              m.used + ' / ' + limitLabel
            ),
            // Bar
            React.createElement('div', { style: { width: '100%', height: '6px', background: C.bdr, borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' } },
              React.createElement('div', { style: { width: pct + '%', height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.3s' } })
            ),
            React.createElement('div', { style: { fontSize: '11px', color: C.tm, textAlign: 'right' } }, pct + '% used'),
            // Warning
            pct >= 100 && React.createElement('div', { style: { fontSize: '11px', color: C.red, marginTop: '6px', padding: '4px 8px', background: C.red + '10', borderRadius: '4px' } }, m.label + ' limit exceeded. Consider upgrading.')
          );
        })
      )
    ),

    // === PLAN LIMITS COMPARISON ===
    React.createElement('div', { style: { background: C.bgCard, borderRadius: '10px', border: '1px solid ' + C.bdr, padding: '24px' } },
      React.createElement('h3', { style: { fontSize: '15px', fontWeight: '600', color: C.text, margin: '0 0 16px' } }, '\uD83D\uDCCB Plan Limits'),
      React.createElement('div', { style: { overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { borderBottom: '1px solid ' + C.bdr } },
              React.createElement('th', { style: { padding: '8px 12px', textAlign: 'left', color: C.tm, fontWeight: '600' } }, 'Resource'),
              ['solo', 'pro'].map(function(p) {
                var isCur = (isPaid && currentPlan === p) || (isTrialing && p === 'pro');
                return React.createElement('th', { key: p, style: { padding: '8px 12px', textAlign: 'center', color: isCur ? C.grn : C.tm, fontWeight: '700' } },
                  (p === 'solo' ? 'Solo' : 'Pro') + (isCur ? ' \u2713' : ''),
                  React.createElement('div', { style: { fontSize: '11px', fontWeight: '500', color: C.tm } }, p === 'solo' ? '$8.99/month' : '$14.99/month')
                );
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
                ['solo', 'pro'].map(function(p) {
                  var val = PLAN_LIMITS[p][row.key];
                  var display = val === 0 ? '\u2015' : val >= 999999 ? 'Unlimited' : val.toLocaleString();
                  return React.createElement('td', { key: p, style: { padding: '8px 12px', textAlign: 'center', color: val === 0 ? C.tm + '40' : C.text, fontWeight: '600' } }, display);
                })
              );
            })
          )
        )
      )
    ),

    // === CANCEL SUBSCRIPTION MODAL ===
    showCancelModal && React.createElement('div', {
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '16px' },
      onClick: function() { setShowCancelModal(false); }
    },
      React.createElement('div', {
        style: { background: C.bgCard, borderRadius: '12px', border: '1px solid ' + C.bdr, padding: '28px', maxWidth: '440px', width: '100%' },
        onClick: function(e) { e.stopPropagation(); }
      },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
          React.createElement('div', { style: { fontSize: '36px', marginBottom: '8px' } }, '\u26A0\uFE0F'),
          React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 8px' } }, 'Cancel Subscription'),
          React.createElement('p', { style: { fontSize: '13px', color: C.tm, lineHeight: 1.5 } }, 'Are you sure you want to cancel? Here\u0027s what will happen:')
        ),
        // What happens list
        React.createElement('div', { style: { background: C.bg, borderRadius: '8px', border: '1px solid ' + C.bdr, padding: '14px', marginBottom: '16px' } },
          [
            'Your subscription remains active until your current period ends',
            'You keep full access to paid features until then',
            'No refunds for partial months',
            'After period ends, dashboard access will be restricted',
          ].map(function(item, i) {
            return React.createElement('div', { key: i, style: { display: 'flex', gap: '8px', marginBottom: i < 3 ? '8px' : 0, fontSize: '12px', color: C.tm } },
              React.createElement('span', { style: { color: C.yel, flexShrink: 0 } }, '\u2022'),
              React.createElement('span', null, item)
            );
          })
        ),
        // Cancellation reason
        React.createElement('div', { style: { marginBottom: '16px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: '600', color: C.tm, display: 'block', marginBottom: '6px' } }, 'Reason for canceling (optional)'),
          React.createElement('textarea', {
            value: cancelReason,
            onChange: function(e) { setCancelReason(e.target.value); },
            placeholder: 'Help us improve by sharing why you\u0027re canceling...',
            style: { width: '100%', padding: '10px', background: C.bg, border: '1px solid ' + C.bdr, borderRadius: '6px', color: C.text, fontSize: '13px', fontFamily: "'Inter',sans-serif", resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }
          })
        ),
        // Buttons
        React.createElement('div', { style: { display: 'flex', gap: '8px' } },
          React.createElement('button', {
            onClick: function() { setShowCancelModal(false); },
            style: { flex: 1, padding: '10px', background: '#21262d', border: '1px solid ' + C.bdr, borderRadius: '6px', color: C.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
          }, 'Keep Subscription'),
          React.createElement('button', {
            onClick: function() {
              // TODO: Call Stripe to cancel subscription
              setShowCancelModal(false);
              alert('Cancellation will be handled through Stripe Customer Portal. This feature will be connected when Billing Portal is set up.');
            },
            style: { flex: 1, padding: '10px', background: C.red, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
          }, 'Confirm Cancellation')
        )
      )
    )
  );
}
