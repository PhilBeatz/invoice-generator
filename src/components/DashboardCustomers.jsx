import React, { useState, useEffect } from 'react';

export default function DashboardCustomers({ darkMode = true }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    identifier: '',
    email: '',
    phone: '',
    zipCode: '',
    country: '',
    timezone: '',
    address: '',
    description: '',
  });

  // Country list for dropdown
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
    'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
    'Norway', 'Denmark', 'Finland', 'Ireland', 'Portugal', 'Poland', 'Czech Republic',
    'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Hong Kong', 'Taiwan',
    'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'South Africa', 'Nigeria',
    'Egypt', 'Israel', 'UAE', 'Saudi Arabia', 'Turkey', 'Russia', 'Ukraine', 'New Zealand',
  ].sort();

  // Timezone list
  const timezones = [
    { value: '', label: 'Select timezone' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
    { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
    { value: 'America/Vancouver', label: 'America/Vancouver (PST/PDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
    { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (CET/CEST)' },
    { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)' },
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
    { value: 'Europe/Zurich', label: 'Europe/Zurich (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (HKT)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
    { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const colors = darkMode ? {
    bg: '#1a1a2e',
    bgCard: '#252540',
    bgInput: '#1e1e32',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#374151',
    accent: '#10b981',
    accentHover: '#059669',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#10b981',
    accentHover: '#059669',
  };

  // Load customers from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('dayonetools_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  // Save customers to localStorage
  useEffect(() => {
    localStorage.setItem('dayonetools_customers', JSON.stringify(customers));
  }, [customers]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionsMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(c => {
      const query = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.identifier?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.country?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setNewCustomer({
      name: '',
      identifier: '',
      email: '',
      phone: '',
      zipCode: '',
      country: '',
      timezone: '',
      address: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({ ...customer });
    setShowModal(true);
    setShowActionsMenu(null);
  };

  const handleDeleteCustomer = (id) => {
    // Check if customer has invoices (for future use)
    const customer = customers.find(c => c.id === id);
    if (customer?.invoiceCount > 0) {
      alert('Cannot delete customer with existing invoices. Please delete or reassign their invoices first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
    setShowActionsMenu(null);
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name.trim()) {
      alert('Customer name is required');
      return;
    }
    if (!newCustomer.identifier.trim()) {
      alert('Customer ID is required');
      return;
    }

    // Check for duplicate identifier
    const existingCustomer = customers.find(c => 
      c.identifier.toLowerCase() === newCustomer.identifier.toLowerCase() && 
      c.id !== editingCustomer?.id
    );
    if (existingCustomer) {
      alert('A customer with this identifier already exists');
      return;
    }

    // Validate email if provided
    if (newCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (editingCustomer) {
      // Update existing
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id ? { ...newCustomer, id: c.id, createdAt: c.createdAt, invoiceCount: c.invoiceCount || 0 } : c
      ));
    } else {
      // Create new
      const id = Date.now().toString();
      const createdAt = new Date().toISOString();
      setCustomers(prev => [...prev, { ...newCustomer, id, createdAt, invoiceCount: 0 }]);
    }
    setShowModal(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
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
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, margin: 0 }}>
            Customers
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Manage your customer database
          </p>
        </div>
        <button
          onClick={handleCreateCustomer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'transparent',
            color: colors.accent,
            border: `1px solid ${colors.accent}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => { e.target.style.background = colors.accent; e.target.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.accent; }}
        >
          + Create Customer
        </button>
      </div>

      {/* Filters Card */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '16px' }}>
          Filters
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <span style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: colors.textMuted,
              fontSize: '14px',
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email, identifier, phone, country, or description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ ...inputStyle, paddingLeft: '40px' }}
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ ...selectStyle, flex: '0 0 120px' }}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="country">Country</option>
            <option value="identifier">ID</option>
            <option value="createdAt">Created</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ ...selectStyle, flex: '0 0 130px' }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ ...selectStyle, flex: '0 0 120px' }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Customers Table/List */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {paginatedCustomers.length === 0 ? (
          /* Empty State */
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👤</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>
              No customers found
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '20px' }}>
              {searchQuery ? 'Try a different search query' : 'Get started by creating your first customer'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateCustomer}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: colors.accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                + Create Customer
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.2fr 1.5fr 1.2fr 100px 110px 50px',
              gap: '12px',
              padding: '14px 20px',
              background: colors.bgInput,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: '12px',
              fontWeight: '600',
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <div>👤 Customer</div>
              <div>✉️ Email</div>
              <div>📞 Phone</div>
              <div>📍 Address</div>
              <div>🌍 Country</div>
              <div>📄 Invoices</div>
              <div>📅 Created</div>
              <div></div>
            </div>

            {/* Table Rows */}
            {paginatedCustomers.map((customer) => (
              <div
                key={customer.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.2fr 1.5fr 1.2fr 100px 110px 50px',
                  gap: '12px',
                  padding: '16px 20px',
                  borderBottom: `1px solid ${colors.border}`,
                  alignItems: 'center',
                  fontSize: '14px',
                  color: colors.text,
                }}
              >
                {/* Customer Name & ID */}
                <div>
                  <div style={{ fontWeight: '500' }}>{customer.name}</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>
                    ID: {customer.identifier || '—'}
                  </div>
                </div>
                
                {/* Email */}
                <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                  {customer.email || '—'}
                </div>
                
                {/* Phone */}
                <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                  {customer.phone || '—'}
                </div>
                
                {/* Address */}
                <div style={{ color: colors.textMuted, fontSize: '13px', lineHeight: '1.4' }}>
                  {customer.address ? (
                    <>
                      {customer.address}
                      {customer.zipCode && <>, {customer.zipCode}</>}
                    </>
                  ) : '—'}
                </div>
                
                {/* Country */}
                <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                  {customer.country || '—'}
                </div>
                
                {/* Invoices Count */}
                <div>
                  {(customer.invoiceCount || 0) > 0 ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: `${colors.accent}20`,
                      color: colors.accent,
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={{ color: colors.textMuted, fontSize: '13px' }}>—</span>
                  )}
                </div>
                
                {/* Created Date */}
                <div style={{ color: colors.textMuted, fontSize: '13px' }}>
                  {formatDate(customer.createdAt)}
                </div>
                
                {/* Actions Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setShowActionsMenu(showActionsMenu === customer.id ? null : customer.id); 
                    }}
                    style={{
                      padding: '6px 10px',
                      background: 'transparent',
                      border: 'none',
                      color: colors.textMuted,
                      fontSize: '18px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    ⋯
                  </button>
                  
                  {showActionsMenu === customer.id && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      background: colors.bgCard,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      zIndex: 100,
                      minWidth: '140px',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: colors.text,
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.target.style.background = colors.bgInput}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => e.target.style.background = colors.bgInput}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: `1px solid ${colors.border}`,
                fontSize: '14px',
                color: colors.textMuted,
              }}>
                <div>
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filteredCustomers.length)} of {filteredCustomers.length} customers
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px',
                      background: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: currentPage === 1 ? colors.textMuted : colors.text,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      background: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: currentPage === totalPages ? colors.textMuted : colors.text,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: `1px solid ${colors.border}`,
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
                  {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
                </h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
                  {editingCustomer ? 'Update customer information' : 'Add a new customer to your organization. Fields marked with * are required.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: '24px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Name & Customer ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      👤 Customer Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      # Customer ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.identifier}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, identifier: e.target.value }))}
                      placeholder="Enter unique identifier"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      ✉️ Email Address
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      📞 Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Row 3: ZIP Code & Country */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      📮 ZIP Code
                    </label>
                    <input
                      type="text"
                      value={newCustomer.zipCode}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="Enter ZIP code"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                      🌍 Country
                    </label>
                    <select
                      value={newCustomer.country}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, country: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Timezone */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                    🕐 Timezone
                  </label>
                  <select
                    value={newCustomer.timezone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, timezone: e.target.value }))}
                    style={selectStyle}
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Row 5: Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                    📍 Address
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter customer address"
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* Row 6: Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '6px' }}>
                    📝 Description
                  </label>
                  <textarea
                    value={newCustomer.description}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter customer description (optional)"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '20px',
              borderTop: `1px solid ${colors.border}`,
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                style={{
                  padding: '12px 24px',
                  background: colors.accent,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {editingCustomer ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
