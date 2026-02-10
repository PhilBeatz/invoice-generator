import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardOverview from './DashboardOverview';
import DashboardPlaceholder from './DashboardPlaceholder';
import DashboardCustomers from './DashboardCustomers';
import DashboardInvoices from './DashboardInvoices';
import DashboardProducts from './DashboardProducts';
import DashboardCategories from './DashboardCategories';
import DashboardOrganization from './DashboardOrganization';
import DashboardSettings from './DashboardSettings';
import InvoiceDetail from './InvoiceDetail';
import DashboardConfiguration from './DashboardConfiguration';
import InvoiceGenerator from './InvoiceGenerator';
import { migrateLocalInvoices } from '../supabaseService';

export default function DashboardLayout({ darkMode = true, user }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user && !localStorage.getItem('dayonetools_invoices_migrated')) {
      migrateLocalInvoices(user.id).then(result => {
        if (result.migrated > 0) {
          console.log(`Migrated ${result.migrated} invoices to Supabase`);
        }
      });
    }
  }, [user]);

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
          <Route index element={<DashboardOverview darkMode={darkMode} />} />
          <Route path="create" element={<InvoiceGenerator darkMode={darkMode} inDashboard={true} user={user} />} />
          <Route path="analytics" element={
            <DashboardPlaceholder darkMode={darkMode} title="Analytics" icon="📈" description="Track your revenue, invoice trends, and business growth with interactive charts and reports." />
          } />
          <Route path="vault" element={
            <DashboardPlaceholder darkMode={darkMode} title="Vault" icon="🔒" description="Securely store and manage your important business documents in one place." />
          } />
          <Route path="invoices" element={
            <DashboardInvoices darkMode={darkMode} user={user} />
          } />
          <Route path="invoices/:invoiceId" element={
            <InvoiceDetail darkMode={darkMode} user={user} />
          } />
          <Route path="customers" element={
            <DashboardCustomers darkMode={darkMode} />
          } />
          <Route path="payment-methods" element={
            <DashboardPlaceholder darkMode={darkMode} title="Payment Methods" icon="💳" description="Configure your accepted payment methods including bank transfers, PayPal, and crypto." />
          } />
          <Route path="configuration" element={
            <DashboardConfiguration darkMode={darkMode} />
          } />
          <Route path="products" element={
            <DashboardProducts darkMode={darkMode} />
          } />
          <Route path="categories" element={
            <DashboardCategories darkMode={darkMode} />
          } />
          <Route path="properties" element={
            <DashboardPlaceholder darkMode={darkMode} title="Properties" icon="🔧" description="Define custom properties and attributes for your products." />
          } />
          <Route path="organization" element={
            <DashboardOrganization darkMode={darkMode} />
          } />
          <Route path="employees" element={
            <DashboardPlaceholder darkMode={darkMode} title="Employees" icon="👤" description="Manage team members, roles, and permissions for your organization." />
          } />
          <Route path="settings" element={
            <DashboardSettings darkMode={darkMode} />
          } />
        </Routes>
      </div>
    </div>
  );
}
