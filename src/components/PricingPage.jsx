import React, { useState } from 'react';

var PLANS = {
  solo: {
    name: 'Solo',
    tagline: 'Perfect for solo entrepreneurs and freelancers',
    monthlyPrice: 8.99,
    yearlyPrice: 89.99,
    features: [
      { text: '100 invoices/month', included: true },
      { text: '100 customers', included: true },
      { text: '100 products', included: true },
      { text: '50 email invoices/month', included: true },
      { text: '10 categories', included: true },
      { text: '5 payment methods', included: true },
      { text: 'Advanced PDF templates', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Employee management', included: false },
      { text: 'Priority support', included: false },
    ],
    ctaStyle: 'outline',
    popular: false,
  },
  pro: {
    name: 'Pro',
    tagline: 'Everything you need to scale your business',
    monthlyPrice: 14.99,
    yearlyPrice: 149.99,
    features: [
      { text: '1,000 invoices/month', included: true },
      { text: '2,000 customers', included: true },
      { text: '1,000 products', included: true },
      { text: '200 email invoices/month', included: true },
      { text: '200 categories', included: true },
      { text: 'Unlimited payment methods', included: true },
      { text: 'Advanced PDF templates', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Employee management', included: true },
      { text: 'Priority support', included: true },
    ],
    ctaStyle: 'filled',
    popular: true,
  },
};

// currentPlan: 'none' (no trial started), 'trial' (in trial), 'trial_expired', 'solo', 'pro'
export default function PricingPage({ darkMode = true, currentPlan = 'none', trialDaysLeft = 0, onSelectPlan }) {
  var [billing, setBilling] = useState('monthly');
  var [showComparison, setShowComparison] = useState(false);

  var C = {
    bg: '#0d1117', bgCard: '#161b22', text: '#e6edf3', tm: '#8b949e',
    bdr: '#30363d', grn: '#10b981', acc: '#3b82f6', yel: '#f59e0b', red: '#ef4444',
  };

  var planKeys = ['solo', 'pro'];
  var isTrialing = currentPlan === 'trial';
  var isExpired = currentPlan === 'trial_expired';
  var isPaid = currentPlan === 'solo' || currentPlan === 'pro';

  // Header message based on status
  var headerMsg = 'Your 7-day free trial includes full Pro access. Choose a plan before it ends.';
  if (isTrialing) headerMsg = 'You have ' + trialDaysLeft + ' day' + (trialDaysLeft !== 1 ? 's' : '') + ' left in your free trial. Choose a plan to continue after your trial ends.';
  if (isExpired) headerMsg = 'Your free trial has ended. Choose a plan to continue using Day One.';
  if (isPaid) headerMsg = 'You are currently on the ' + currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) + ' plan.';

  return React.createElement('div', { style: { padding: '40px 20px', fontFamily: "'Inter',sans-serif", maxWidth: '900px', margin: '0 auto' } },
    // Trial expired banner
    isExpired && React.createElement('div', { style: { background: C.red + '15', border: '1px solid ' + C.red + '40', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', textAlign: 'center' } },
      React.createElement('span', { style: { fontSize: '15px', color: C.red, fontWeight: '600' } }, '\u26A0 Your 7-day free trial has expired. Subscribe to a plan to regain access to your dashboard.')
    ),
    // Trial active banner
    isTrialing && React.createElement('div', { style: { background: C.yel + '15', border: '1px solid ' + C.yel + '40', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', textAlign: 'center' } },
      React.createElement('span', { style: { fontSize: '15px', color: C.yel, fontWeight: '600' } }, '\u23F3 ' + trialDaysLeft + ' day' + (trialDaysLeft !== 1 ? 's' : '') + ' remaining in your free trial')
    ),
    // Header
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
      React.createElement('h1', { style: { fontSize: '32px', fontWeight: '800', color: C.text, margin: '0 0 8px' } }, 'Simple, transparent pricing'),
      React.createElement('p', { style: { fontSize: '16px', color: C.tm, margin: '0 0 24px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' } }, headerMsg),
      // Billing toggle
      React.createElement('div', { style: { display: 'inline-flex', background: C.bgCard, border: '1px solid ' + C.bdr, borderRadius: '8px', padding: '4px' } },
        ['monthly', 'yearly'].map(function(b) {
          var active = billing === b;
          return React.createElement('button', {
            key: b,
            onClick: function() { setBilling(b); },
            style: {
              padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              background: active ? C.grn : 'transparent',
              color: active ? '#fff' : C.tm,
            }
          }, b === 'monthly' ? 'Monthly' : 'Yearly (Save 17%)');
        })
      )
    ),
    // Plan cards - 2 column
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' } },
      planKeys.map(function(key) {
        var plan = PLANS[key];
        var price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
        var isCurrent = currentPlan === key;
        var isPopular = plan.popular;

        return React.createElement('div', {
          key: key,
          style: {
            background: C.bgCard, borderRadius: '12px',
            border: isPopular ? '2px solid ' + C.grn : '1px solid ' + C.bdr,
            padding: '0', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }
        },
          // Popular badge
          isPopular && React.createElement('div', { style: { background: C.grn, padding: '6px 0', textAlign: 'center' } },
            React.createElement('span', { style: { color: '#fff', fontSize: '12px', fontWeight: '700' } }, '\u2728 Most Popular')
          ),
          // Content
          React.createElement('div', { style: { padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column' } },
            React.createElement('h3', { style: { fontSize: '22px', fontWeight: '700', color: C.text, margin: '0 0 4px', textAlign: 'center' } }, plan.name),
            React.createElement('p', { style: { fontSize: '13px', color: C.tm, textAlign: 'center', margin: '0 0 20px' } }, plan.tagline),
            // Price
            React.createElement('div', { style: { textAlign: 'center', marginBottom: '24px' } },
              React.createElement('span', { style: { fontSize: '18px', fontWeight: '600', color: C.tm, verticalAlign: 'top', lineHeight: '1.8' } }, '$'),
              React.createElement('span', { style: { fontSize: '44px', fontWeight: '800', color: C.text } }, price.toFixed(2).split('.')[0]),
              React.createElement('span', { style: { fontSize: '20px', fontWeight: '600', color: C.tm } }, '.' + price.toFixed(2).split('.')[1]),
              React.createElement('div', { style: { fontSize: '13px', color: C.tm, fontWeight: '600', marginTop: '2px' } }, billing === 'monthly' ? 'PER MONTH' : 'PER YEAR')
            ),
            // Features
            React.createElement('div', { style: { marginBottom: '24px', flex: 1 } },
              React.createElement('div', { style: { fontSize: '12px', fontWeight: '700', color: C.tm, marginBottom: '12px' } }, 'Includes'),
              plan.features.map(function(f, i) {
                return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                  React.createElement('span', { style: { color: f.included ? C.grn : C.tm + '60', fontSize: '14px', flexShrink: 0 } }, f.included ? '\u2713' : '\u2715'),
                  React.createElement('span', { style: { fontSize: '13px', color: f.included ? C.text : C.tm + '60', textDecoration: f.included ? 'none' : 'line-through' } }, f.text)
                );
              })
            ),
            // CTA button
            isCurrent
              ? React.createElement('button', {
                  disabled: true,
                  style: { width: '100%', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'default', border: '2px solid ' + C.bdr, background: C.tm + '30', color: C.tm }
                }, 'Current Plan')
              : React.createElement('button', {
                  onClick: function() { if (onSelectPlan) onSelectPlan(key, billing); },
                  style: {
                    width: '100%', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    border: plan.ctaStyle === 'filled' ? 'none' : '2px solid ' + C.bdr,
                    background: plan.ctaStyle === 'filled' ? C.grn : 'transparent',
                    color: plan.ctaStyle === 'filled' ? '#fff' : C.text,
                    transition: 'all 0.2s',
                  }
                }, (isTrialing || isExpired ? 'Subscribe to ' : 'Get ') + plan.name + ' (' + (billing === 'monthly' ? 'Monthly' : 'Yearly') + ')'),
            // Trial note under CTA
            !isCurrent && isTrialing && React.createElement('p', { style: { fontSize: '11px', color: C.tm, textAlign: 'center', marginTop: '8px' } }, 'You won\u0027t be charged until your trial ends')
          )
        );
      })
    ),
    // Feature comparison
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '16px' } },
      React.createElement('button', {
        onClick: function() { setShowComparison(!showComparison); },
        style: { background: 'none', border: 'none', color: C.tm, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }
      }, showComparison ? 'Hide detailed comparison' : 'View detailed feature comparison')
    ),
    showComparison && React.createElement('div', { style: { background: C.bgCard, borderRadius: '12px', border: '1px solid ' + C.bdr, padding: '24px', marginBottom: '40px' } },
      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 16px', textAlign: 'center' } }, 'Feature Comparison'),
      React.createElement('div', { style: { overflowX: 'auto' } },
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { borderBottom: '1px solid ' + C.bdr } },
              React.createElement('th', { style: { padding: '10px 12px', textAlign: 'left', color: C.tm, fontWeight: '600' } }, 'Feature'),
              planKeys.map(function(key) {
                return React.createElement('th', { key: key, style: { padding: '10px 12px', textAlign: 'center', color: C.text, fontWeight: '700' } }, PLANS[key].name);
              })
            )
          ),
          React.createElement('tbody', null,
            [
              { label: 'Invoices/month', values: { solo: '100', pro: '1,000' } },
              { label: 'Customers', values: { solo: '100', pro: '2,000' } },
              { label: 'Products', values: { solo: '100', pro: '1,000' } },
              { label: 'Email invoicing/month', values: { solo: '50', pro: '200' } },
              { label: 'Categories', values: { solo: '10', pro: '200' } },
              { label: 'Payment methods', values: { solo: '5', pro: 'Unlimited' } },
              { label: 'Advanced PDF templates', values: { solo: true, pro: true } },
              { label: 'Analytics dashboard', values: { solo: true, pro: true } },
              { label: 'Employee management', values: { solo: false, pro: true } },
              { label: 'Priority support', values: { solo: false, pro: true } },
            ].map(function(row, i) {
              return React.createElement('tr', { key: i, style: { borderBottom: '1px solid ' + C.bdr } },
                React.createElement('td', { style: { padding: '8px 12px', color: C.text } }, row.label),
                planKeys.map(function(key) {
                  var val = row.values[key];
                  if (typeof val === 'boolean') {
                    return React.createElement('td', { key: key, style: { padding: '8px 12px', textAlign: 'center' } },
                      React.createElement('span', { style: { color: val ? C.grn : C.tm + '40', fontSize: '16px' } }, val ? '\u2713' : '\u2715')
                    );
                  }
                  return React.createElement('td', { key: key, style: { padding: '8px 12px', textAlign: 'center', color: C.text, fontWeight: '600' } }, val);
                })
              );
            })
          )
        )
      )
    ),
    // Footer
    React.createElement('div', { style: { textAlign: 'center', marginTop: '20px' } },
      React.createElement('p', { style: { fontSize: '13px', color: C.tm } }, '7-day free trial with full Pro access. No credit card required. Cancel or change plans anytime.'),
      React.createElement('p', { style: { fontSize: '12px', color: C.tm + '80', marginTop: '8px' } }, 'Questions? Contact support@dayonetools.app')
    )
  );
}
