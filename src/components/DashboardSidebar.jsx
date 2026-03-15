import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

var OWNER_EMAIL = 'phildouthard@gmail.com';

function checkIsOwner() {
  try {
    var authKeys = Object.keys(localStorage).filter(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
    if (authKeys.length === 0) return false;
    var session = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
    return session.user && session.user.email === OWNER_EMAIL;
  } catch(e) { return false; }
}

export default function DashboardSidebar({ darkMode = true, isMobile = false, isOpen = true, onClose, user }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    invoice: true,
    products: false,
    proposals: false,
    organization: false,
  });
  const isOwner = checkIsOwner();

  // Get company name from user metadata or localStorage
  const getCompanyName = () => {
    // First check user metadata from Supabase
    if (user?.user_metadata?.company_name) {
      return user.user_metadata.company_name;
    }
    // Then check localStorage for saved business info
    const savedBusiness = localStorage.getItem('dayonetools_business_info');
    if (savedBusiness) {
      const businessInfo = JSON.parse(savedBusiness);
      if (businessInfo.name) return businessInfo.name;
    }
    // Fallback to user's name or email
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'My Business';
  };

  const companyName = getCompanyName();

  const colors = darkMode ? {
    bg: '#0d1117',
    bgHover: '#161b22',
    bgActive: '#3b82f6',
    text: '#c9d1d9',
    textActive: '#ffffff',
    textMuted: '#8b949e',
    border: '#21262d',
    sectionText: '#8b949e',
  } : {
    bg: '#ffffff',
    bgHover: '#f1f5f9',
    bgActive: '#3b82f6',
    text: '#374151',
    textActive: '#ffffff',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    sectionText: '#6b7280',
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path) => location.pathname === path;

  const navItemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: isActive(path) ? '500' : '400',
    color: isActive(path) ? colors.textActive : colors.text,
    background: isActive(path) ? colors.bgActive : 'transparent',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
    border: 'none',
    width: '100%',
    textAlign: 'left',
  });

  const subItemStyle = (path) => ({
    ...navItemStyle(path),
    padding: '8px 14px 8px 40px',
    fontSize: '13px',
  });

  const sectionHeaderStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.sectionText,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    padding: '20px 14px 8px',
    fontFamily: "'Inter', sans-serif",
  };

  const chevron = (isExpanded) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 'auto' }}>
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const sidebarContent = (
    <div style={{
      width: '240px',
      height: '100%',
      minHeight: '100%',
      background: colors.bg,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
    }}>
      {/* Company Name */}
      <div style={{ padding: '20px 14px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: darkMode ? '#ffffff' : '#1f2937', 
          fontFamily: "'Inter', sans-serif",
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {companyName}
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>Business Dashboard</div>
      </div>

      {/* Navigation - scrollable area */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {/* General */}
        <div style={sectionHeaderStyle}>General</div>

        <Link to="/dashboard" style={navItemStyle('/dashboard')} onClick={onClose}>
          <span style={{ fontSize: '16px' }}>📊</span> Dashboard
        </Link>
        <Link to="/dashboard/analytics" style={navItemStyle('/dashboard/analytics')} onClick={onClose}>
          <span style={{ fontSize: '16px' }}>📈</span> Analytics
        </Link>
        <Link to="/dashboard/vault" style={navItemStyle('/dashboard/vault')} onClick={onClose}>
          <span style={{ fontSize: '16px' }}>🔒</span> Vault
        </Link>

        {/* Admin Stats - owner only */}
        {isOwner && (
          <Link to="/dashboard/admin-stats" style={navItemStyle('/dashboard/admin-stats')} onClick={onClose}>
            <span style={{ fontSize: '16px' }}>👑</span> Admin Stats
          </Link>
        )}

        {/* Invoice Section */}
        <div style={sectionHeaderStyle}>Invoice</div>

        <button onClick={() => toggleSection('invoice')} style={{ ...navItemStyle(''), background: 'transparent', color: colors.text }}>
          <span style={{ fontSize: '16px' }}>📄</span> Invoice {chevron(expandedSections.invoice)}
        </button>
        {expandedSections.invoice && (
          <div>
            <Link to="/dashboard/create" style={subItemStyle('/dashboard/create')} onClick={onClose}>
              ＋ Create
            </Link>
            <Link to="/dashboard/invoices" style={subItemStyle('/dashboard/invoices')} onClick={onClose}>
              📋 Invoices
            </Link>
            <Link to="/dashboard/customers" style={subItemStyle('/dashboard/customers')} onClick={onClose}>
              👥 Customers
            </Link>
            <Link to="/dashboard/payment-methods" style={subItemStyle('/dashboard/payment-methods')} onClick={onClose}>
              💳 Payment Methods
            </Link>
            <Link to="/dashboard/configuration" style={subItemStyle('/dashboard/configuration')} onClick={onClose}>
              ⚙️ Configuration
            </Link>
          </div>
        )}

        {/* Products Section */}
        <button onClick={() => toggleSection('products')} style={{ ...navItemStyle(''), background: 'transparent', color: colors.text }}>
          <span style={{ fontSize: '16px' }}>📦</span> Products {chevron(expandedSections.products)}
        </button>
        {expandedSections.products && (
          <div>
            <Link to="/dashboard/products" style={subItemStyle('/dashboard/products')} onClick={onClose}>
              🏷️ Products
            </Link>
            <Link to="/dashboard/categories" style={subItemStyle('/dashboard/categories')} onClick={onClose}>
              📁 Categories
            </Link>
            <Link to="/dashboard/properties" style={subItemStyle('/dashboard/properties')} onClick={onClose}>
              🔧 Properties
            </Link>
          </div>
        )}

        {/* Proposal Management */}
        <div style={sectionHeaderStyle}>Proposal Management</div>

        <button onClick={() => toggleSection('proposals')} style={{ ...navItemStyle(''), background: 'transparent', color: colors.text }}>
          <span style={{ fontSize: '16px' }}>📝</span> Proposals {chevron(expandedSections.proposals)}
        </button>
        {expandedSections.proposals && (
          <div>
            <Link to="/dashboard/proposals" style={subItemStyle('/dashboard/proposals')} onClick={onClose}>
              📋 Proposal Log
            </Link>
            <Link to="/dashboard/proposal-analytics" style={subItemStyle('/dashboard/proposal-analytics')} onClick={onClose}>
              📊 Analytics
            </Link>
          </div>
        )}

        {/* Organization */}
        <div style={sectionHeaderStyle}>Organization</div>

        <button onClick={() => toggleSection('organization')} style={{ ...navItemStyle(''), background: 'transparent', color: colors.text }}>
          <span style={{ fontSize: '16px' }}>🏢</span> Organization {chevron(expandedSections.organization)}
        </button>
        {expandedSections.organization && (
          <div>
            <Link to="/dashboard/organization" style={subItemStyle('/dashboard/organization')} onClick={onClose}>
              🏠 My Organization
            </Link>
            <Link to="/dashboard/employees" style={subItemStyle('/dashboard/employees')} onClick={onClose}>
              👤 Employees
            </Link>
            <Link to="/dashboard/subscription" style={subItemStyle('/dashboard/subscription')} onClick={onClose}>
              💎 Subscription
            </Link>
            <Link to="/dashboard/settings" style={subItemStyle('/dashboard/settings')} onClick={onClose}>
              ⚙️ Settings
            </Link>
          </div>
        )}
      </nav>
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'relative', height: '100%', zIndex: 1 }}>
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return sidebarContent;
}
