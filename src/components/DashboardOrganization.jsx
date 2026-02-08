import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardOrganization({ darkMode = true }) {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'America/New_York',
    currency: 'USD',
    logo: '',
    createdAt: '',
    organizationId: '',
  });

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
    green: '#10b981',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    green: '#10b981',
  };

  // Load organization data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dayonetools_organization');
    if (saved) {
      setOrgData(JSON.parse(saved));
    } else {
      // Initialize with default data
      const defaultOrg = {
        companyName: '',
        email: '',
        phone: '',
        address: '',
        timezone: 'America/New_York',
        currency: 'USD',
        logo: '',
        createdAt: new Date().toISOString(),
        organizationId: `org_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Try to get company name from business_info
      const businessInfo = localStorage.getItem('dayonetools_business_info');
      if (businessInfo) {
        const info = JSON.parse(businessInfo);
        defaultOrg.companyName = info.businessName || '';
        defaultOrg.email = info.businessEmail || '';
        defaultOrg.phone = info.businessPhone || '';
        defaultOrg.address = info.businessAddress || '';
      }
      
      setOrgData(defaultOrg);
      localStorage.setItem('dayonetools_organization', JSON.stringify(defaultOrg));
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const cardStyle = {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '24px',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: '6px',
  };

  const valueStyle = {
    fontSize: '15px',
    fontWeight: '500',
    color: colors.accent,
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, margin: 0 }}>
            My Organization
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Manage your organization settings and overview
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: colors.green,
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Organization Info Card */}
      <div style={cardStyle}>
        {/* Row 1: Company Name, Email, Phone */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '32px',
          marginBottom: '24px',
        }}>
          <div>
            <div style={labelStyle}>
              <span>🏢</span> Company Name
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: colors.text }}>
              {orgData.companyName || '—'}
            </div>
          </div>
          <div>
            <div style={labelStyle}>
              <span>✉️</span> Email
            </div>
            <div style={valueStyle}>
              {orgData.email || '—'}
            </div>
          </div>
          <div>
            <div style={labelStyle}>
              <span>📞</span> Phone
            </div>
            <div style={valueStyle}>
              {orgData.phone || '—'}
            </div>
          </div>
        </div>

        {/* Row 2: Address, Timezone */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '32px',
          marginBottom: '24px',
        }}>
          <div>
            <div style={labelStyle}>
              <span>📍</span> Address
            </div>
            <div style={{ fontSize: '15px', color: colors.text }}>
              {orgData.address || '—'}
            </div>
          </div>
          <div>
            <div style={labelStyle}>
              <span>🕐</span> Timezone
            </div>
            <div style={{ fontSize: '15px', color: colors.text }}>
              {orgData.timezone || '—'}
            </div>
          </div>
        </div>

        {/* Row 3: Created */}
        <div style={{ marginBottom: '24px' }}>
          <div style={labelStyle}>
            <span>📅</span> Created
          </div>
          <div style={{ fontSize: '15px', color: colors.text }}>
            {formatDate(orgData.createdAt)}
          </div>
        </div>

        {/* Row 4: Organization ID */}
        <div>
          <div style={labelStyle}>
            <span>#</span> Organization ID
          </div>
          <div style={{ 
            padding: '12px 16px',
            background: colors.bgInput,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: colors.textMuted,
          }}>
            {orgData.organizationId || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
