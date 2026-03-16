import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardOverview from './DashboardOverview';
import DashboardPlaceholder from './DashboardPlaceholder';
import DashboardAnalytics from './DashboardAnalytics';
import DashboardEmployees from './DashboardEmployees';
import DashboardPaymentMethods from './DashboardPaymentMethods';
import PricingPage from './PricingPage';
import DashboardSubscription from './DashboardSubscription';
import DashboardCustomers from './DashboardCustomers';
import DashboardInvoices from './DashboardInvoices';
import DashboardProducts from './DashboardProducts';
import DashboardCategories from './DashboardCategories';
import DashboardOrganization from './DashboardOrganization';
import DashboardSettings from './DashboardSettings';
import InvoiceDetail from './InvoiceDetail';
import DashboardConfiguration from './DashboardConfiguration';
import DashboardProposals from './DashboardProposals';
import ProposalAnalytics from './ProposalAnalytics';
import InvoiceGenerator from './InvoiceGenerator';
import DashboardAdminStats from './DashboardAdminStats';
import { getCurrentPlan, fetchAndCachePlan, hasDashboardAccess, getTrialDaysLeft } from './planLimits';

// Owner email - always gets full access (must match planLimits.js)
var OWNER_EMAIL = 'phildouthard@gmail.com';

function checkIsOwner() {
  try {
    var authKeys = Object.keys(localStorage).filter(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
    if (authKeys.length === 0) return false;
    var session = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
    return session.user && session.user.email === OWNER_EMAIL;
  } catch(e) { return false; }
}

// Gate component — defined OUTSIDE DashboardLayout to keep stable React identity
function PaidRoute({ hasAccess, planLoaded, isOwnerUser, darkMode, children }) {
  if (!planLoaded && !isOwnerUser) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: darkMode ? '#8b949e' : '#6b7280', fontFamily: "'Inter',sans-serif", fontSize: '14px' }}>Loading...</div>;
  }
  if (!hasAccess) {
    return <Navigate to="/dashboard/pricing" replace />;
  }
  return children;
}

export default function DashboardLayout({ darkMode = true, user }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan());
  const [planLoaded, setPlanLoaded] = useState(false);
  const [isOwnerUser, setIsOwnerUser] = useState(checkIsOwner());
  const location = useLocation();

  // Fetch plan from Supabase on mount only
  useEffect(() => {
    setIsOwnerUser(checkIsOwner());
    fetchAndCachePlan().then(function(plan) {
      setCurrentPlan(plan || 'none');
      setPlanLoaded(true);
    }).catch(function() {
      setCurrentPlan(getCurrentPlan());
      setPlanLoaded(true);
    });

    // Fire Google Ads conversion event on dashboard load (post-signup)
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11290882844/signup'
      });
    }
  }, []);

  // Trial starts automatically on signup via Supabase trigger
  // No manual trial start needed

  // Check if user has access (owner always does, trial/paid users do)
  var hasAccess = isOwnerUser || currentPlan === 'trial' || currentPlan === 'solo' || currentPlan === 'pro';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colors = darkMode ? {
    bg: '#0d1117',
    text: '#e6edf3',
    border: '#21262d',
  } : {
    bg: '#f1f5f9',
    text: '#1f2937',
    border: '#e5e7eb',
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', height: 'calc(100vh - 73px)', background: colors.bg }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <DashboardSidebar darkMode={darkMode} isMobile={false} user={user} />
      )}

      {/* Sidebar - Mobile overlay */}
      {isMobile && (
        <DashboardSidebar 
          darkMode={darkMode} 
          isMobile={true} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Mobile Header Bar */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderBottom: `1px solid ${colors.border}`,
            background: darkMode ? '#0d1117' : '#ffffff',
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: colors.text,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ☰
            </button>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: colors.text, 
              fontFamily: "'Inter', sans-serif" 
            }}>
              Dashboard
            </span>
          </div>
        )}

        {/* Dashboard Routes */}
        <Routes>
          <Route index element={
            !planLoaded && !isOwnerUser
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: darkMode ? '#8b949e' : '#6b7280', fontFamily: "'Inter',sans-serif", fontSize: '14px' }}>Loading...</div>
              : hasAccess ? <DashboardOverview darkMode={darkMode} /> : <Navigate to="/dashboard/pricing" replace />
          } />
          <Route path="create" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><InvoiceGenerator darkMode={darkMode} inDashboard={true} user={user} /></PaidRoute>
          } />
          <Route path="analytics" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardAnalytics darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="vault" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardPlaceholder darkMode={darkMode} title="Vault" icon="🔒" description="Securely store and manage your important business documents in one place." /></PaidRoute>
          } />
          <Route path="invoices" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardInvoices darkMode={darkMode} user={user} /></PaidRoute>
          } />
          <Route path="invoices/:invoiceId" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><InvoiceDetail darkMode={darkMode} user={user} /></PaidRoute>
          } />
          <Route path="customers" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardCustomers darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="payment-methods" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardPaymentMethods darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="configuration" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardConfiguration darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="products" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardProducts darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="categories" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardCategories darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="properties" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardPlaceholder darkMode={darkMode} title="Properties" icon="🔧" description="Define custom properties and attributes for your products." /></PaidRoute>
          } />
          <Route path="proposals" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardProposals darkMode={darkMode} user={user} /></PaidRoute>
          } />
          <Route path="proposal-analytics" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><ProposalAnalytics darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="organization" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardOrganization darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="employees" element={
            <PaidRoute hasAccess={hasAccess} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardEmployees darkMode={darkMode} /></PaidRoute>
          } />
          {/* Admin-only route (owner) */}
          <Route path="admin-stats" element={
            <PaidRoute hasAccess={isOwnerUser} planLoaded={planLoaded} isOwnerUser={isOwnerUser} darkMode={darkMode}><DashboardAdminStats darkMode={darkMode} /></PaidRoute>
          } />
          {/* These routes are always accessible */}
          <Route path="pricing" element={
            <PricingPage darkMode={darkMode} currentPlan={currentPlan} trialDaysLeft={getTrialDaysLeft()} onSelectPlan={async function(plan, billing) {
              try {
                const session = JSON.parse(localStorage.getItem('sb-yeligmxxckhcfubrmuzx-auth-token') || '{}');
                const accessToken = session.access_token;
                const userEmail = session.user?.email || user?.email;
                const userId = session.user?.id || user?.id;
                
                const response = await fetch(
                  'https://yeligmxxckhcfubrmuzx.supabase.co/functions/v1/create-checkout-session',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + accessToken,
                    },
                    body: JSON.stringify({ plan, billing, userId, email: userEmail }),
                  }
                );
                const data = await response.json();
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert('Error creating checkout session: ' + (data.error || 'Unknown error'));
                }
              } catch (err) {
                alert('Error: ' + err.message);
              }
            }} />
          } />
          <Route path="subscription" element={
            <DashboardSubscription darkMode={darkMode} />
          } />
          <Route path="settings" element={
            <DashboardSettings darkMode={darkMode} user={user} />
          } />
        </Routes>
      </div>
    </div>
  );
}
