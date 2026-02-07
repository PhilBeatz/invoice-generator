import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function InvoiceDetail({ darkMode = true }) {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
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
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  };

  useEffect(() => {
    // Load invoice from localStorage
    const savedInvoices = localStorage.getItem('dayonetools_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const found = invoices.find(inv => inv.id === invoiceId);
      setInvoice(found);
      if (found) {
        setDescriptionText(found.description || `Invoice for ${found.customerName || 'Customer'}`);
      }
    }
    setLoading(false);
  }, [invoiceId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowStatusDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update invoice in localStorage
  const updateInvoice = (updates) => {
    const savedInvoices = localStorage.getItem('dayonetools_invoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      const index = invoices.findIndex(inv => inv.id === invoiceId);
      if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('dayonetools_invoices', JSON.stringify(invoices));
        setInvoice(invoices[index]);
      }
    }
  };

  const handleStatusChange = (newStatus) => {
    updateInvoice({ status: newStatus });
    setShowStatusDropdown(false);
  };

  const handleSaveDescription = () => {
    updateInvoice({ description: descriptionText });
    setEditingDescription(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: { bg: `${colors.green}20`, color: colors.green, label: 'Paid', dot: colors.green },
      sent: { bg: `${colors.accent}20`, color: colors.accent, label: 'Sent', dot: colors.accent },
      pending: { bg: `${colors.yellow}20`, color: colors.yellow, label: 'Pending', dot: colors.yellow },
      overdue: { bg: `${colors.red}20`, color: colors.red, label: 'Overdue', dot: colors.red },
      cancelled: { bg: `${colors.red}20`, color: colors.red, label: 'Cancelled', dot: colors.red },
      draft: { bg: `${colors.textMuted}20`, color: colors.textMuted, label: 'Draft', dot: colors.textMuted },
    };
    const style = styles[status] || styles.draft;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.dot }}></span>
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDownloadPDF = () => {
    // Store invoice data and navigate to create page with download trigger
    localStorage.setItem('dayonetools_view_invoice', JSON.stringify(invoice));
    // For now, just alert - we can integrate with the actual PDF generator later
    alert('PDF download functionality will be integrated with the invoice generator.');
  };

  const handleEdit = () => {
    localStorage.setItem('dayonetools_edit_invoice', JSON.stringify(invoice));
    navigate('/dashboard/create');
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
        Loading...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: colors.text, marginBottom: '16px' }}>Invoice not found</h2>
        <Link to="/dashboard/invoices" style={{ color: colors.accent }}>
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  const cardStyle = {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: '3px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle = {
    fontSize: '13px',
    color: colors.text,
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ 
        fontSize: '11px', 
        color: colors.textMuted, 
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Link to="/dashboard" style={{ color: colors.textMuted, textDecoration: 'none' }}>Dashboard</Link>
        <span>›</span>
        <Link to="/dashboard/invoices" style={{ color: colors.textMuted, textDecoration: 'none' }}>Invoices</Link>
        <span>›</span>
        <span style={{ color: colors.accent }}>{invoice.invoiceNumber}</span>
      </div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/dashboard/invoices" 
            style={{ 
              color: colors.accent, 
              textDecoration: 'none',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Back
          </Link>
          <h1 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>
            Invoice #{invoice.invoiceNumber}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => alert('Share PDF feature coming soon!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            📤 Share PDF
          </button>
          <button
            onClick={handleEdit}
            disabled={invoice.status === 'cancelled'}
            title={invoice.status === 'cancelled' ? 'Cannot edit cancelled invoices' : 'Edit invoice'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              background: 'transparent',
              color: invoice.status === 'cancelled' ? colors.textMuted : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: invoice.status === 'cancelled' ? 'not-allowed' : 'pointer',
              opacity: invoice.status === 'cancelled' ? 0.5 : 1,
            }}
          >
            ✏️ Edit
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Left Column */}
        <div>
          {/* Invoice Details Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📄 Invoice Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <span style={labelStyle}>Invoice Number</span>
                <div style={valueStyle}>{invoice.invoiceNumber}</div>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={labelStyle}>Status</span>
                <div 
                  onClick={(e) => { e.stopPropagation(); setShowStatusDropdown(!showStatusDropdown); }}
                  style={{ cursor: 'pointer' }}
                >
                  {getStatusBadge(invoice.status || 'draft')}
                </div>
                {showStatusDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    minWidth: '140px',
                    overflow: 'hidden',
                  }}>
                    {['draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          background: invoice.status === status ? colors.bgInput : 'transparent',
                          border: 'none',
                          color: colors.text,
                          fontSize: '14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={labelStyle}>Issued Date</span>
              <div style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 {formatDate(invoice.issueDate)}
              </div>
            </div>

            {invoice.dueDate && (
              <div style={{ marginBottom: '20px' }}>
                <span style={labelStyle}>Due Date</span>
                <div style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 {formatDate(invoice.dueDate)}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ 
              borderTop: `1px solid ${colors.border}`, 
              paddingTop: '20px',
              marginTop: '20px',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ fontWeight: '600', color: colors.text }}>Description</span>
                <button 
                  onClick={() => setEditingDescription(!editingDescription)}
                  style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer' }}
                >
                  ✏️
                </button>
              </div>
              {editingDescription ? (
                <div>
                  <textarea
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: colors.text,
                      fontSize: '14px',
                      resize: 'vertical',
                      minHeight: '60px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={handleSaveDescription}
                      style={{
                        padding: '6px 12px',
                        background: colors.green,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingDescription(false); setDescriptionText(invoice.description || ''); }}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: colors.textMuted,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
                  {invoice.description || `Invoice for ${invoice.customerName || 'Customer'}`}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Summary Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🧾 Invoice Summary
            </h3>

            {/* Items Table */}
            <div style={{ 
              border: `1px solid ${colors.border}`, 
              borderRadius: '8px', 
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              {/* Table Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '12px',
                padding: '12px 16px',
                background: colors.bgInput,
                fontSize: '12px',
                fontWeight: '600',
                color: colors.textMuted,
                textTransform: 'uppercase',
              }}>
                <div>Product</div>
                <div>Model</div>
                <div style={{ textAlign: 'right' }}>Price</div>
                <div style={{ textAlign: 'right' }}>Quantity</div>
                <div style={{ textAlign: 'right' }}>Total</div>
              </div>

              {/* Table Rows */}
              {(invoice.items || []).map((item, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '12px',
                    padding: '12px 16px',
                    borderTop: `1px solid ${colors.border}`,
                    fontSize: '14px',
                    color: colors.text,
                  }}
                >
                  <div>{item.description || item.name || '—'}</div>
                  <div style={{ color: colors.textMuted }}>{item.model || '—'}</div>
                  <div style={{ textAlign: 'right' }}>{formatCurrency(item.rate || item.price, invoice.currency)}</div>
                  <div style={{ textAlign: 'right' }}>{item.quantity || item.qty || 1}</div>
                  <div style={{ textAlign: 'right' }}>{formatCurrency(item.amount || (item.rate * item.quantity), invoice.currency)}</div>
                </div>
              ))}

              {(invoice.items || []).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted }}>
                  No items
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ 
              background: colors.bgInput, 
              borderRadius: '8px', 
              padding: '16px',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                color: colors.textMuted,
                fontSize: '14px',
              }}>
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal || invoice.total, invoice.currency)}</span>
              </div>
              
              {invoice.shipping > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  color: colors.textMuted,
                  fontSize: '14px',
                }}>
                  <span>Shipping</span>
                  <span>{formatCurrency(invoice.shipping, invoice.currency)}</span>
                </div>
              )}
              
              {invoice.discount > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  color: colors.textMuted,
                  fontSize: '14px',
                }}>
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discount, invoice.currency)}</span>
                </div>
              )}
              
              {invoice.tax > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  color: colors.textMuted,
                  fontSize: '14px',
                }}>
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.tax, invoice.currency)}</span>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: `1px solid ${colors.border}`,
                marginTop: '8px',
              }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              👤 Customer Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={labelStyle}>👤 Name</span>
                <div style={valueStyle}>{invoice.customerName || '—'}</div>
              </div>
              <div>
                <span style={labelStyle}>✉️ Email</span>
                <div style={valueStyle}>{invoice.customerEmail || '—'}</div>
              </div>
              {invoice.customerPhone && (
                <div>
                  <span style={labelStyle}>📞 Phone</span>
                  <div style={valueStyle}>{invoice.customerPhone}</div>
                </div>
              )}
              {invoice.customerAddress && (
                <div>
                  <span style={labelStyle}>📍 Address</span>
                  <div style={valueStyle}>{invoice.customerAddress}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div>
          {/* Total Amount Card */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.textMuted, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              💰 Total Amount
            </h3>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: colors.text,
            }}>
              {invoice.currency || 'USD'} {parseFloat(invoice.total || 0).toFixed(2)}
            </div>
          </div>

          {/* PDF Document Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.textMuted, 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📄 PDF Document
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: colors.bgInput,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                ⬇️ Download PDF
              </button>
              <button
                onClick={() => alert('View PDF feature coming soon!')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: colors.accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                👁️ View Invoice (PDF)
              </button>
            </div>
          </div>

          {/* Timeline Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.textMuted, 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🕐 Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: colors.accent,
                  marginTop: '4px',
                }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>Created</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>
                    {formatDateTime(invoice.createdAt)}
                  </div>
                </div>
              </div>
              {invoice.updatedAt && invoice.updatedAt !== invoice.createdAt && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: colors.green,
                    marginTop: '4px',
                  }}></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>Last Updated</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>
                      {formatDateTime(invoice.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email History Card */}
          <div style={cardStyle}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.text, 
              marginBottom: '8px',
            }}>
              Email History
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
              No emails have been sent for this invoice yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
