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
import InvoiceGenerator from './InvoiceGenerator';
import { getCurrentPlan, fetchAndCachePlan } from './planLimits';

// Wrapper that blocks free users from accessing paid features
function PaidRoute({ children, darkMode }) {
  const plan = getCurrentPlan();
  if (plan === 'free') {
    return React.createElement(Navigate, { to: '/dashboard/pricing', replace: true });
  }
  return children;
}

export default function DashboardLayout({ darkMode = true, user }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan());
  const [planLoaded, setPlanLoaded] = useState(false);
  const location = useLocation();

  // Fetch plan from Supabase on mount and after navigation (e.g. returning from Stripe)
  useEffect(() => {
    fetchAndCachePlan().then(function(plan) {
      setCurrentPlan(plan || 'free');
      setPlanLoaded(true);
    }).catch(function() {
      setCurrentPlan(getCurrentPlan());
      setPlanLoaded(true);
    });
  }, [location.pathname]);

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
          <Route index element={currentPlan === 'free' ? <Navigate to="/dashboard/pricing" replace /> : <DashboardOverview darkMode={darkMode} />} />
          <Route path="create" element={
            <PaidRoute darkMode={darkMode}><InvoiceGenerator darkMode={darkMode} inDashboard={true} user={user} /></PaidRoute>
          } />
          <Route path="analytics" element={
            <PaidRoute darkMode={darkMode}><DashboardAnalytics darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="vault" element={
            <PaidRoute darkMode={darkMode}><DashboardPlaceholder darkMode={darkMode} title="Vault" icon="🔒" description="Securely store and manage your important business documents in one place." /></PaidRoute>
          } />
          <Route path="invoices" element={
            <PaidRoute darkMode={darkMode}><DashboardInvoices darkMode={darkMode} user={user} /></PaidRoute>
          } />
          <Route path="invoices/:invoiceId" element={
            <PaidRoute darkMode={darkMode}><InvoiceDetail darkMode={darkMode} user={user} /></PaidRoute>
          } />
          <Route path="customers" element={
            <PaidRoute darkMode={darkMode}><DashboardCustomers darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="payment-methods" element={
            <PaidRoute darkMode={darkMode}><DashboardPaymentMethods darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="configuration" element={
            <PaidRoute darkMode={darkMode}><DashboardConfiguration darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="products" element={
            <PaidRoute darkMode={darkMode}><DashboardProducts darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="categories" element={
            <PaidRoute darkMode={darkMode}><DashboardCategories darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="properties" element={
            <PaidRoute darkMode={darkMode}><DashboardPlaceholder darkMode={darkMode} title="Properties" icon="🔧" description="Define custom properties and attributes for your products." /></PaidRoute>
          } />
          <Route path="organization" element={
            <PaidRoute darkMode={darkMode}><DashboardOrganization darkMode={darkMode} /></PaidRoute>
          } />
          <Route path="employees" element={
            <PaidRoute darkMode={darkMode}><DashboardEmployees darkMode={darkMode} /></PaidRoute>
          } />
          {/* These routes are always accessible */}
          <Route path="pricing" element={
            <PricingPage darkMode={darkMode} currentPlan={currentPlan} onSelectPlan={async function(plan, billing) {
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
            <DashboardSettings darkMode={darkMode} />
          } />
        </Routes>
      </div>
    </div>
  );
}
