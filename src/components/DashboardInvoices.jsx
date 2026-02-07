import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardInvoices({ darkMode = true }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const colors = darkMode ? {
    bg: '#0f1419',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  };

  // Load invoices from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem('dayonetools_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Load customers from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('dayonetools_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionsMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(inv => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        inv.invoiceNumber?.toLowerCase().includes(query) ||
        inv.customerName?.toLowerCase().includes(query) ||
        inv.customerEmail?.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      const matchesClient = clientFilter === 'all' || inv.customerName === clientFilter || inv.customerId === clientFilter;
      
      const matchesDate = !dateFilter || inv.issueDate === dateFilter;
      
      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'createdAt' || sortBy === 'issueDate') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (sortBy === 'total') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      localStorage.setItem('dayonetools_invoices', JSON.stringify(invoices.filter(inv => inv.id !== id)));
    }
    setShowActionsMenu(null);
  };

  const handleViewInvoice = (invoice) => {
    // Navigate to invoice detail page
    navigate(`/dashboard/invoices/${invoice.id}`);
    setShowActionsMenu(null);
  };

  const handleEditInvoice = (invoice) => {
    // Store invoice data and navigate to creator for editing
    localStorage.setItem('dayonetools_edit_invoice', JSON.stringify(invoice));
    navigate('/dashboard/create');
    setShowActionsMenu(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: { bg: `${colors.green}20`, color: colors.green, label: 'Paid' },
      sent: { bg: `${colors.accent}20`, color: colors.accent, label: 'Sent' },
      pending: { bg: `${colors.yellow}20`, color: colors.yellow, label: 'Pending' },
      overdue: { bg: `${colors.red}20`, color: colors.red, label: 'Overdue' },
      cancelled: { bg: `${colors.red}20`, color: colors.red, label: 'Cancelled' },
      draft: { bg: `${colors.textMuted}20`, color: colors.textMuted, label: 'Draft' },
    };
    const style = styles[status] || styles.draft;
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '3px 8px',
        background: style.bg,
        color: style.color,
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
      }}>
        {style.label}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹' };
    return `${symbols[currency] || '$'}${parseFloat(amount || 0).toFixed(2)}`;
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
    borderRadius: '6px',
    color: colors.text,
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '14px',
    paddingRight: '36px',
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
            Invoices
          </h1>
          <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
            Manage and track your invoices
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: colors.accent,
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          + Create Invoice
        </button>
      </div>

      {/* Filters Row - integrated with table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottom: 'none',
        padding: '16px 20px',
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
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
            placeholder="Search by invoice number, client name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '40px' }}
          />
        </div>

        {/* Filter Row */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...selectStyle, flex: '0 0 130px', padding: '10px 12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Pick a date"
            style={{ ...inputStyle, flex: '0 0 150px', padding: '10px 12px' }}
          />

          {/* Sort & Display */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{ ...selectStyle, flex: '0 0 150px', padding: '10px 12px' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="total-desc">Amount: High to Low</option>
            <option value="total-asc">Amount: Low to High</option>
            <option value="invoiceNumber-asc">Invoice # A-Z</option>
            <option value="invoiceNumber-desc">Invoice # Z-A</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderTop: 'none',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        overflow: 'visible',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '36px 1.5fr 2fr 1.2fr 1fr 1.2fr 1.2fr 50px',
          gap: '10px',
          padding: '10px 16px',
          background: colors.bgInput,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: '10px',
          fontWeight: '600',
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          alignItems: 'center',
        }}>
          <div>
            <input 
              type="checkbox" 
              onChange={handleSelectAll}
              checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
              style={{ width: '14px', height: '14px', cursor: 'pointer' }}
            />
          </div>
          <div>📄 Invoice #</div>
          <div>👤 Client</div>
          <div>💰 Amount</div>
          <div>⏱️ Status</div>
          <div>📅 Issued Date</div>
          <div>🕐 Created</div>
          <div>⚙️</div>
        </div>

        {filteredInvoices.length === 0 ? (
          /* Empty State */
          <div style={{ 
            padding: '50px 20px', 
            textAlign: 'center',
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              margin: '0 auto 16px',
              background: colors.bgInput,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              📄
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: colors.text, marginBottom: '6px' }}>
              No invoices found
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '20px' }}>
              {searchQuery || statusFilter !== 'all' || clientFilter !== 'all' || dateFilter 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first invoice'}
            </p>
            {!searchQuery && statusFilter === 'all' && clientFilter === 'all' && !dateFilter && (
              <button
                onClick={() => navigate('/dashboard/create')}
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
                + Create Invoice
              </button>
            )}
          </div>
        ) : (
          /* Table Rows */
          filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1.5fr 2fr 1.2fr 1fr 1.2fr 1.2fr 50px',
                gap: '10px',
                padding: '12px 16px',
                borderBottom: `1px solid ${colors.border}`,
                alignItems: 'center',
                fontSize: '13px',
                color: colors.text,
                background: selectedInvoices.includes(invoice.id) ? `${colors.accent}10` : 'transparent',
              }}
            >
              {/* Checkbox */}
              <div>
                <input 
                  type="checkbox" 
                  checked={selectedInvoices.includes(invoice.id)}
                  onChange={() => handleSelectInvoice(invoice.id)}
                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                />
              </div>
              
              {/* Invoice # */}
              <div style={{ fontWeight: '500', color: colors.accent, fontSize: '12px' }}>
                {invoice.invoiceNumber || '—'}
              </div>
              
              {/* Client */}
              <div>
                <div style={{ fontWeight: '500', fontSize: '13px' }}>{invoice.customerName || '—'}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>
                  {invoice.customerEmail || ''}
                </div>
              </div>
              
              {/* Amount */}
              <div style={{ fontWeight: '600', fontSize: '13px' }}>
                {formatCurrency(invoice.total, invoice.currency)}
              </div>
              
              {/* Status */}
              <div>
                {getStatusBadge(invoice.status || 'draft')}
              </div>
              
              {/* Issued Date */}
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                {formatDate(invoice.issueDate)}
              </div>
              
              {/* Created */}
              <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                {formatDate(invoice.createdAt)}
              </div>
              
              {/* Actions */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowActionsMenu(showActionsMenu === invoice.id ? null : invoice.id); 
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    fontSize: '18px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  ⚙️
                </button>
                
                {showActionsMenu === invoice.id && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '100%',
                    marginBottom: '4px',
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '140px',
                    overflow: 'visible',
                  }}>
                    <button
                      onClick={() => handleViewInvoice(invoice)}
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
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleEditInvoice(invoice)}
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
                      onClick={() => {
                        // Download PDF logic here
                        setShowActionsMenu(null);
                      }}
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
                      📥 Download
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: colors.red,
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
          ))
        )}

        {/* Footer with count */}
        {filteredInvoices.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${colors.border}`,
            fontSize: '14px',
            color: colors.textMuted,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              {selectedInvoices.length > 0 
                ? `${selectedInvoices.length} invoice${selectedInvoices.length !== 1 ? 's' : ''} selected`
                : `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} total`
              }
            </div>
            {selectedInvoices.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedInvoices.length} selected invoice(s)?`)) {
                    const remaining = invoices.filter(inv => !selectedInvoices.includes(inv.id));
                    setInvoices(remaining);
                    localStorage.setItem('dayonetools_invoices', JSON.stringify(remaining));
                    setSelectedInvoices([]);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  background: colors.red,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Delete Selected
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
