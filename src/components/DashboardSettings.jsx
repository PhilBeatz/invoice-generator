import React, { useState, useEffect } from 'react';
import { fetchOrganization, upsertOrganization } from '../supabaseService';

export default function DashboardSettings({ darkMode = true, user }) {
  const [isEditing, setIsEditing] = useState(false);
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
  const [formData, setFormData] = useState({ ...orgData });
  const [logoPreview, setLogoPreview] = useState('');

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
  };

  const timezones = [
    { value: 'America/New_York', label: 'New York (America) GMT-5' },
    { value: 'America/Chicago', label: 'Chicago (America) GMT-6' },
    { value: 'America/Denver', label: 'Denver (America) GMT-7' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (America) GMT-8' },
    { value: 'America/Anchorage', label: 'Anchorage (America) GMT-9' },
    { value: 'Pacific/Honolulu', label: 'Honolulu (Pacific) GMT-10' },
    { value: 'Europe/London', label: 'London (Europe) GMT+0' },
    { value: 'Europe/Paris', label: 'Paris (Europe) GMT+1' },
    { value: 'Europe/Berlin', label: 'Berlin (Europe) GMT+1' },
    { value: 'Asia/Tokyo', label: 'Tokyo (Asia) GMT+9' },
    { value: 'Asia/Shanghai', label: 'Shanghai (Asia) GMT+8' },
    { value: 'Asia/Dubai', label: 'Dubai (Asia) GMT+4' },
    { value: 'Australia/Sydney', label: 'Sydney (Australia) GMT+11' },
  ];

  const currencies = [
    { value: 'USD', label: '$ USD - US Dollar' },
    { value: 'EUR', label: '€ EUR - Euro' },
    { value: 'GBP', label: '£ GBP - British Pound' },
    { value: 'CAD', label: 'C$ CAD - Canadian Dollar' },
    { value: 'AUD', label: 'A$ AUD - Australian Dollar' },
    { value: 'JPY', label: '¥ JPY - Japanese Yen' },
    { value: 'INR', label: '₹ INR - Indian Rupee' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'CNY', label: '¥ CNY - Chinese Yuan' },
  ];

  // Load organization data from Supabase (with localStorage fallback)
  useEffect(() => {
    const loadOrg = async () => {
      try {
        const data = await fetchOrganization();
        if (data && data.name) {
          const orgFromDb = {
            companyName: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            timezone: 'America/New_York',
            currency: 'USD',
            logo: data.logo || '',
            createdAt: data.createdAt || '',
            organizationId: data.id || '',
          };
          setOrgData(orgFromDb);
          setFormData(orgFromDb);
          if (data.logo) setLogoPreview(data.logo);
          // Keep localStorage in sync
          localStorage.setItem('dayonetools_organization', JSON.stringify(orgFromDb));
          return;
        }
      } catch (e) {
        console.error('Error loading org from Supabase:', e);
      }
      // Fallback to localStorage
      const saved = localStorage.getItem('dayonetools_organization');
      if (saved) {
        const data = JSON.parse(saved);
        setOrgData(data);
        setFormData(data);
        if (data.logo) setLogoPreview(data.logo);
      } else {
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
        const businessInfo = localStorage.getItem('dayonetools_business_info');
        if (businessInfo) {
          const info = JSON.parse(businessInfo);
          defaultOrg.companyName = info.businessName || '';
          defaultOrg.email = info.businessEmail || '';
          defaultOrg.phone = info.businessPhone || '';
          defaultOrg.address = info.businessAddress || '';
        }
        setOrgData(defaultOrg);
        setFormData(defaultOrg);
        localStorage.setItem('dayonetools_organization', JSON.stringify(defaultOrg));
      }
    };
    loadOrg();
  }, []);

  const handleSave = async () => {
    const updatedData = {
      ...formData,
      logo: logoPreview,
      updatedAt: new Date().toISOString(),
    };
    setOrgData(updatedData);
    localStorage.setItem('dayonetools_organization', JSON.stringify(updatedData));
    
    // Also update business_info for invoice generator
    const businessInfo = {
      businessName: formData.companyName,
      businessEmail: formData.email,
      businessPhone: formData.phone,
      businessAddress: formData.address,
    };
    localStorage.setItem('dayonetools_business_info', JSON.stringify(businessInfo));

    // Save to Supabase
    if (user) {
      try {
        await upsertOrganization({
          name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          logo: logoPreview,
        }, user.id);
      } catch (e) {
        console.error('Error saving org to Supabase:', e);
      }
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(orgData);
    setLogoPreview(orgData.logo || '');
    setIsEditing(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    color: colors.text,
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text,
    marginBottom: '8px',
  };

  const helperStyle = {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '6px',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
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
            Company Settings
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Manage your company's information and settings
          </p>
        </div>
        <button
          style={{
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: colors.textMuted,
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Company Information Card */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        {/* Card Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '18px' }}>🏢</span>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>
                Company Information
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
              Manage your company details for invoices and branding
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
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
              }}
            >
              Edit Settings ✏️
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 18px',
                  background: colors.green,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px' }}>
          {/* Row 1: Company Name & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                <span>🏢</span> Company Name
              </label>
              {isEditing ? (
                <input
                  style={inputStyle}
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              ) : (
                <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted }}>
                  {orgData.companyName || 'Not set'}
                </div>
              )}
              <p style={helperStyle}>Name that appears on invoices and official documents.</p>
            </div>
            <div>
              <label style={labelStyle}>
                <span>✉️</span> Company Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="Enter company email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted }}>
                  {orgData.email || 'Not set'}
                </div>
              )}
              <p style={helperStyle}>Primary email for business communications.</p>
            </div>
          </div>

          {/* Row 2: Phone & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                <span>📞</span> Company Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  style={inputStyle}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted }}>
                  {orgData.phone || 'Not set'}
                </div>
              )}
              <p style={helperStyle}>Phone number for business contact.</p>
            </div>
            <div>
              <label style={labelStyle}>
                <span>$</span> Default Currency
              </label>
              {isEditing ? (
                <select
                  style={selectStyle}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  {currencies.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted }}>
                  {currencies.find(c => c.value === orgData.currency)?.label || orgData.currency}
                </div>
              )}
              <p style={helperStyle}>Default currency for invoices and financial data.</p>
            </div>
          </div>

          {/* Row 3: Timezone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              <span>🕐</span> Timezone
            </label>
            {isEditing ? (
              <select
                style={{ ...selectStyle, maxWidth: '400px' }}
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            ) : (
              <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted, maxWidth: '400px' }}>
                {timezones.find(tz => tz.value === orgData.timezone)?.label || orgData.timezone}
              </div>
            )}
            <p style={helperStyle}>Timezone for dates and scheduling.</p>
          </div>

          {/* Row 4: Address */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              <span>📍</span> Company Address
            </label>
            {isEditing ? (
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter full business address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            ) : (
              <div style={{ ...inputStyle, background: colors.bgInput, color: colors.textMuted, minHeight: '80px' }}>
                {orgData.address || 'Not set'}
              </div>
            )}
            <p style={helperStyle}>Full business address for invoices and correspondence.</p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${colors.border}`, margin: '24px 0' }}></div>

          {/* Company Logo Section */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '16px' }}>
              Company Logo
            </h3>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* Logo Preview */}
              <div style={{
                width: '120px',
                height: '120px',
                background: colors.bgInput,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <>
                    <span style={{ fontSize: '32px', opacity: 0.4, marginBottom: '8px' }}>🖼️</span>
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>No logo</span>
                  </>
                )}
              </div>

              {/* Upload Area */}
              {isEditing && (
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px',
                    border: `2px dashed ${colors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                  }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '24px', marginBottom: '12px' }}>⬆️</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>
                      Upload company logo
                    </span>
                    <span style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>
                      Drag and drop your logo here, or <span style={{ color: colors.accent, textDecoration: 'underline' }}>browse files</span>
                    </span>
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>
                      PNG, JPG, JPEG, WebP • Max 2MB • Recommended: 400x400px
                    </span>
                  </label>
                  
                  {logoPreview && (
                    <button
                      onClick={() => setLogoPreview('')}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: 'transparent',
                        border: `1px solid ${colors.red}`,
                        borderRadius: '6px',
                        color: colors.red,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Remove Logo
                    </button>
                  )}
                </div>
              )}

              {!isEditing && !logoPreview && (
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: colors.textMuted }}>
                    No logo uploaded. Click "Edit Settings" to upload your company logo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
