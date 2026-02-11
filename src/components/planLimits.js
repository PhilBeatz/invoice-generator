// planLimits.js
// Shared plan limits and enforcement logic for Day One Tools
// Import this in any component that needs to check/enforce limits
import React from 'react';

export var PLAN_LIMITS = {
  free: {
    invoicesPerMonth: 5,
    customers: 5,
    products: 10,
    emailsPerMonth: 0,
    categories: 3,
    paymentMethods: 1,
    employees: 0,
    analytics: false,
    advancedTemplates: false,
    prioritySupport: false,
  },
  solo: {
    invoicesPerMonth: 100,
    customers: 100,
    products: 100,
    emailsPerMonth: 50,
    categories: 10,
    paymentMethods: 5,
    employees: 0,
    analytics: true,
    advancedTemplates: true,
    prioritySupport: false,
  },
  pro: {
    invoicesPerMonth: 1000,
    customers: 2000,
    products: 1000,
    emailsPerMonth: 200,
    categories: 200,
    paymentMethods: 999999, // unlimited
    employees: 999999, // unlimited
    analytics: true,
    advancedTemplates: true,
    prioritySupport: true,
  },
};

// Get current user plan from localStorage (will be replaced by Supabase query)
export function getCurrentPlan() {
  try {
    var sub = JSON.parse(localStorage.getItem('dayonetools_subscription') || '{}');
    // Check if trial is still active
    if (sub.plan && sub.plan !== 'free' && sub.trialEnd) {
      var trialEnd = new Date(sub.trialEnd);
      if (trialEnd < new Date() && !sub.paid) {
        // Trial expired and not paid - revert to free
        return 'free';
      }
    }
    return sub.plan || 'free';
  } catch(e) {
    return 'free';
  }
}

// Get current month's invoice count
function getMonthlyInvoiceCount() {
  try {
    var invoices = JSON.parse(localStorage.getItem('dayonetools_invoices') || '[]');
    var now = new Date();
    return invoices.filter(function(inv) {
      var d = new Date(inv.createdAt || inv.issueDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  } catch(e) { return 0; }
}

// Get count for a resource
function getResourceCount(resource) {
  var keyMap = {
    customers: 'dayonetools_customers',
    products: 'dayonetools_products',
    categories: 'dayonetools_categories',
    paymentMethods: 'dayonetools_payment_methods',
    employees: 'dayonetools_employees',
  };
  var storageKey = keyMap[resource];
  if (!storageKey) return 0;
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]').length;
  } catch(e) { return 0; }
}

/**
 * Check if a user can perform an action based on their plan limits
 * @param {string} resource - 'invoicesPerMonth', 'customers', 'products', etc.
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string, message: string }}
 */
export function checkLimit(resource) {
  var plan = getCurrentPlan();
  var limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  var limit = limits[resource];

  // Boolean features (analytics, advancedTemplates, etc.)
  if (typeof limit === 'boolean') {
    return {
      allowed: limit,
      current: 0,
      limit: limit ? 1 : 0,
      plan: plan,
      message: limit ? '' : 'This feature requires a ' + (resource === 'prioritySupport' ? 'Pro' : 'Solo or Pro') + ' plan.',
    };
  }

  // Numeric limits
  var current;
  if (resource === 'invoicesPerMonth') {
    current = getMonthlyInvoiceCount();
  } else if (resource === 'emailsPerMonth') {
    // Email count would come from a counter in localStorage
    try { current = parseInt(localStorage.getItem('dayonetools_emails_this_month') || '0'); } catch(e) { current = 0; }
  } else {
    current = getResourceCount(resource);
  }

  var allowed = limit === 0 ? false : current < limit;
  var upgradeTo = plan === 'free' ? 'Solo' : plan === 'solo' ? 'Pro' : null;

  var message = '';
  if (!allowed) {
    if (limit === 0) {
      message = 'This feature is not available on the ' + plan.charAt(0).toUpperCase() + plan.slice(1) + ' plan.';
    } else {
      message = 'You have reached your ' + resource.replace(/([A-Z])/g, ' $1').toLowerCase() + ' limit (' + limit + '). ';
    }
    if (upgradeTo) {
      message += 'Upgrade to ' + upgradeTo + ' for more.';
    }
  }

  return { allowed: allowed, current: current, limit: limit, plan: plan, message: message };
}

/**
 * Usage: Call this before creating a new resource.
 *
 * Example in DashboardCustomers:
 *   import { checkLimit } from './planLimits';
 *
 *   var openCreate = function() {
 *     var check = checkLimit('customers');
 *     if (!check.allowed) {
 *       setLimitMessage(check.message);
 *       setShowLimitModal(true);
 *       return;
 *     }
 *     // proceed with creation...
 *   };
 *
 * Example in DashboardInvoices:
 *   var check = checkLimit('invoicesPerMonth');
 *   if (!check.allowed) { ... }
 *
 * Example for feature gating:
 *   var analyticsCheck = checkLimit('analytics');
 *   if (!analyticsCheck.allowed) { show upgrade prompt }
 */

/**
 * LimitModal component - drop this into any page that needs limit enforcement
 * Shows a modal when user hits a plan limit with upgrade CTA
 */
export function LimitModal({ open, onClose, message, planName }) {
  if (!open) return null;
  var C = { bgCard: '#161b22', text: '#e6edf3', tm: '#8b949e', bdr: '#30363d', grn: '#10b981', yel: '#f59e0b' };
  return React.createElement('div', {
    style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '16px' },
    onClick: onClose
  },
    React.createElement('div', {
      style: { background: C.bgCard, borderRadius: '12px', border: '1px solid ' + C.bdr, padding: '28px', maxWidth: '400px', width: '100%', textAlign: 'center' },
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { style: { fontSize: '40px', marginBottom: '12px' } }, '\uD83D\uDD12'),
      React.createElement('h3', { style: { fontSize: '17px', fontWeight: '700', color: C.text, margin: '0 0 8px' } }, 'Plan Limit Reached'),
      React.createElement('p', { style: { fontSize: '14px', color: C.tm, lineHeight: 1.5, margin: '0 0 20px' } }, message),
      React.createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
        React.createElement('button', { onClick: onClose, style: { padding: '9px 16px', background: '#21262d', border: '1px solid ' + C.bdr, borderRadius: '6px', color: C.text, fontSize: '13px', fontWeight: '500', cursor: 'pointer' } }, 'Got it'),
        React.createElement('button', {
          onClick: function() { window.location.href = window.location.origin + '/#/dashboard/pricing'; onClose(); },
          style: { padding: '9px 16px', background: C.grn, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
        }, '\u2191 Upgrade Plan')
      )
    )
  );
}


