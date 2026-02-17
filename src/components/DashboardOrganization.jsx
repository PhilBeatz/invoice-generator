import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrganization } from '../supabaseService';

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

  useEffect(() => {
    fetchOrganization().then(data => {
      if (data) {
        setOrgData({
          companyName: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          timezone: 'America/New_York',
          currency: 'USD',
          logo: data.logo || '',
          createdAt: data.createdAt || '',
          organizationId: data.id || '',
        });
      }
    }).catch(e => console.error('Error loading organization:', e));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const InfoItem = ({ icon, label, value, isLink, mono }) => (
    <div style={{
      padding: '16px 20px',
      background: colors.bgInput,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        {label}
      </div>
      <div style={{
        fontSize: mono ? '13px' : '15px',
        fontWeight: mono ? '400' : '500',
        color: isLink ? colors.accent : (value && value !== '\u2014' ? colors.text : colors.textMuted),
        fontFamily: mono ? "'SFMono-Regular', Consolas, monospace" : "'Inter', sans-serif",
        wordBreak: 'break-all',
      }}>
        {value || '\u2014'}
      </div>
    </div>
  );

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

      {/* Company Header Card */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '28px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        {orgData.logo ? (
          <img src={orgData.logo} alt="Logo" style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            objectFit: 'contain',
            background: colors.bgInput,
            padding: '4px',
            border: `1px solid ${colors.border}`,
          }} />
        ) : (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: `${colors.accent}15`,
            border: `1px solid ${colors.accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: colors.accent,
            flexShrink: 0,
          }}>
            🏢
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
            {orgData.companyName || 'Organization Name'}
          </div>
          <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {orgData.email && <span>✉️ {orgData.email}</span>}
            {orgData.phone && <span>📞 {orgData.phone}</span>}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <InfoItem icon="✉️" label="Email" value={orgData.email} isLink />
        <InfoItem icon="📞" label="Phone" value={orgData.phone} isLink />
        <InfoItem icon="🕐" label="Timezone" value={orgData.timezone?.replace('_', ' ')} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <InfoItem icon="📍" label="Address" value={orgData.address} />
        <InfoItem icon="📅" label="Created" value={formatDate(orgData.createdAt)} />
      </div>

      {/* Organization ID */}
      <InfoItem icon="#" label="Organization ID" value={orgData.organizationId} mono />
    </div>
  );
}
