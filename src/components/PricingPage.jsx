import React, { useState } from 'react';

var PLANS = {
  free: {
    name: 'Free',
    tagline: 'Get started with basic invoicing',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: '5 invoices/month', included: true },
      { text: '5 customers', included: true },
      { text: '10 products', included: true },
      { text: '0 Email Invoicing', included: false },
      { text: '3 categories', included: true },
      { text: '1 payment method', included: true },
      { text: 'Basic PDF export', included: true },
      { text: 'Analytics dashboard', included: false },
      { text: 'Employee management', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Current Plan',
    ctaStyle: 'outline',
    popular: false,
  },
  solo: {
    name: 'Solo',
    tagline: 'Perfect for solo entrepreneurs and freelancers',
    monthlyPrice: 8.99,
    yearlyPrice: 89.99,
    features: [
      { text: '100 invoices/month', included: true },
      { text: '100 customers', included: true },
      { text: '100 products', included: true },
      { text: '50 Email Invoicing', included: true },
      { text: '10 categories', included: true },
      { text: '5 payment methods', included: true },
      { text: 'Advanced PDF templates', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Employee management', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Solo',
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
      { text: '200 Email Invoicing', included: true },
      { text: '200 categories', included: true },
      { text: 'Unlimited payment methods', included: true },
      { text: 'Advanced PDF templates', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Employee management', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Upgrade to Pro',
    ctaStyle: 'filled',
    popular: true,
  },
};

export default function PricingPage({ darkMode = true, currentPlan = 'free', onSelectPlan }) {
  var [billing, setBilling] = useState('monthly');
  var [showComparison, setShowComparison] = useState(false);

  var C = {
    bg: '#0d1117', bgCard: '#161b22', text: '#e6edf3', tm: '#8b949e',
    bdr: '#30363d', grn: '#10b981', acc: '#3b82f6',
  };

  var planKeys = ['free', 'solo', 'pro'];

  return React.createElement('div', { style: { padding: '40px 20px', fontFamily: "'Inter',sans-serif", maxWidth: '1100px', margin: '0 auto' } },
    // Header
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
      React.createElement('h1', { style: { fontSize: '32px', fontWeight: '800', color: C.text, margin: '0 0 8px' } }, 'Simple, transparent pricing'),
      React.createElement('p', { style: { fontSize: '16px', color: C.tm, margin: '0 0 24px' } }, 'Start free. Upgrade when you need more. 7-day free trial on all paid plans.'),
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
    // Plan cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' } },
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
              price === 0
                ? React.createElement('div', { style: { fontSize: '40px', fontWeight: '800', color: C.text } }, 'Free')
                : React.createElement('div', null,
                    React.createElement('span', { style: { fontSize: '18px', fontWeight: '600', color: C.tm, verticalAlign: 'top', lineHeight: '1.8' } }, '$'),
                    React.createElement('span', { style: { fontSize: '44px', fontWeight: '800', color: C.text } }, price.toFixed(2).split('.')[0]),
                    React.createElement('span', { style: { fontSize: '20px', fontWeight: '600', color: C.tm } }, '.' + price.toFixed(2).split('.')[1]),
                    React.createElement('div', { style: { fontSize: '13px', color: C.tm, fontWeight: '600', marginTop: '2px' } }, billing === 'monthly' ? 'PER MONTH' : 'PER YEAR')
                  )
            ),
            // Features
            React.createElement('div', { style: { marginBottom: '24px', flex: 1 } },
              React.createElement('div', { style: { fontSize: '12px', fontWeight: '700', color: C.tm, marginBottom: '12px' } }, 'Key Features'),
              plan.features.slice(0, 7).map(function(f, i) {
                return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                  React.createElement('span', { style: { color: f.included ? C.grn : C.tm + '60', fontSize: '14px', flexShrink: 0 } }, f.included ? '\u2713' : '\u2715'),
                  React.createElement('span', { style: { fontSize: '13px', color: f.included ? C.text : C.tm + '60', textDecoration: f.included ? 'none' : 'line-through' } }, f.text)
                );
              }),
              plan.features.length > 7 && React.createElement('div', {
                onClick: function() { setShowComparison(!showComparison); },
                style: { fontSize: '12px', color: C.tm, marginTop: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
              }, '\u24D8 +' + (plan.features.length - 7) + ' more features in detailed comparison')
            ),
            // CTA
            React.createElement('button', {
              onClick: function() { if (!isCurrent && onSelectPlan) onSelectPlan(key, billing); },
              disabled: isCurrent,
              style: {
                width: '100%', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: isCurrent ? 'default' : 'pointer',
                border: plan.ctaStyle === 'filled' ? 'none' : '2px solid ' + C.bdr,
                background: isCurrent ? C.tm + '30' : plan.ctaStyle === 'filled' ? C.grn : 'transparent',
                color: isCurrent ? C.tm : plan.ctaStyle === 'filled' ? '#fff' : C.text,
                transition: 'all 0.2s',
              }
            },
              isCurrent ? 'Current Plan' : (price > 0 ? (plan.cta + ' (' + (billing === 'monthly' ? 'Monthly' : 'Yearly') + ')') : 'Get Started Free')
            ),
            // Trial note
            price > 0 && !isCurrent && React.createElement('p', { style: { fontSize: '11px', color: C.tm, textAlign: 'center', marginTop: '8px' } }, '7-day free trial \u2022 Cancel anytime')
          )
        );
      })
    ),
    // Feature comparison table
    showComparison && React.createElement('div', { style: { background: C.bgCard, borderRadius: '12px', border: '1px solid ' + C.bdr, padding: '24px', marginBottom: '40px' } },
      React.createElement('h3', { style: { fontSize: '18px', fontWeight: '700', color: C.text, margin: '0 0 16px', textAlign: 'center' } }, 'Detailed Feature Comparison'),
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
            PLANS.pro.features.map(function(_, i) {
              return React.createElement('tr', { key: i, style: { borderBottom: '1px solid ' + C.bdr } },
                React.createElement('td', { style: { padding: '8px 12px', color: C.text } }, PLANS.pro.features[i].text),
                planKeys.map(function(key) {
                  var f = PLANS[key].features[i];
                  return React.createElement('td', { key: key, style: { padding: '8px 12px', textAlign: 'center' } },
                    React.createElement('span', { style: { color: f && f.included ? C.grn : C.tm + '40', fontSize: '16px' } }, f && f.included ? '\u2713' : '\u2715')
                  );
                })
              );
            })
          )
        )
      )
    ),
    // FAQ
    React.createElement('div', { style: { textAlign: 'center', marginTop: '20px' } },
      React.createElement('p', { style: { fontSize: '13px', color: C.tm } }, 'All paid plans include a 7-day free trial. No credit card required to start. Cancel or downgrade anytime.'),
      React.createElement('p', { style: { fontSize: '12px', color: C.tm + '80', marginTop: '8px' } }, 'Questions? Contact support@dayonetools.app')
    )
  );
}
