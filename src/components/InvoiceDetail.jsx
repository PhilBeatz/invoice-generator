import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchInvoiceById, updateInvoice as updateInvoiceDb,
  fetchSharesForInvoice, createShare, deleteShare as deleteShareDb,
  fetchEmailsForInvoice, sendInvoiceEmail,
} from '../supabaseService';

export default function InvoiceDetail({ darkMode = true, user }) {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePasswordEnabled, setSharePasswordEnabled] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [showSharePassword, setShowSharePassword] = useState(false);
  const [shareExpirationEnabled, setShareExpirationEnabled] = useState(false);
  const [shareExpiration, setShareExpiration] = useState('');
  const [shareLimitViewsEnabled, setShareLimitViewsEnabled] = useState(false);
  const [shareLimitViews, setShareLimitViews] = useState(100);
  // Manage shares
  const [showManageShares, setShowManageShares] = useState(false);
  const [shares, setShares] = useState([]);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const [confirmDeleteShareId, setConfirmDeleteShareId] = useState(null);
  // Send email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailHistory, setEmailHistory] = useState([]);
  // More actions
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

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
    const loadData = async () => {
      try {
        const inv = await fetchInvoiceById(invoiceId);
        setInvoice(inv);
        setDescriptionText(inv.description || `Invoice for ${inv.customerName || 'Customer'}`);
        setEmailTo(inv.customerEmail || '');

        const shareData = await fetchSharesForInvoice(invoiceId);
        setShares(shareData);

        const emailData = await fetchEmailsForInvoice(invoiceId);
        setEmailHistory(emailData);
      } catch (e) {
        console.error('Error loading invoice:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [invoiceId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.status-dropdown-container')) setShowStatusDropdown(false);
      if (!e.target.closest('.more-dropdown-container')) setShowMoreDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update invoice in Supabase
  const updateInvoice = async (updates) => {
    try {
      const updated = await updateInvoiceDb(invoiceId, updates);
      setInvoice(updated);
    } catch (e) {
      console.error('Error updating invoice:', e);
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

  // Share functions
  const handleCreateShareLink = async () => {
    try {
      if (!user) return;
      const newShare = await createShare(invoiceId, user.id, {
        createdBy: 'You',
        passwordProtected: sharePasswordEnabled,
        password: sharePasswordEnabled ? sharePassword : null,
        expiresAt: shareExpirationEnabled && shareExpiration ? new Date(shareExpiration).toISOString() : null,
        viewLimit: shareLimitViewsEnabled ? shareLimitViews : null,
      });
      setShares(prev => [newShare, ...prev]);
      setSharePasswordEnabled(false); setSharePassword(''); setShareExpirationEnabled(false); setShareExpiration('');
      setShareLimitViewsEnabled(false); setShareLimitViews(100); setShowShareModal(false); setShowManageShares(true);
    } catch (e) {
      console.error('Error creating share:', e);
    }
  };

  const handleDeleteShare = async (shareId) => {
    try {
      await deleteShareDb(shareId);
      setShares(prev => prev.filter(s => s.id !== shareId));
      setConfirmDeleteShareId(null);
    } catch (e) {
      console.error('Error deleting share:', e);
    }
  };

  const getShareStatus = (share) => {
    if (share.status === 'revoked') return { label: 'Revoked', color: colors.red };
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) return { label: 'Expired', color: colors.yellow };
    if (share.viewLimit && share.viewCount >= share.viewLimit) return { label: 'View Limit Reached', color: colors.yellow };
    return { label: 'Active', color: colors.green };
  };

  const getShareUrl = (share) => `${window.location.origin}/share/invoice/${share.token}`;

  const handleCopyShareLink = (share) => {
    navigator.clipboard.writeText(getShareUrl(share)).then(() => { setCopiedShareId(share.id); setTimeout(() => setCopiedShareId(null), 2000); });
  };

  // Email functions
  const handleSendEmail = async () => {
    if (!emailTo.trim()) return;
    try {
      if (!user) return;
      const emailRecord = await sendInvoiceEmail(invoiceId, user.id, {
        to: emailTo,
        message: emailMessage,
        sentBy: 'You',
      });
      setEmailHistory(prev => [emailRecord, ...prev]);
      setShowEmailModal(false); setEmailMessage('');
    } catch (e) {
      console.error('Error sending email:', e);
      alert('Failed to send email. Please try again.');
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `about ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
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
    if (!invoice) return;
    import('../invoicePdfUtils').then(({ downloadInvoicePDF }) => {
      downloadInvoicePDF(invoice);
    });
  };

  const handleViewPDF = () => {
    if (!invoice) return;
    import('../invoicePdfUtils').then(({ viewInvoicePDF }) => {
      viewInvoicePDF(invoice);
    });
  };

  const handleEdit = () => {
    navigate(`/dashboard/create?edit=${invoiceId}`);
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowShareModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
          >📤 Share PDF</button>
          <button
            onClick={handleEdit}
            disabled={invoice.status === 'cancelled'}
            title={invoice.status === 'cancelled' ? 'Cannot edit cancelled invoices' : 'Edit invoice'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: 'transparent', color: invoice.status === 'cancelled' ? colors.textMuted : colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: invoice.status === 'cancelled' ? 'not-allowed' : 'pointer', opacity: invoice.status === 'cancelled' ? 0.5 : 1 }}
          >✏️ Edit</button>
          <div className="more-dropdown-container" style={{ position: 'relative' }}>
            <button onClick={(e) => { e.stopPropagation(); setShowMoreDropdown(!showMoreDropdown); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', background: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>▾</button>
            {showMoreDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 200, minWidth: '180px', overflow: 'hidden', padding: '4px 0' }}>
                <button onClick={() => { setShowMoreDropdown(false); handleViewPDF(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>👁️ View PDF</button>
                <button onClick={() => { setShowMoreDropdown(false); setShowManageShares(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>📋 Manage Shares</button>
                <button onClick={() => { setShowMoreDropdown(false); setShowEmailModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>✉️ Send via Email</button>
              </div>
            )}
          </div>
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
                onClick={handleViewPDF}
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
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>Email History</h3>
            {emailHistory.length === 0 ? (
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>No emails have been sent for this invoice yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{emailHistory.length} email{emailHistory.length > 1 ? 's' : ''} sent for this invoice</p>
                {emailHistory.map(email => (
                  <div key={email.id} style={{ padding: '10px', background: colors.bgInput, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500', marginBottom: '4px' }}>✉️ {email.to}</div>
                    <span style={{ display: 'inline-block', padding: '2px 8px', background: `${colors.green}20`, color: colors.green, borderRadius: '4px', fontSize: '11px', fontWeight: '500', marginBottom: '4px' }}>{email.type}</span>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>📅 {formatRelativeTime(email.sentAt)} &nbsp; 👤 {email.sentBy}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== SHARE INVOICE MODAL ===== */}
      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowShareModal(false)}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>🔗 Share Invoice</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Create a secure share link for <strong style={{ color: colors.text }}>Invoice #{invoice.invoiceNumber}</strong></p>
              </div>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Password Protection */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: colors.text, fontWeight: '500' }}>
                <input type="checkbox" checked={sharePasswordEnabled} onChange={(e) => setSharePasswordEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: colors.green }} />
                🔒 Password Protection
              </label>
              {sharePasswordEnabled && (
                <div style={{ marginLeft: '28px' }}>
                  <div style={{ position: 'relative' }}>
                    <input type={showSharePassword ? 'text' : 'password'} value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} placeholder="Enter password (min 4 characters)" style={{ width: '100%', padding: '10px 40px 10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                    <button onClick={() => setShowSharePassword(!showSharePassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '16px' }}>{showSharePassword ? '👁️' : '👁️‍🗨️'}</button>
                  </div>
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Recipients will need this password to access the invoice</p>
                </div>
              )}
              {/* Set Expiration */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: colors.text, fontWeight: '500' }}>
                <input type="checkbox" checked={shareExpirationEnabled} onChange={(e) => setShareExpirationEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: colors.green }} />
                ⏳ Set Expiration
              </label>
              {shareExpirationEnabled && (
                <div style={{ marginLeft: '28px' }}>
                  <input type="datetime-local" value={shareExpiration} onChange={(e) => setShareExpiration(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Link will expire and become inaccessible after this date.</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[{ label: '1 hour', h: 1 }, { label: '1 day', h: 24 }, { label: '1 week', h: 168 }].map(opt => (
                      <button key={opt.label} onClick={() => setShareExpiration(new Date(Date.now() + opt.h * 3600000).toISOString().slice(0, 16))} style={{ padding: '6px 12px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '12px', cursor: 'pointer' }}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {/* Permanent warning */}
              {!shareExpirationEnabled && (
                <div style={{ padding: '12px 16px', background: `${colors.yellow}15`, border: `1px solid ${colors.yellow}40`, borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', color: colors.yellow, margin: 0 }}><strong>Permanent Share:</strong> This invoice will be always publicly accessible to anyone with the link.</p>
                </div>
              )}
              {/* Limit Views */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: colors.text, fontWeight: '500' }}>
                <input type="checkbox" checked={shareLimitViewsEnabled} onChange={(e) => setShareLimitViewsEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: colors.green }} />
                👥 Limit Views
              </label>
              {shareLimitViewsEnabled && (
                <div style={{ marginLeft: '28px' }}>
                  <input type="number" min={1} max={10000} value={shareLimitViews} onChange={(e) => setShareLimitViews(Number(e.target.value))} style={{ width: '100%', padding: '10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                  <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>Link will become inaccessible after this many downloads/views</p>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowShareModal(false)} style={{ padding: '10px 20px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateShareLink} disabled={sharePasswordEnabled && sharePassword.length < 4} style={{ padding: '10px 20px', background: sharePasswordEnabled && sharePassword.length < 4 ? colors.bgInput : colors.green, border: 'none', borderRadius: '6px', color: sharePasswordEnabled && sharePassword.length < 4 ? colors.textMuted : '#fff', fontSize: '14px', fontWeight: '500', cursor: sharePasswordEnabled && sharePassword.length < 4 ? 'not-allowed' : 'pointer' }}>Create Share Link</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANAGE SHARES MODAL ===== */}
      {showManageShares && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => { setShowManageShares(false); setConfirmDeleteShareId(null); }}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>🔗 Manage Shares</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Manage existing share links for <strong style={{ color: colors.text }}>Invoice #{invoice.invoiceNumber}</strong></p>
              </div>
              <button onClick={() => { setShowManageShares(false); setConfirmDeleteShareId(null); }} style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
              {shares.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>🔗</div>
                  <p style={{ color: colors.textMuted, fontSize: '14px' }}>No share links created yet</p>
                  <button onClick={() => { setShowManageShares(false); setShowShareModal(true); }} style={{ marginTop: '12px', padding: '10px 20px', background: colors.green, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>+ Create Share Link</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {shares.map(share => {
                    const ss = getShareStatus(share);
                    return (
                      <div key={share.id} style={{ padding: '16px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-block', padding: '3px 8px', background: `${ss.color}20`, color: ss.color, borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{ss.label}</span>
                            {!share.expiresAt && <span style={{ display: 'inline-block', padding: '3px 8px', background: `${colors.accent}20`, color: colors.accent, borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Public</span>}
                            {share.passwordProtected && <span style={{ display: 'inline-block', padding: '3px 8px', background: `${colors.yellow}20`, color: colors.yellow, borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>🔒 Protected</span>}
                          </div>
                          {confirmDeleteShareId === share.id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => setConfirmDeleteShareId(null)} style={{ padding: '4px 10px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '4px', color: colors.text, fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                              <button onClick={() => handleDeleteShare(share.id)} style={{ padding: '4px 10px', background: colors.red, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteShareId(share.id)} style={{ padding: '4px 8px', background: `${colors.red}20`, border: 'none', borderRadius: '4px', color: colors.red, fontSize: '14px', cursor: 'pointer' }}>🗑</button>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '10px' }}>Created {formatRelativeTime(share.createdAt)} by {share.createdBy}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '10px' }}>
                          <div><span style={{ color: colors.textMuted }}>⏳ Expires: </span><span style={{ color: colors.text }}>{share.expiresAt ? formatDateTime(share.expiresAt) : 'Never'}</span></div>
                          <div><span style={{ color: colors.textMuted }}>👥 Views: </span><span style={{ color: colors.text }}>{share.viewCount}{share.viewLimit ? ` / ${share.viewLimit}` : ' (unlimited)'}</span></div>
                          <div><span style={{ color: colors.textMuted }}>👁️ Last viewed: </span><span style={{ color: colors.text }}>{share.lastViewedAt ? formatRelativeTime(share.lastViewedAt) : 'Never'}</span></div>
                          <div><span style={{ color: colors.textMuted }}>📅 Created: </span><span style={{ color: colors.text }}>{formatDate(share.createdAt)}</span></div>
                        </div>
                        {ss.label === 'Active' && (
                          <div>
                            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Share URL:</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input readOnly value={getShareUrl(share)} style={{ flex: 1, padding: '8px 10px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '12px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                              <button onClick={() => handleCopyShareLink(share)} style={{ padding: '8px 12px', background: copiedShareId === share.id ? colors.green : colors.bgInput, border: `1px solid ${copiedShareId === share.id ? colors.green : colors.border}`, borderRadius: '6px', color: copiedShareId === share.id ? '#fff' : colors.text, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {copiedShareId === share.id ? '✓ Copied' : '📋 Copy'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { setShowManageShares(false); setConfirmDeleteShareId(null); }} style={{ padding: '12px 0', background: colors.green, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEND VIA EMAIL MODAL ===== */}
      {showEmailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowEmailModal(false)}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>Send Invoice via Email</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Send invoice {invoice.invoiceNumber} to your customer via email with PDF attachment.</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.text, display: 'block', marginBottom: '6px' }}>Recipient Email</label>
                <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="customer@example.com" style={{ width: '100%', padding: '10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: colors.text, display: 'block', marginBottom: '6px' }}>Custom Message (Optional)</label>
                <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value.slice(0, 500))} placeholder="Thanks for your order." style={{ width: '100%', padding: '10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>{emailMessage.length}/500 characters</div>
              </div>
              <div style={{ padding: '12px 16px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '6px' }}>What will be sent:</p>
                <ul style={{ fontSize: '12px', color: colors.textMuted, margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Professional email with invoice details</li>
                  <li>PDF attachment of the invoice</li>
                  <li>Secure link to view invoice online</li>
                  {emailMessage && <li>Your custom message (if provided)</li>}
                </ul>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowEmailModal(false)} style={{ padding: '10px 20px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendEmail} disabled={!emailTo.trim()} style={{ padding: '10px 20px', background: !emailTo.trim() ? colors.bgInput : colors.accent, border: 'none', borderRadius: '6px', color: !emailTo.trim() ? colors.textMuted : '#fff', fontSize: '14px', fontWeight: '500', cursor: !emailTo.trim() ? 'not-allowed' : 'pointer' }}>Send Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
